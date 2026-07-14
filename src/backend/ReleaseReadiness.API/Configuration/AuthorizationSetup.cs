namespace ReleaseReadiness.API.Configuration;

/// <summary>Registers one claims-based policy per permission in the roles table.</summary>
public static class AuthorizationSetup
{
    public static IServiceCollection AddReleaseReadinessAuthorization(this IServiceCollection services)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy(AuthorizationPolicies.CanReadPipeline, policy => policy.RequireClaim("permission", Permissions.ReadPipeline))
            .AddPolicy(AuthorizationPolicies.CanTriggerAssessment, policy => policy.RequireClaim("permission", Permissions.TriggerAssessment))
            .AddPolicy(AuthorizationPolicies.CanApproveDecision, policy => policy.RequireClaim("permission", Permissions.ApproveDecision))
            .AddPolicy(AuthorizationPolicies.CanReadTestResults, policy => policy.RequireClaim("permission", Permissions.ReadTestResults))
            .AddPolicy(AuthorizationPolicies.CanReadAllStages, policy => policy.RequireClaim("permission", Permissions.ReadAllStages))
            .AddPolicy(AuthorizationPolicies.CanReadDeploymentConfig, policy => policy.RequireClaim("permission", Permissions.ReadDeploymentConfig));

        return services;
    }
}
