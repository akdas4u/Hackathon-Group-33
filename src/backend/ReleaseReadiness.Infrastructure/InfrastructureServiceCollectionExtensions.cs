using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ReleaseReadiness.Domain.Repositories;
using ReleaseReadiness.Infrastructure.Caching;
using ReleaseReadiness.Infrastructure.Events;
using ReleaseReadiness.Infrastructure.Identity;
using ReleaseReadiness.Infrastructure.MockData;
using ReleaseReadiness.Infrastructure.Repositories;
using ReleaseReadiness.Infrastructure.Resilience;
using DomainEvents = ReleaseReadiness.Domain.Events;

namespace ReleaseReadiness.Infrastructure;

/// <summary>Registers every Infrastructure-layer service. Called once from API's <c>Program.cs</c>.</summary>
public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MockDataOptions>(configuration.GetSection(MockDataOptions.SectionName));
        services.Configure<Identity.JwtOptions>(configuration.GetSection(Identity.JwtOptions.SectionName));
        services.Configure<ResilienceOptions>(configuration.GetSection(ResilienceOptions.SectionName));

        services.AddSingleton<IMockDataProvider, MockDataProvider>();

        services.AddSingleton<IReleaseRepository, MockReleaseRepository>();
        services.AddScoped<IJiraRepository, JiraRepository>();
        services.AddScoped<IGitHubRepository, GitHubRepository>();
        services.AddScoped<ITestResultsRepository, TestResultsRepository>();
        services.AddScoped<IAzureMonitorRepository, AzureMonitorRepository>();
        services.AddScoped<IOwaspComplianceRepository, OwaspComplianceRepository>();
        services.AddScoped<IDeploymentConfigRepository, DeploymentConfigRepository>();
        services.AddScoped<IStressTestRepository, StressTestRepository>();

        // SonarQube is the one stage wired through the Polly resilience pipeline demo.
        services.AddSingleton<SonarQubeMockClient>();
        services.AddSingleton<ISonarQubeResiliencePipelineProvider, SonarQubeResiliencePipelineProvider>();
        services.AddScoped<ISonarQubeRepository, SonarQubeRepository>();

        services.AddSingleton<ICacheService, NoOpCacheService>();
        services.AddSingleton<DomainEvents.IDomainEventPublisher, NoOpEventPublisher>();
        services.AddSingleton<IIdentityProvider, MockTokenService>();

        return services;
    }
}
