namespace ReleaseReadiness.Infrastructure.Resilience;

/// <summary>Binds the <c>Resilience</c> appsettings section used to configure the Polly pipelines.</summary>
public sealed class ResilienceOptions
{
    public const string SectionName = "Resilience";

    public int RetryCount { get; set; } = 3;

    public int CircuitBreakerThreshold { get; set; } = 5;

    public int TimeoutSeconds { get; set; } = 10;
}
