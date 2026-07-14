using ReleaseReadiness.Application.DTOs;
using ReleaseReadiness.Domain.Entities;
using ReleaseReadiness.Domain.Enums;

namespace ReleaseReadiness.Application.Services;

/// <summary>
/// Builder pattern: assembles the wire-level <see cref="ReleaseReadinessResponse"/> from
/// the Domain <see cref="RiskAssessment"/> aggregate (or from individually supplied parts,
/// useful in tests).
/// </summary>
public sealed class ReleaseReadinessResponseBuilder
{
    private string _releaseId = string.Empty;
    private DateTimeOffset _generatedAt = DateTimeOffset.UtcNow;
    private string _correlationId = string.Empty;
    private IReadOnlyList<StageResultDto> _stages = Array.Empty<StageResultDto>();
    private double _confidenceScore;
    private DecisionType _decision;
    private string _executiveSummary = string.Empty;

    public ReleaseReadinessResponseBuilder WithReleaseId(string releaseId)
    {
        _releaseId = releaseId;
        return this;
    }

    public ReleaseReadinessResponseBuilder WithGeneratedAt(DateTimeOffset generatedAt)
    {
        _generatedAt = generatedAt;
        return this;
    }

    public ReleaseReadinessResponseBuilder WithCorrelationId(string correlationId)
    {
        _correlationId = correlationId;
        return this;
    }

    public ReleaseReadinessResponseBuilder WithStages(IEnumerable<PipelineStageResult> stages)
    {
        _stages = stages.Select(ToDto).ToArray();
        return this;
    }

    public ReleaseReadinessResponseBuilder WithConfidenceScore(double confidenceScore)
    {
        _confidenceScore = confidenceScore;
        return this;
    }

    public ReleaseReadinessResponseBuilder WithDecision(DecisionType decision)
    {
        _decision = decision;
        return this;
    }

    public ReleaseReadinessResponseBuilder WithExecutiveSummary(string executiveSummary)
    {
        _executiveSummary = executiveSummary;
        return this;
    }

    public ReleaseReadinessResponse Build() => new(
        _releaseId,
        _generatedAt.ToString("O"),
        _correlationId,
        _stages,
        _confidenceScore,
        _decision,
        _executiveSummary);

    public static ReleaseReadinessResponse FromAssessment(RiskAssessment assessment) =>
        new ReleaseReadinessResponseBuilder()
            .WithReleaseId(assessment.ReleaseId)
            .WithGeneratedAt(assessment.GeneratedAt)
            .WithCorrelationId(assessment.CorrelationId)
            .WithStages(assessment.StageResults)
            .WithConfidenceScore(assessment.ConfidenceScore)
            .WithDecision(assessment.Decision)
            .WithExecutiveSummary(assessment.ExecutiveSummary)
            .Build();

    private static StageResultDto ToDto(PipelineStageResult stage) => new(
        stage.StageKey,
        stage.Status,
        stage.RiskLevel,
        stage.Score,
        stage.Findings,
        stage.Evidence,
        stage.Remediation);
}
