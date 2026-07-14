namespace ReleaseReadiness.Infrastructure;

/// <summary>
/// Scalability placeholder for a future async batch-assessment worker (e.g. nightly
/// readiness sweep across every in-flight release). Deliberately has no implementation
/// or DI registration today -- the synchronous <c>POST /assess</c> flow covers the
/// hackathon demo. Wire up a hosted service implementing this interface when batch
/// assessment becomes a requirement.
/// </summary>
public interface IAssessmentBackgroundWorker
{
    Task EnqueueAssessmentAsync(string releaseId, CancellationToken cancellationToken);
}
