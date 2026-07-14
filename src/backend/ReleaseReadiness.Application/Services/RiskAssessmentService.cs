using ReleaseReadiness.Domain.Entities;
using ReleaseReadiness.Domain.Enums;

namespace ReleaseReadiness.Application.Services;

public sealed class RiskAssessmentService : IRiskAssessmentService
{
    public int ScoreForRiskLevel(RiskLevel riskLevel) => riskLevel switch
    {
        RiskLevel.Critical => 0,
        RiskLevel.High => 40,
        RiskLevel.Medium => 70,
        RiskLevel.Low => 100,
        _ => throw new ArgumentOutOfRangeException(nameof(riskLevel), riskLevel, "Unknown risk level.")
    };

    public RiskAssessmentResult Aggregate(IReadOnlyList<PipelineStageResult> stageResults)
    {
        if (stageResults is null || stageResults.Count == 0)
        {
            throw new ArgumentException(
                "At least one stage result is required to aggregate a risk assessment.",
                nameof(stageResults));
        }

        var criticalStages = stageResults.Where(s => s.RiskLevel == RiskLevel.Critical).ToList();

        // A single Critical finding caps the overall score at 0 and forces NoGo,
        // regardless of how the remaining stages scored.
        if (criticalStages.Count > 0)
        {
            return new RiskAssessmentResult(0, DecisionType.NoGo, criticalStages);
        }

        double confidenceScore = Math.Round(stageResults.Average(s => s.Score), 2);
        DecisionType decision = DecisionForScore(confidenceScore);

        return new RiskAssessmentResult(confidenceScore, decision, criticalStages);
    }

    private static DecisionType DecisionForScore(double score) => score switch
    {
        >= 80 => DecisionType.Go,
        >= 50 => DecisionType.GoWithConditions,
        _ => DecisionType.NoGo
    };
}
