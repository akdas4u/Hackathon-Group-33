namespace ReleaseReadiness.API.Configuration;

/// <summary>Explicit CORS policy from the <c>Cors:AllowedOrigins</c> appsettings list. Never a wildcard.</summary>
public static class CorsSetup
{
    public const string PolicyName = "ReleaseReadinessCors";

    public static IServiceCollection AddReleaseReadinessCors(this IServiceCollection services, IConfiguration configuration)
    {
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

        services.AddCors(options =>
        {
            options.AddPolicy(PolicyName, policy =>
            {
                policy.WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .WithExposedHeaders("X-Correlation-Id")
                    .AllowCredentials();
            });
        });

        return services;
    }
}
