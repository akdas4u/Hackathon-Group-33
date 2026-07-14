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

    private static byte[] CreatePdf(ReleaseReadinessResponse response) =>
        MinimalPdfWriter.WriteReport(response);
}
