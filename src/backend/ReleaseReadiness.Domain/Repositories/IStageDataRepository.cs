using ReleaseReadiness.Domain.Entities;

namespace ReleaseReadiness.Domain.Repositories;

/// <summary>
/// Common shape for the eight per-stage repositories. Each implementation in
/// Infrastructure reads a single mock JSON fixture (swap for a real connector/API
/// later without touching Application). The <c>_mock</c> field on every fixture
/// documents the production replacement.
/// </summary>
public interface IStageDataRepository
{
    Task<StageFixtureData> GetStageDataAsync(string releaseId, CancellationToken cancellationToken);
}

/// <summary>Jira stage: story completion / blockers. Production replacement: Jira MCP connector.</summary>
public interface IJiraRepository : IStageDataRepository { }

/// <summary>GitHub stage: open PRs against the release branch. Production replacement: GitHub MCP connector.</summary>
public interface IGitHubRepository : IStageDataRepository { }

/// <summary>SonarQube stage: quality gate / code smells. Production replacement: SonarQube REST API.</summary>
public interface ISonarQubeRepository : IStageDataRepository { }

/// <summary>Test results stage: automated test pass/fail counts. Production replacement: CI test-results API.</summary>
public interface ITestResultsRepository : IStageDataRepository { }

/// <summary>Azure Monitor stage: availability / alerts. Production replacement: Azure Monitor API.</summary>
public interface IAzureMonitorRepository : IStageDataRepository { }

/// <summary>OWASP compliance stage: CVE / security findings. Production replacement: OWASP scanner API.</summary>
public interface IOwaspComplianceRepository : IStageDataRepository { }

/// <summary>Deployment config stage: required release config keys. Production replacement: config management API.</summary>
public interface IDeploymentConfigRepository : IStageDataRepository { }

/// <summary>Stress test stage: load test latency/error rate. Production replacement: load-test results API.</summary>
public interface IStressTestRepository : IStageDataRepository { }
