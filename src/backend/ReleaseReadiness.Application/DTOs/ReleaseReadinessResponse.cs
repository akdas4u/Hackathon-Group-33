using ReleaseReadiness.Domain.Enums;

namespace ReleaseReadiness.Application.DTOs;

/// <summary>Per-stage outcome as surfaced on the wire. Mirrors <c>PipelineStageResult</c> (Domain).</summary>
public sealed record StageResultDto(
    string StageKey,
    StageStatus Status,
    RiskLevel RiskLevel,
    int Score,
    IReadOnlyList<string> Findings,
    string Evidence,
    string? Remediation);

/// <summary>
/// The full result of a release readiness assessment: the authoritative response shape
/// for both POST /assess and GET /report.
/// </summary>
public sealed record ReleaseReadinessResponse(
    string ReleaseId,
    string GeneratedAt,
    string CorrelationId,
    IReadOnlyList<StageResultDto> Stages,
    double ConfidenceScore,
    DecisionType Decision,
    string ExecutiveSummary);
