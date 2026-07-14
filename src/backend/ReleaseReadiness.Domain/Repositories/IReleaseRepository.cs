using ReleaseReadiness.Domain.Entities;

namespace ReleaseReadiness.Domain.Repositories;

/// <summary>
/// Repository pattern: interface lives in Domain, implementation (<c>MockReleaseRepository</c>)
/// lives in Infrastructure. Swap the implementation for a real database without touching
/// Application or Domain.
/// </summary>
public interface IReleaseRepository
{
    Task<IReadOnlyList<Release>> GetAllAsync(CancellationToken cancellationToken);

    Task<Release?> GetByIdAsync(string releaseId, CancellationToken cancellationToken);

    /// <summary>Returns the last cached assessment for a release, if one has been recorded.</summary>
    Task<RiskAssessment?> GetLastAssessmentAsync(string releaseId, CancellationToken cancellationToken);

    /// <summary>Caches the result of a freshly computed assessment for later retrieval via GET /report.</summary>
    Task SaveAssessmentAsync(string releaseId, RiskAssessment assessment, CancellationToken cancellationToken);
}
