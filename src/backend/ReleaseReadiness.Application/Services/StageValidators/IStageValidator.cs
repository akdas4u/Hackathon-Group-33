using ReleaseReadiness.Domain.Entities;

namespace ReleaseReadiness.Application.Services.StageValidators;

/// <summary>
/// Strategy pattern: one implementation per pipeline stage. <see cref="IReleaseReadinessService"/>
/// runs every registered validator in parallel via <c>Task.WhenAll</c>. Adding a new pipeline
/// stage means implementing this interface and registering it in DI — no other code changes.
/// </summary>
public interface IStageValidator
{
    /// <summary>One of the canonical <see cref="ReleaseReadiness.Domain.Entities.StageKeys"/> values.</summary>
    string StageKey { get; }

    Task<PipelineStageResult> ValidateAsync(string releaseId, CancellationToken cancellationToken);
}
