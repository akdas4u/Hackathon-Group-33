using Microsoft.Extensions.Options;
using ReleaseReadiness.Domain.Entities;
using ReleaseReadiness.Infrastructure.MockData;

namespace ReleaseReadiness.Infrastructure.Repositories;

/// <summary>
/// Shared plumbing for every per-stage repository: read the fixture's
/// <c>summary.scenarios.&lt;Scenario&gt;</c> node and map it to
/// <see cref="StageFixtureData"/>. The scenario is resolved per release via
/// <c>MockData:ReleaseScenarios</c> in appsettings, falling back to the global
/// <c>MockData:Scenario</c> for unmapped releases.
/// </summary>
public abstract class JsonStageRepositoryBase
{
    private readonly IMockDataProvider _dataProvider;
    private readonly MockDataOptions _options;
    private readonly string _fileName;

    protected JsonStageRepositoryBase(IMockDataProvider dataProvider, IOptions<MockDataOptions> options, string fileName)
    {
        _dataProvider = dataProvider;
        _options = options.Value;
        _fileName = fileName;
    }

    public async Task<StageFixtureData> GetStageDataAsync(string releaseId, CancellationToken cancellationToken)
    {
        var document = await _dataProvider.LoadAsync(_fileName, cancellationToken).ConfigureAwait(false);
        return StageFixtureJsonParser.ParseScenario(document, _options.ScenarioFor(releaseId));
    }
}
