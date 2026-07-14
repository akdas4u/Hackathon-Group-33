using System.Collections.Concurrent;
using System.Text.Json;
using ReleaseReadiness.Domain.Entities;
using ReleaseReadiness.Domain.Repositories;
using ReleaseReadiness.Infrastructure.MockData;

namespace ReleaseReadiness.Infrastructure.Repositories;

/// <summary>
/// In-memory repository over <c>releases.json</c>. The last computed assessment per
/// release is cached in a process-local dictionary (stateless-API-friendly for a single
/// demo instance; swap for a real database + distributed cache to scale horizontally).
/// </summary>
public sealed class MockReleaseRepository : IReleaseRepository
{
    private const string FileName = "releases.json";

    private readonly IMockDataProvider _dataProvider;
    private readonly ConcurrentDictionary<string, RiskAssessment> _assessmentCache = new(StringComparer.OrdinalIgnoreCase);

    public MockReleaseRepository(IMockDataProvider dataProvider)
    {
        _dataProvider = dataProvider;
    }

    public async Task<IReadOnlyList<Release>> GetAllAsync(CancellationToken cancellationToken)
    {
        JsonDocument document = await _dataProvider.LoadAsync(FileName, cancellationToken).ConfigureAwait(false);
        return document.RootElement.GetProperty("releases").EnumerateArray().Select(ToRelease).ToArray();
    }

    public async Task<Release?> GetByIdAsync(string releaseId, CancellationToken cancellationToken)
    {
        var releases = await GetAllAsync(cancellationToken).ConfigureAwait(false);
        return releases.FirstOrDefault(r => string.Equals(r.Id, releaseId, StringComparison.OrdinalIgnoreCase));
    }

    public Task<RiskAssessment?> GetLastAssessmentAsync(string releaseId, CancellationToken cancellationToken)
    {
        _assessmentCache.TryGetValue(releaseId, out var assessment);
        return Task.FromResult(assessment);
    }

    public Task SaveAssessmentAsync(string releaseId, RiskAssessment assessment, CancellationToken cancellationToken)
    {
        _assessmentCache[releaseId] = assessment;
        return Task.CompletedTask;
    }

    private Release ToRelease(JsonElement element)
    {
        string id = element.GetProperty("id").GetString() ?? string.Empty;
        string name = element.GetProperty("name").GetString() ?? string.Empty;
        string version = element.GetProperty("version").GetString() ?? string.Empty;
        string status = element.GetProperty("status").GetString() ?? string.Empty;

        _assessmentCache.TryGetValue(id, out var cachedAssessment);
        return new Release(id, name, version, status, cachedAssessment);
    }
}
