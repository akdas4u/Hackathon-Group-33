namespace ReleaseReadiness.Infrastructure.MockData;

/// <summary>Binds the <c>MockData</c> appsettings section.</summary>
public sealed class MockDataOptions
{
    public const string SectionName = "MockData";

    public bool Enabled { get; set; } = true;

    /// <summary>Configured relative path to the fixture directory (e.g. "Infrastructure/MockData").</summary>
    public string DataPath { get; set; } = "Infrastructure/MockData";

    /// <summary>Which scripted dataset to serve: "Blocked" (default, scripted NO GO demo) or "Clean" (happy path GO demo).</summary>
    public string Scenario { get; set; } = "Blocked";
}
