using Microsoft.Extensions.Options;
using ReleaseReadiness.Domain.Entities;
using ReleaseReadiness.Domain.Repositories;
using ReleaseReadiness.Infrastructure.Caching;
using ReleaseReadiness.Infrastructure.MockData;
using ReleaseReadiness.Infrastructure.Resilience;

namespace ReleaseReadiness.Infrastructure.Repositories;

// Each repository below is a thin binding of one JSON fixture to its Domain interface.
// JsonStageRepositoryBase.GetStageDataAsync already satisfies IStageDataRepository, so
// every subclass only needs to name its fixture file.

public sealed class JiraRepository : JsonStageRepositoryBase, IJiraRepository
{
    public JiraRepository(IMockDataProvider dataProvider, IOptions<MockDataOptions> options)
        : base(dataProvider, options, "jira-stories.json")
    {
    }
}

public sealed class GitHubRepository : JsonStageRepositoryBase, IGitHubRepository
{
    public GitHubRepository(IMockDataProvider dataProvider, IOptions<MockDataOptions> options)
        : base(dataProvider, options, "pull-requests.json")
    {
    }
}

/// <summary>
/// Unlike the other stage repositories, SonarQube goes through <see cref="SonarQubeMockClient"/>
/// wrapped in the Polly v8 resilience pipeline from <see cref="ISonarQubeResiliencePipelineProvider"/>
/// -- this is the "one sample mock external service" the resilience patterns are
/// demonstrated against. Every successful call also refreshes the last-known-good cache
/// entry the pipeline's Fallback strategy reads from.
/// </summary>
public sealed class SonarQubeRepository : ISonarQubeRepository
{
    private const string CacheKey = "stage:SonarQube:last-known-good";

    private readonly SonarQubeMockClient _client;
    private readonly ISonarQubeResiliencePipelineProvider _pipelineProvider;
    private readonly ICacheService _cache;

    public SonarQubeRepository(SonarQubeMockClient client, ISonarQubeResiliencePipelineProvider pipelineProvider, ICacheService cache)
    {
        _client = client;
        _pipelineProvider = pipelineProvider;
        _cache = cache;
    }

    public async Task<StageFixtureData> GetStageDataAsync(string releaseId, CancellationToken cancellationToken)
    {
        return await _pipelineProvider.Pipeline.ExecuteAsync(async ct =>
        {
            var result = await _client.GetQualityGateResultAsync(releaseId, ct).ConfigureAwait(false);
            await _cache.SetAsync(CacheKey, result, TimeSpan.FromMinutes(30), ct).ConfigureAwait(false);
            return result;
        }, cancellationToken).ConfigureAwait(false);
    }
}

public sealed class TestResultsRepository : JsonStageRepositoryBase, ITestResultsRepository
{
    public TestResultsRepository(IMockDataProvider dataProvider, IOptions<MockDataOptions> options)
        : base(dataProvider, options, "test-results.json")
    {
    }
}

public sealed class AzureMonitorRepository : JsonStageRepositoryBase, IAzureMonitorRepository
{
    public AzureMonitorRepository(IMockDataProvider dataProvider, IOptions<MockDataOptions> options)
        : base(dataProvider, options, "azure-monitor.json")
    {
    }
}

public sealed class OwaspComplianceRepository : JsonStageRepositoryBase, IOwaspComplianceRepository
{
    public OwaspComplianceRepository(IMockDataProvider dataProvider, IOptions<MockDataOptions> options)
        : base(dataProvider, options, "owasp-results.json")
    {
    }
}

public sealed class DeploymentConfigRepository : JsonStageRepositoryBase, IDeploymentConfigRepository
{
    public DeploymentConfigRepository(IMockDataProvider dataProvider, IOptions<MockDataOptions> options)
        : base(dataProvider, options, "deployment-config.json")
    {
    }
}

public sealed class StressTestRepository : JsonStageRepositoryBase, IStressTestRepository
{
    public StressTestRepository(IMockDataProvider dataProvider, IOptions<MockDataOptions> options)
        : base(dataProvider, options, "stress-test-results.json")
    {
    }
}
