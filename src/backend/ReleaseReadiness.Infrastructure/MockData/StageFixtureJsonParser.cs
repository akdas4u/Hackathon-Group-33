using System.Text.Json;
using ReleaseReadiness.Domain.Entities;
using ReleaseReadiness.Domain.Enums;

namespace ReleaseReadiness.Infrastructure.MockData;

/// <summary>Shared parsing of a fixture's <c>summary.scenarios.&lt;Scenario&gt;</c> node into <see cref="StageFixtureData"/>.</summary>
public static class StageFixtureJsonParser
{
    public static StageFixtureData ParseScenario(JsonDocument document, string scenario)
    {
        JsonElement scenarioElement = document.RootElement
            .GetProperty("summary")
            .GetProperty("scenarios")
            .GetProperty(scenario);

        return ParseScenarioElement(scenarioElement);
    }

    public static StageFixtureData ParseScenarioElement(JsonElement scenarioElement)
    {
        var status = Enum.Parse<StageStatus>(scenarioElement.GetProperty("status").GetString()!, ignoreCase: true);
        var riskLevel = Enum.Parse<RiskLevel>(scenarioElement.GetProperty("riskLevel").GetString()!, ignoreCase: true);
        var findings = scenarioElement.GetProperty("findings")
            .EnumerateArray()
            .Select(e => e.GetString() ?? string.Empty)
            .ToArray();
        var evidence = scenarioElement.GetProperty("evidence").GetString() ?? string.Empty;
        var remediationElement = scenarioElement.GetProperty("remediation");
        var remediation = remediationElement.ValueKind == JsonValueKind.Null ? null : remediationElement.GetString();

        return new StageFixtureData(status, riskLevel, findings, evidence, remediation);
    }
}
