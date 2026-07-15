using Microsoft.Extensions.Options;
using ReleaseReadiness.Domain.Entities;
using ReleaseReadiness.Infrastructure.MockData;

namespace ReleaseReadiness.Infrastructure.Resilience;

/// <summary>
/// Stands in for a real SonarQube REST API call. This is the "mock external service
/// boundary" that the Polly resilience pipeline in <see cref="SonarQubeResiliencePipelineProvider"/>
/// wraps -- it simulates network latency so the pipeline (retry/circuit-breaker/timeout/
/// bulkhead/fallback) is exercising something realistic even though the payload comes
/// from a local fixture. TECHNICAL DEBT: replace the fixture read with an
/// <c>HttpClient</c> call to the real SonarQube API.
/// </summary>
public sealed class SonarQubeMockClient
{
    private const string FileName = "sonarqube-results.json";

    private readonly IMockDataProvider _dataProvider;
    private readonly MockDataOptions _options;

    public SonarQubeMockClient(IMockDataProvider dataProvider, IOptions<MockDataOptions> options)
    {
        _dataProvider = dataProvider;
        _options = options.Value;
    }

    public async Task<StageFixtureData> GetQualityGateResultAsync(string releaseId, CancellationToken cancellationToken)
    {
        // Simulate an external network round trip so the resilience pipeline has
        // something to time/retry around.
        await Task.Delay(TimeSpan.FromMilliseconds(15), cancellationToken).ConfigureAwait(false);

        var document = await _dataProvider.LoadAsync(FileName, cancellationToken).ConfigureAwait(false);
        return StageFixtureJsonParser.ParseScenario(document, _options.ScenarioFor(releaseId));
    }
}
