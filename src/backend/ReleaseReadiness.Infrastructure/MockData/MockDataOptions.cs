namespace ReleaseReadiness.Infrastructure.MockData;

/// <summary>Binds the <c>MockData</c> appsettings section.</summary>
public sealed class MockDataOptions
{
    public const string SectionName = "MockData";

    public bool Enabled { get; set; } = true;

    /// <summary>Configured relative path to the fixture directory (e.g. "Infrastructure/MockData").</summary>
    public string DataPath { get; set; } = "Infrastructure/MockData";

    /// <summary>
    /// Which scripted dataset to serve when a release has no entry in
    /// <see cref="ReleaseScenarios"/>: "Blocked" (default, scripted NO GO demo),
    /// "Conditional" (GO WITH CONDITIONS demo) or "Clean" (happy path GO demo).
    /// </summary>
    public string Scenario { get; set; } = "Blocked";

    /// <summary>Per-release scenario overrides (release id -> scenario name). Releases not listed fall back to <see cref="Scenario"/>.</summary>
    public Dictionary<string, string> ReleaseScenarios { get; set; } = new(StringComparer.OrdinalIgnoreCase);

    public string ScenarioFor(string? releaseId) =>
        releaseId is not null && ReleaseScenarios.TryGetValue(releaseId, out var scenario)
            ? scenario
            : Scenario;
}
