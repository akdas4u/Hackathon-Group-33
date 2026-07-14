using ReleaseReadiness.Domain.Enums;

namespace ReleaseReadiness.Domain.Entities;

/// <summary>
/// The evaluated outcome of a single pipeline stage (e.g. GitHub, SonarQube).
/// Immutable value object owned by the <see cref="RiskAssessment"/> aggregate.
/// </summary>
public sealed class PipelineStageResult
{
    public string StageKey { get; }
    public StageStatus Status { get; }
    public RiskLevel RiskLevel { get; }
    public int Score { get; }
    public IReadOnlyList<string> Findings { get; }
    public string Evidence { get; }
    public string? Remediation { get; }

    public PipelineStageResult(
        string stageKey,
        StageStatus status,
        RiskLevel riskLevel,
        int score,
        IReadOnlyList<string> findings,
        string evidence,
        string? remediation)
    {
        if (string.IsNullOrWhiteSpace(stageKey))
        {
            throw new ArgumentException("Stage key must be provided.", nameof(stageKey));
        }

        StageKey = stageKey;
        Status = status;
        RiskLevel = riskLevel;
        Score = score;
        Findings = findings ?? Array.Empty<string>();
        Evidence = evidence ?? string.Empty;
        Remediation = remediation;
    }
}
