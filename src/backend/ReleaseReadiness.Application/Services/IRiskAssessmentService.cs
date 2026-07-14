using ReleaseReadiness.Domain.Entities;
using ReleaseReadiness.Domain.Enums;

namespace ReleaseReadiness.Application.Services;

/// <summary>Result of aggregating all stage scores into one overall confidence score + decision.</summary>
public sealed record RiskAssessmentResult(
    double ConfidenceScore,
    DecisionType Decision,
    IReadOnlyList<PipelineStageResult> CriticalStages);

/// <summary>
/// Implements the confidence-scoring rules exactly as specified: per-stage score from
/// risk level (Critical=0, High=40, Medium=70, Low/Pass=100); overall score is the mean
/// of all stage scores UNLESS any stage is Critical, in which case the overall score is
/// forced to 0 and the decision is forced to NoGo. Otherwise 80-100=Go, 50-79=GoWithConditions,
/// 0-49=NoGo.
/// </summary>
public interface IRiskAssessmentService
{
    int ScoreForRiskLevel(RiskLevel riskLevel);

    RiskAssessmentResult Aggregate(IReadOnlyList<PipelineStageResult> stageResults);
}
