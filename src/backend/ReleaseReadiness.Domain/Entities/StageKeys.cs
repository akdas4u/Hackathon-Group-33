namespace ReleaseReadiness.Domain.Entities;

/// <summary>
/// The exact, canonical set of pipeline stage keys evaluated by every release
/// readiness assessment. Used verbatim in code, fixtures, and API responses.
/// </summary>
public static class StageKeys
{
    public const string Jira = "Jira";
    public const string GitHub = "GitHub";
    public const string SonarQube = "SonarQube";
    public const string TestResults = "TestResults";
    public const string AzureMonitor = "AzureMonitor";
    public const string OwaspCompliance = "OwaspCompliance";
    public const string DeploymentConfig = "DeploymentConfig";
    public const string StressTest = "StressTest";

    public static readonly IReadOnlyList<string> All = new[]
    {
        Jira, GitHub, SonarQube, TestResults, AzureMonitor, OwaspCompliance, DeploymentConfig, StressTest
    };
}
