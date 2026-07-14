using ReleaseReadiness.Domain.Entities;
using ReleaseReadiness.Domain.Repositories;

namespace ReleaseReadiness.Application.Services.StageValidators;

public sealed class JiraStageValidator : StageValidatorBase
{
    public JiraStageValidator(IJiraRepository repository, IRiskAssessmentService riskAssessmentService)
        : base(StageKeys.Jira, repository, riskAssessmentService)
    {
    }
}

public sealed class GitHubStageValidator : StageValidatorBase
{
    public GitHubStageValidator(IGitHubRepository repository, IRiskAssessmentService riskAssessmentService)
        : base(StageKeys.GitHub, repository, riskAssessmentService)
    {
    }
}

public sealed class SonarQubeStageValidator : StageValidatorBase
{
    public SonarQubeStageValidator(ISonarQubeRepository repository, IRiskAssessmentService riskAssessmentService)
        : base(StageKeys.SonarQube, repository, riskAssessmentService)
    {
    }
}

public sealed class TestResultsStageValidator : StageValidatorBase
{
    public TestResultsStageValidator(ITestResultsRepository repository, IRiskAssessmentService riskAssessmentService)
        : base(StageKeys.TestResults, repository, riskAssessmentService)
    {
    }
}

public sealed class AzureMonitorStageValidator : StageValidatorBase
{
    public AzureMonitorStageValidator(IAzureMonitorRepository repository, IRiskAssessmentService riskAssessmentService)
        : base(StageKeys.AzureMonitor, repository, riskAssessmentService)
    {
    }
}

public sealed class OwaspComplianceStageValidator : StageValidatorBase
{
    public OwaspComplianceStageValidator(IOwaspComplianceRepository repository, IRiskAssessmentService riskAssessmentService)
        : base(StageKeys.OwaspCompliance, repository, riskAssessmentService)
    {
    }
}

public sealed class DeploymentConfigStageValidator : StageValidatorBase
{
    public DeploymentConfigStageValidator(IDeploymentConfigRepository repository, IRiskAssessmentService riskAssessmentService)
        : base(StageKeys.DeploymentConfig, repository, riskAssessmentService)
    {
    }
}

public sealed class StressTestStageValidator : StageValidatorBase
{
    public StressTestStageValidator(IStressTestRepository repository, IRiskAssessmentService riskAssessmentService)
        : base(StageKeys.StressTest, repository, riskAssessmentService)
    {
    }
}
