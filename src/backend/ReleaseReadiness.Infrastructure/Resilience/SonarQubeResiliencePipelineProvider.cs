using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Polly;
using Polly.CircuitBreaker;
using Polly.Fallback;
using Polly.RateLimiting;
using Polly.Retry;
using Polly.Timeout;
using ReleaseReadiness.Domain.Entities;
using ReleaseReadiness.Domain.Enums;
using ReleaseReadiness.Infrastructure.Caching;

namespace ReleaseReadiness.Infrastructure.Resilience;

public interface ISonarQubeResiliencePipelineProvider
{
    ResiliencePipeline<StageFixtureData> Pipeline { get; }
}

/// <summary>
/// Builds the Polly v8 resilience pipeline demonstrated around <see cref="SonarQubeMockClient"/>:
/// Fallback (outermost, serves last-known-good from <see cref="ICacheService"/> or a
/// degraded result) wrapping Retry (3x exponential backoff with jitter) wrapping
/// Circuit Breaker (opens after N failures, 30s reset) wrapping Timeout (10s) wrapping
/// a Bulkhead-style concurrency limiter (max 10 concurrent calls).
/// </summary>
public sealed class SonarQubeResiliencePipelineProvider : ISonarQubeResiliencePipelineProvider
{
    private const string CacheKey = "stage:SonarQube:last-known-good";

    public ResiliencePipeline<StageFixtureData> Pipeline { get; }

    public SonarQubeResiliencePipelineProvider(
        IOptions<ResilienceOptions> resilienceOptions,
        ICacheService cache,
        ILogger<SonarQubeResiliencePipelineProvider> logger)
    {
        var options = resilienceOptions.Value;

        Pipeline = new ResiliencePipelineBuilder<StageFixtureData>()
            .AddFallback(new FallbackStrategyOptions<StageFixtureData>
            {
                FallbackAction = async args =>
                {
                    var cached = await cache.GetAsync<StageFixtureData>(CacheKey, CancellationToken.None).ConfigureAwait(false);
                    if (cached is not null)
                    {
                        return Outcome.FromResult(cached);
                    }

                    var degraded = new StageFixtureData(
                        StageStatus.Unavailable,
                        RiskLevel.Medium,
                        new[] { "SonarQube service unavailable; no cached result available, serving degraded default." },
                        "SonarQube mock client failed after retries and the circuit breaker path; no last-known-good result was cached.",
                        "Retry the assessment once the SonarQube data source is reachable.");
                    return Outcome.FromResult(degraded);
                },
                OnFallback = args =>
                {
                    logger.LogWarning(args.Outcome.Exception, "SonarQube resilience pipeline: fallback triggered.");
                    return default;
                }
            })
            .AddRetry(new RetryStrategyOptions<StageFixtureData>
            {
                MaxRetryAttempts = options.RetryCount,
                BackoffType = DelayBackoffType.Exponential,
                UseJitter = true,
                Delay = TimeSpan.FromMilliseconds(200),
                OnRetry = args =>
                {
                    logger.LogWarning(
                        "SonarQube resilience pipeline: retry attempt {AttemptNumber} after {Delay}ms.",
                        args.AttemptNumber + 1,
                        args.RetryDelay.TotalMilliseconds);
                    return default;
                }
            })
            .AddCircuitBreaker(new CircuitBreakerStrategyOptions<StageFixtureData>
            {
                FailureRatio = 1.0,
                MinimumThroughput = Math.Max(2, options.CircuitBreakerThreshold),
                SamplingDuration = TimeSpan.FromSeconds(30),
                BreakDuration = TimeSpan.FromSeconds(30),
                OnOpened = args =>
                {
                    logger.LogError("SonarQube resilience pipeline: circuit breaker OPENED for {BreakDuration}.", args.BreakDuration);
                    return default;
                },
                OnClosed = args =>
                {
                    logger.LogInformation("SonarQube resilience pipeline: circuit breaker CLOSED.");
                    return default;
                }
            })
            .AddTimeout(new TimeoutStrategyOptions
            {
                Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds),
                OnTimeout = args =>
                {
                    logger.LogWarning("SonarQube resilience pipeline: call timed out after {Timeout}.", args.Timeout);
                    return default;
                }
            })
            .AddConcurrencyLimiter(permitLimit: 10, queueLimit: 0)
            .Build();
    }
}
