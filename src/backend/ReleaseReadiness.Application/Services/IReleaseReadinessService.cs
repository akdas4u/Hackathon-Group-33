using ReleaseReadiness.Application.DTOs;

namespace ReleaseReadiness.Application.Services;

/// <summary>Orchestrates a full release readiness assessment run.</summary>
public interface IReleaseReadinessService
{
    /// <summary>
    /// Runs every registered <see cref="StageValidators.IStageValidator"/> in parallel,
    /// aggregates the results into a confidence score and decision, generates the
    /// executive summary, caches the result, and returns the response.
    /// </summary>
    Task<ReleaseReadinessResponse> AssessAsync(
        string releaseId,
        string correlationId,
        string? triggeredBy,
        CancellationToken cancellationToken);

    /// <summary>Returns the last cached assessment for a release (GET /report).</summary>
    Task<ReleaseReadinessResponse> GetCachedReportAsync(string releaseId, CancellationToken cancellationToken);

    Task<IReadOnlyList<ReleaseDto>> GetAllReleasesAsync(CancellationToken cancellationToken);

    Task<ReleaseDto> GetReleaseAsync(string releaseId, CancellationToken cancellationToken);
}
