using ReleaseReadiness.Application.DTOs;

namespace ReleaseReadiness.Application.Services.Reporting;

/// <summary>
/// Factory pattern: produces a byte-serialized report in the requested format from a
/// computed <see cref="ReleaseReadinessResponse"/>. Adding a new export format means
/// adding a case here -- callers never change.
/// </summary>
public interface IReleaseReadinessReportFactory
{
    string GetContentType(ReportFormat format);

    byte[] Create(ReleaseReadinessResponse response, ReportFormat format);
}
