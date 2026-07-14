using Microsoft.OpenApi.Models;

namespace ReleaseReadiness.API.Configuration;

/// <summary>Swagger/OpenAPI documentation, including the JWT bearer scheme so tokens can be tested from the UI.</summary>
public static class SwaggerSetup
{
    public static IServiceCollection AddReleaseReadinessSwagger(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Release Readiness AI Assistant API",
                Version = "v1",
                Description = "Mocked release readiness evaluation: 8 pipeline stages, confidence scoring, GO/NO-GO decisioning."
            });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "JWT bearer token issued by POST /api/v1/auth/login, e.g. \"Bearer {token}\"."
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
                    Array.Empty<string>()
                }
            });
        });

        return services;
    }
}
