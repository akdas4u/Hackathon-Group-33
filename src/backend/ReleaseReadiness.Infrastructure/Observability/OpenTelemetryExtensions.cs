using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using ReleaseReadiness.Domain.Entities;

namespace ReleaseReadiness.Infrastructure.Observability;

/// <summary>
/// Wires up OpenTelemetry traces, metrics, and logs for the demo. A console exporter is
/// sufficient for a hackathon walkthrough; swap <c>AddConsoleExporter()</c> for an OTLP
/// exporter pointed at Azure Monitor / Jaeger in production.
/// </summary>
public static class OpenTelemetryExtensions
{
    public const string ServiceName = "ReleaseReadiness.API";

    public static IHostApplicationBuilder AddReleaseReadinessObservability(this IHostApplicationBuilder builder)
    {
        // Structured logs are handled by Serilog (see Program.cs) rather than the
        // OpenTelemetry logs pipeline, so only traces and metrics are wired here.
        builder.Services.AddOpenTelemetry()
            .ConfigureResource(resource => resource.AddService(ServiceName))
            .WithTracing(tracing => tracing
                .AddSource(TelemetryNames.ApplicationSource)
                .AddAspNetCoreInstrumentation()
                .AddConsoleExporter())
            .WithMetrics(metrics => metrics
                .AddMeter(TelemetryNames.ApplicationSource)
                .AddAspNetCoreInstrumentation()
                .AddConsoleExporter());

        return builder;
    }
}
