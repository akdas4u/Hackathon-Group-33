using ReleaseReadiness.Domain.Enums;

namespace ReleaseReadiness.Domain.Entities;

/// <summary>
/// Raw stage outcome as read from its data source (mock JSON fixture today, a real
/// connector/API tomorrow), before the score has been computed. Stage repositories
/// return this; <see cref="IRiskAssessmentService"/> (Application layer) computes the
/// numeric score from <see cref="RiskLevel"/> and the stage validator assembles the
/// final <see cref="PipelineStageResult"/>.
/// </summary>
public sealed class StageFixtureData
{
    public StageStatus Status { get; }
    public RiskLevel RiskLevel { get; }
    public IReadOnlyList<string> Findings { get; }
    public string Evidence { get; }
    public string? Remediation { get; }

    public StageFixtureData(
        StageStatus status,
        RiskLevel riskLevel,
        IReadOnlyList<string> findings,
        string evidence,
        string? remediation)
    {
        Status = status;
        RiskLevel = riskLevel;
        Findings = findings ?? Array.Empty<string>();
        Evidence = evidence ?? string.Empty;
        Remediation = remediation;
    }
}
