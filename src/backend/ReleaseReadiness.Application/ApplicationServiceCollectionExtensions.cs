using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using ReleaseReadiness.Application.Services;
using ReleaseReadiness.Application.Services.Reporting;
using ReleaseReadiness.Application.Services.StageValidators;

namespace ReleaseReadiness.Application;

/// <summary>Registers every Application-layer service. Called once from API's <c>Program.cs</c>.</summary>
public static class ApplicationServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining(typeof(ApplicationServiceCollectionExtensions));

        services.AddSingleton<IRiskAssessmentService, RiskAssessmentService>();
        services.AddSingleton<IExecutiveSummaryGenerator, ExecutiveSummaryGenerator>();
        services.AddSingleton<IReleaseReadinessReportFactory, ReleaseReadinessReportFactory>();
        services.AddScoped<IReleaseReadinessService, ReleaseReadinessService>();

        // Strategy pattern: every IStageValidator implementation is registered so
        // IReleaseReadinessService can resolve IEnumerable<IStageValidator> and run all
        // eight concurrently. Adding a new stage means adding one line here.
        services.AddScoped<IStageValidator, JiraStageValidator>();
        services.AddScoped<IStageValidator, GitHubStageValidator>();
        services.AddScoped<IStageValidator, SonarQubeStageValidator>();
        services.AddScoped<IStageValidator, TestResultsStageValidator>();
        services.AddScoped<IStageValidator, AzureMonitorStageValidator>();
        services.AddScoped<IStageValidator, OwaspComplianceStageValidator>();
        services.AddScoped<IStageValidator, DeploymentConfigStageValidator>();
        services.AddScoped<IStageValidator, StressTestStageValidator>();

        return services;
    }
}
