using ReleaseReadiness.Domain.Enums;

namespace ReleaseReadiness.Domain.Events;

/// <summary>
/// Domain event raised whenever a release readiness assessment completes. Used today
/// only for structured audit logging; in production this is the seam for publishing
/// to Azure Service Bus / an event grid so downstream systems (dashboards, ticketing)
/// can react to GO / NO-GO decisions.
/// </summary>
public sealed class AssessmentCompletedEvent
{
    public string ReleaseId { get; }
    public string CorrelationId { get; }
    public string? TriggeredBy { get; }
    public double ConfidenceScore { get; }
    public DecisionType Decision { get; }
    public DateTimeOffset OccurredAt { get; }

    public AssessmentCompletedEvent(
        string releaseId,
        string correlationId,
        string? triggeredBy,
        double confidenceScore,
        DecisionType decision,
        DateTimeOffset occurredAt)
    {
        ReleaseId = releaseId;
        CorrelationId = correlationId;
        TriggeredBy = triggeredBy;
        ConfidenceScore = confidenceScore;
        Decision = decision;
        OccurredAt = occurredAt;
    }
}
