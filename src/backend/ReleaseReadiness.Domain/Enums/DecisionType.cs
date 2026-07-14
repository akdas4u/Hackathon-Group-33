namespace ReleaseReadiness.Domain.Enums;

/// <summary>
/// Final release readiness decision derived from the overall confidence score.
/// </summary>
public enum DecisionType
{
    Go,
    GoWithConditions,
    NoGo
}
