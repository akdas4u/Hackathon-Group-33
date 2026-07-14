namespace ReleaseReadiness.Domain.Enums;

/// <summary>
/// Risk classification for a pipeline stage. Drives the stage confidence score:
/// Critical=0, High=40, Medium=70, Low=100.
/// </summary>
public enum RiskLevel
{
    Low,
    Medium,
    High,
    Critical
}
