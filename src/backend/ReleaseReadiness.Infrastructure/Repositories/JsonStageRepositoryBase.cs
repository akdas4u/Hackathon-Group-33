using Microsoft.Extensions.Options;
using ReleaseReadiness.Domain.Entities;
using ReleaseReadiness.Infrastructure.MockData;

namespace ReleaseReadiness.Infrastructure.Repositories;

/// <summary>
/// Shared plumbing for every per-stage repository: read the fixture's
/// <c>summary.scenarios.&lt;Scenario&gt;</c> node (selected via <c>MockData:Scenario</c>
/// in appsettings) and map it to <see cref="StageFixtureData"/>. The mock dataset is
/// global rather than per-release, so <paramref name="releaseId"/> is accepted (for
/// interface symmetry with a future real, per-release connector) but not used to select
/// data today.
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
        _ = releaseId; // Reserved for a future per-release real connector; the mock dataset is global.

        var document = await _dataProvider.LoadAsync(_fileName, cancellationToken).ConfigureAwait(false);
        return StageFixtureJsonParser.ParseScenario(document, _options.Scenario);
    }
}
