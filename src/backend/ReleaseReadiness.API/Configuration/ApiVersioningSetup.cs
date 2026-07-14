using Asp.Versioning;

namespace ReleaseReadiness.API.Configuration;

/// <summary>Declares API versioning from day one: default v1, versioned via URL segment (<c>/api/v1/...</c>).</summary>
public static class ApiVersioningSetup
{
    public static IServiceCollection AddReleaseReadinessApiVersioning(this IServiceCollection services)
    {
        services.AddApiVersioning(options =>
            {
                options.DefaultApiVersion = new ApiVersion(1, 0);
                options.AssumeDefaultVersionWhenUnspecified = true;
                options.ReportApiVersions = true;
                options.ApiVersionReader = new UrlSegmentApiVersionReader();
            })
            .AddMvc()
            .AddApiExplorer(options =>
            {
                options.GroupNameFormat = "'v'VVV";
                options.SubstituteApiVersionInUrl = true;
            });

        return services;
    }
}
