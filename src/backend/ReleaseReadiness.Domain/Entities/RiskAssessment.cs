using ReleaseReadiness.Domain.Enums;

namespace ReleaseReadiness.Domain.Entities;

/// <summary>
/// Aggregate root capturing the outcome of one release readiness assessment run:
/// the per-stage results, the aggregated confidence score, and the final decision.
/// </summary>
public sealed class RiskAssessment
{
    public string ReleaseId { get; }
    public DateTimeOffset GeneratedAt { get; }
    public string CorrelationId { get; }
    public IReadOnlyList<PipelineStageResult> StageResults { get; }
    public double ConfidenceScore { get; }
    public DecisionType Decision { get; }
    public string ExecutiveSummary { get; }

    public RiskAssessment(
        string releaseId,
        DateTimeOffset generatedAt,
        string correlationId,
        IReadOnlyList<PipelineStageResult> stageResults,
        double confidenceScore,
        DecisionType decision,
        string executiveSummary)
    {
        if (string.IsNullOrWhiteSpace(releaseId))
        {
            throw new ArgumentException("Release id must be provided.", nameof(releaseId));
        }

        ReleaseId = releaseId;
        GeneratedAt = generatedAt;
        CorrelationId = correlationId;
        StageResults = stageResults ?? throw new ArgumentNullException(nameof(stageResults));
        ConfidenceScore = confidenceScore;
        Decision = decision;
        ExecutiveSummary = executiveSummary ?? string.Empty;
    }

    public IEnumerable<PipelineStageResult> CriticalStages =>
        StageResults.Where(s => s.RiskLevel == RiskLevel.Critical);
}
