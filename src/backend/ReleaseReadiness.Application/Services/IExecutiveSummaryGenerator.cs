using ReleaseReadiness.Domain.Entities;

namespace ReleaseReadiness.Application.Services;

/// <summary>Produces the AI-style written executive summary attached to every assessment response.</summary>
public interface IExecutiveSummaryGenerator
{
    string Generate(string releaseId, IReadOnlyList<PipelineStageResult> stageResults, RiskAssessmentResult riskResult);
}
