namespace ReleaseReadiness.API.Configuration;

/// <summary>Canonical permission claim values issued into every mock JWT (see roles.json).</summary>
public static class Permissions
{
    public const string ReadPipeline = "ReadPipeline";
    public const string TriggerAssessment = "TriggerAssessment";
    public const string ApproveDecision = "ApproveDecision";
    public const string ReadTestResults = "ReadTestResults";
    public const string ReadAllStages = "ReadAllStages";
    public const string ReadDeploymentConfig = "ReadDeploymentConfig";
}

/// <summary>
/// Authorization policy names, one per permission in the roles table, plus the policy
/// actually enforced today (<see cref="CanTriggerAssessment"/> on POST /assess). The
/// others are registered for future endpoints -- adding a new protected action means
/// applying <c>[Authorize(Policy = ...)]</c>, no new plumbing.
/// </summary>
public static class AuthorizationPolicies
{
    public const string CanReadPipeline = "CanReadPipeline";
    public const string CanTriggerAssessment = "CanTriggerAssessment";
    public const string CanApproveDecision = "CanApproveDecision";
    public const string CanReadTestResults = "CanReadTestResults";
    public const string CanReadAllStages = "CanReadAllStages";
    public const string CanReadDeploymentConfig = "CanReadDeploymentConfig";
}
