using Microsoft.Extensions.Diagnostics.HealthChecks;
using ReleaseReadiness.Infrastructure.MockData;

namespace ReleaseReadiness.API.Configuration;

/// <summary>Readiness dependency check: confirms the mock fixture directory is reachable and parseable.</summary>
public sealed class MockDataHealthCheck : IHealthCheck
{
    private readonly IMockDataProvider _dataProvider;

    public MockDataHealthCheck(IMockDataProvider dataProvider)
    {
        _dataProvider = dataProvider;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            await _dataProvider.LoadAsync("releases.json", cancellationToken).ConfigureAwait(false);
            return HealthCheckResult.Healthy("Mock data fixtures are reachable.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Mock data fixtures are not reachable.", ex);
        }
    }
}

public static class HealthCheckSetup
{
    public static IServiceCollection AddReleaseReadinessHealthChecks(this IServiceCollection services)
    {
        services.AddHealthChecks()
            .AddCheck<MockDataHealthCheck>("mock-data", tags: new[] { "ready" });

        return services;
    }
}
