namespace ReleaseReadiness.Domain.Enums;

/// <summary>
/// Outcome of a single pipeline stage validation.
/// </summary>
public enum StageStatus
{
    Pass,
    Fail,
    Unavailable
}
