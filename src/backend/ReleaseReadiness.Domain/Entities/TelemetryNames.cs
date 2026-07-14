namespace ReleaseReadiness.Domain.Entities;

/// <summary>
/// Shared telemetry source/meter name. Lives in Domain (rather than Application) so both
/// Application (which creates the <c>ActivitySource</c>/<c>Meter</c>) and Infrastructure
/// (which registers OpenTelemetry exporters against that same name) can reference it
/// without Infrastructure needing to depend on Application.
/// </summary>
public static class TelemetryNames
{
    public const string ApplicationSource = "ReleaseReadiness.Application";
}
