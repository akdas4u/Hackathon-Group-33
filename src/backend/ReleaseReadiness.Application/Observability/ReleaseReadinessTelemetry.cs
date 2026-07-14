using System.Diagnostics;
using System.Diagnostics.Metrics;
using ReleaseReadiness.Domain.Entities;

namespace ReleaseReadiness.Application.Observability;

/// <summary>
/// Central <see cref="ActivitySource"/> / <see cref="Meter"/> for the assessment flow.
/// Defined here (Application) so business code can emit traces/metrics without taking
/// a dependency on the OpenTelemetry SDK -- Infrastructure/API wire up the actual
/// exporters (<c>OpenTelemetryExtensions.AddReleaseReadinessObservability</c>) and
/// subscribe to this source/meter by name via <see cref="TelemetryNames.ApplicationSource"/>.
/// </summary>
public static class ReleaseReadinessTelemetry
{
    public const string SourceName = TelemetryNames.ApplicationSource;

    public static readonly ActivitySource ActivitySource = new(SourceName);

    private static readonly Meter Meter = new(SourceName);

    public static readonly Counter<long> AssessmentsCounter = Meter.CreateCounter<long>(
        "release_readiness.assessments.count",
        description: "Number of release readiness assessments run.");

    public static readonly Histogram<double> AssessmentDurationMs = Meter.CreateHistogram<double>(
        "release_readiness.assessment.duration_ms",
        unit: "ms",
        description: "Duration of a full assessment run.");

    public static readonly Counter<long> DecisionCounter = Meter.CreateCounter<long>(
        "release_readiness.decisions.count",
        description: "Distribution of Go / GoWithConditions / NoGo decisions.");
}
