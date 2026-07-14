using System.Text.Json;
using System.Text.Json.Serialization;
using ReleaseReadiness.Application.DTOs;

namespace ReleaseReadiness.Application.Services.Reporting;

public sealed class ReleaseReadinessReportFactory : IReleaseReadinessReportFactory
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true,
        Converters = { new JsonStringEnumConverter() }
    };

    public string GetContentType(ReportFormat format) => format switch
    {
        ReportFormat.Json => "application/json",
        ReportFormat.Pdf => "application/pdf",
        _ => throw new ArgumentOutOfRangeException(nameof(format), format, "Unsupported report format.")
    };

    public byte[] Create(ReleaseReadinessResponse response, ReportFormat format) => format switch
    {
        ReportFormat.Json => JsonSerializer.SerializeToUtf8Bytes(response, JsonOptions),
        ReportFormat.Pdf => CreatePdf(response),
        _ => throw new ArgumentOutOfRangeException(nameof(format), format, "Unsupported report format.")
    };

    private static byte[] CreatePdf(ReleaseReadinessResponse response)
    {
        var lines = new List<string>
        {
            $"Release: {response.ReleaseId}",
            $"Generated: {response.GeneratedAt}",
            $"Correlation Id: {response.CorrelationId}",
            $"Decision: {response.Decision}",
            $"Confidence Score: {response.ConfidenceScore}%",
            string.Empty,
            "Executive Summary:",
            response.ExecutiveSummary,
            string.Empty,
            "Stage Results:"
        };

        foreach (var stage in response.Stages)
        {
            lines.Add($"- {stage.StageKey}: {stage.Status} / {stage.RiskLevel} risk (score {stage.Score})");
            lines.Add($"    Evidence: {stage.Evidence}");
            if (stage.Findings.Count > 0)
            {
                lines.Add($"    Findings: {string.Join("; ", stage.Findings)}");
            }

            if (!string.IsNullOrWhiteSpace(stage.Remediation))
            {
                lines.Add($"    Remediation: {stage.Remediation}");
            }
        }

        return MinimalPdfWriter.Write("Release Readiness Report", lines);
    }
}
