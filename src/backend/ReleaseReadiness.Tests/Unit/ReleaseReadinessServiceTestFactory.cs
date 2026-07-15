using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using ReleaseReadiness.Application.Services;
using ReleaseReadiness.Application.Services.StageValidators;
using ReleaseReadiness.Application.Validators;
using ReleaseReadiness.Domain.Events;
using ReleaseReadiness.Infrastructure.Caching;
using ReleaseReadiness.Infrastructure.Events;
using ReleaseReadiness.Infrastructure.MockData;
using ReleaseReadiness.Infrastructure.Repositories;
using ReleaseReadiness.Infrastructure.Resilience;

namespace ReleaseReadiness.Tests.Unit;

/// <summary>
/// Hand-wires a fully real <see cref="ReleaseReadinessService"/> -- real fixture-backed
/// repositories, real risk scoring, real executive summary generation -- against a
/// chosen <c>MockData:Scenario</c> ("Blocked" or "Clean"). No mocking framework is used
/// (none is in the approved package list): every collaborator is either the real
/// production implementation or a trivial built-in null object
/// (<see cref="NullLogger{T}"/>, <see cref="NoOpCacheService"/>, <see cref="NoOpEventPublisher"/>),
/// so these tests exercise the actual scoring/aggregation/summary pipeline end-to-end
/// while staying fast and fully deterministic.
/// </summary>
internal static class ReleaseReadinessServiceTestFactory
{
    public const string ReleaseId = "REL-2001";

    public static IReleaseReadinessService Create(string scenario, Dictionary<string, string>? releaseScenarios = null)
    {
        var mockDataOptions = Options.Create(new MockDataOptions
        {
            Enabled = true,
            DataPath = "Infrastructure/MockData",
            Scenario = scenario,
            ReleaseScenarios = releaseScenarios ?? new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        });

        IMockDataProvider dataProvider = new MockDataProvider(mockDataOptions);

        var releaseRepository = new MockReleaseRepository(dataProvider);

        var riskAssessmentService = new RiskAssessmentService();
        var summaryGenerator = new ExecutiveSummaryGenerator();

        var cache = new NoOpCacheService();
        var resilienceOptions = Options.Create(new ResilienceOptions());
        var sonarQubeClient = new SonarQubeMockClient(dataProvider, mockDataOptions);
        var sonarQubePipelineProvider = new SonarQubeResiliencePipelineProvider(
            resilienceOptions, cache, NullLogger<SonarQubeResiliencePipelineProvider>.Instance);

        var stageValidators = new IStageValidator[]
        {
            new JiraStageValidator(new JiraRepository(dataProvider, mockDataOptions), riskAssessmentService),
            new GitHubStageValidator(new GitHubRepository(dataProvider, mockDataOptions), riskAssessmentService),
            new SonarQubeStageValidator(new SonarQubeRepository(sonarQubeClient, sonarQubePipelineProvider, cache), riskAssessmentService),
            new TestResultsStageValidator(new TestResultsRepository(dataProvider, mockDataOptions), riskAssessmentService),
            new AzureMonitorStageValidator(new AzureMonitorRepository(dataProvider, mockDataOptions), riskAssessmentService),
            new OwaspComplianceStageValidator(new OwaspComplianceRepository(dataProvider, mockDataOptions), riskAssessmentService),
            new DeploymentConfigStageValidator(new DeploymentConfigRepository(dataProvider, mockDataOptions), riskAssessmentService),
            new StressTestStageValidator(new StressTestRepository(dataProvider, mockDataOptions), riskAssessmentService)
        };

        IDomainEventPublisher eventPublisher = new NoOpEventPublisher(NullLogger<NoOpEventPublisher>.Instance);
        var assessValidator = new AssessReleaseRequestValidator();

        return new ReleaseReadinessService(
            releaseRepository,
            stageValidators,
            riskAssessmentService,
            summaryGenerator,
            eventPublisher,
            assessValidator,
            NullLogger<ReleaseReadinessService>.Instance);
    }
}
