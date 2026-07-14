using System.Diagnostics;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ReleaseReadiness.Application.DTOs;
using ReleaseReadiness.Application.Observability;
using ReleaseReadiness.Application.Services.StageValidators;
using ReleaseReadiness.Domain.Entities;
using ReleaseReadiness.Domain.Enums;
using ReleaseReadiness.Domain.Events;
using ReleaseReadiness.Domain.Exceptions;
using ReleaseReadiness.Domain.Repositories;
using DomainValidationException = ReleaseReadiness.Domain.Exceptions.ValidationException;

namespace ReleaseReadiness.Application.Services;

public sealed class ReleaseReadinessService : IReleaseReadinessService
{
    private readonly IReleaseRepository _releaseRepository;
    private readonly IEnumerable<IStageValidator> _stageValidators;
    private readonly IRiskAssessmentService _riskAssessmentService;
    private readonly IExecutiveSummaryGenerator _summaryGenerator;
    private readonly IDomainEventPublisher _eventPublisher;
    private readonly IValidator<AssessReleaseRequest> _assessValidator;
    private readonly ILogger<ReleaseReadinessService> _logger;

    public ReleaseReadinessService(
        IReleaseRepository releaseRepository,
        IEnumerable<IStageValidator> stageValidators,
        IRiskAssessmentService riskAssessmentService,
        IExecutiveSummaryGenerator summaryGenerator,
        IDomainEventPublisher eventPublisher,
        IValidator<AssessReleaseRequest> assessValidator,
        ILogger<ReleaseReadinessService> logger)
    {
        _releaseRepository = releaseRepository;
        _stageValidators = stageValidators;
        _riskAssessmentService = riskAssessmentService;
        _summaryGenerator = summaryGenerator;
        _eventPublisher = eventPublisher;
        _assessValidator = assessValidator;
        _logger = logger;
    }

    public async Task<ReleaseReadinessResponse> AssessAsync(
        string releaseId,
        string correlationId,
        string? triggeredBy,
        CancellationToken cancellationToken)
    {
        using var activity = ReleaseReadinessTelemetry.ActivitySource.StartActivity("ReleaseReadinessAssessment");
        activity?.SetTag("release.id", releaseId);
        activity?.SetTag("correlation.id", correlationId);
        var stopwatch = Stopwatch.StartNew();

        var validationResult = await _assessValidator
            .ValidateAsync(new AssessReleaseRequest(releaseId), cancellationToken)
            .ConfigureAwait(false);

        if (!validationResult.IsValid)
        {
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage).ToArray());
        }

        var release = await _releaseRepository.GetByIdAsync(releaseId, cancellationToken).ConfigureAwait(false)
            ?? throw new ReleaseNotFoundException(releaseId);

        // Strategy pattern: every registered IStageValidator runs concurrently, each
        // wrapped in its own child span.
        var stageResults = await Task.WhenAll(
            _stageValidators.Select(validator => RunSafelyAsync(validator, releaseId, cancellationToken))
        ).ConfigureAwait(false);

        if (stageResults.Length == 0)
        {
            throw new AssessmentFailedException(releaseId, "No stage validators are registered; cannot compute a readiness assessment.");
        }

        RiskAssessmentResult riskResult = _riskAssessmentService.Aggregate(stageResults);
        string executiveSummary = _summaryGenerator.Generate(releaseId, stageResults, riskResult);
        var generatedAt = DateTimeOffset.UtcNow;

        var assessment = new RiskAssessment(
            releaseId,
            generatedAt,
            correlationId,
            stageResults,
            riskResult.ConfidenceScore,
            riskResult.Decision,
            executiveSummary);

        release.RecordAssessment(assessment);
        await _releaseRepository.SaveAssessmentAsync(releaseId, assessment, cancellationToken).ConfigureAwait(false);

        stopwatch.Stop();
        activity?.SetTag("decision", riskResult.Decision.ToString());
        activity?.SetTag("confidence.score", riskResult.ConfidenceScore);
        ReleaseReadinessTelemetry.AssessmentsCounter.Add(1);
        ReleaseReadinessTelemetry.AssessmentDurationMs.Record(stopwatch.Elapsed.TotalMilliseconds);
        ReleaseReadinessTelemetry.DecisionCounter.Add(1, new KeyValuePair<string, object?>("decision", riskResult.Decision.ToString()));

        // Audit log: every GO/NO-GO decision logged with user, timestamp, release id, confidence score.
        _logger.LogInformation(
            "Release readiness assessment completed. ReleaseId={ReleaseId} Decision={Decision} ConfidenceScore={ConfidenceScore} CorrelationId={CorrelationId} TriggeredBy={TriggeredBy} GeneratedAt={GeneratedAt}",
            releaseId,
            riskResult.Decision,
            riskResult.ConfidenceScore,
            correlationId,
            triggeredBy ?? "unknown",
            generatedAt);

        await _eventPublisher.PublishAsync(
            new AssessmentCompletedEvent(releaseId, correlationId, triggeredBy, riskResult.ConfidenceScore, riskResult.Decision, generatedAt),
            cancellationToken).ConfigureAwait(false);

        return ReleaseReadinessResponseBuilder.FromAssessment(assessment);
    }

    public async Task<ReleaseReadinessResponse> GetCachedReportAsync(string releaseId, CancellationToken cancellationToken)
    {
        _ = await _releaseRepository.GetByIdAsync(releaseId, cancellationToken).ConfigureAwait(false)
            ?? throw new ReleaseNotFoundException(releaseId);

        var assessment = await _releaseRepository.GetLastAssessmentAsync(releaseId, cancellationToken).ConfigureAwait(false)
            ?? throw new ReleaseNotFoundException(releaseId);

        return ReleaseReadinessResponseBuilder.FromAssessment(assessment);
    }

    public async Task<IReadOnlyList<ReleaseDto>> GetAllReleasesAsync(CancellationToken cancellationToken)
    {
        var releases = await _releaseRepository.GetAllAsync(cancellationToken).ConfigureAwait(false);
        return releases.Select(ToDto).ToArray();
    }

    public async Task<ReleaseDto> GetReleaseAsync(string releaseId, CancellationToken cancellationToken)
    {
        var release = await _releaseRepository.GetByIdAsync(releaseId, cancellationToken).ConfigureAwait(false)
            ?? throw new ReleaseNotFoundException(releaseId);

        return ToDto(release);
    }

    private static ReleaseDto ToDto(Release release) => new(release.Id, release.Name, release.Version, release.Status);

    /// <summary>
    /// Graceful degradation: a stage validator throwing does not fail the whole
    /// assessment. The stage is instead reported as Unavailable at High risk so the
    /// assessment can still complete for the remaining stages.
    /// </summary>
    private static async Task<PipelineStageResult> RunSafelyAsync(
        IStageValidator validator,
        string releaseId,
        CancellationToken cancellationToken)
    {
        using var activity = ReleaseReadinessTelemetry.ActivitySource.StartActivity($"StageValidator.{validator.StageKey}");
        activity?.SetTag("stage.key", validator.StageKey);

        try
        {
            var result = await validator.ValidateAsync(releaseId, cancellationToken).ConfigureAwait(false);
            activity?.SetTag("stage.status", result.Status.ToString());
            activity?.SetTag("stage.risk_level", result.RiskLevel.ToString());
            return result;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            return new PipelineStageResult(
                validator.StageKey,
                StageStatus.Unavailable,
                RiskLevel.High,
                40,
                new[] { $"Stage data source unavailable: {ex.Message}" },
                "No data returned by the stage's data source.",
                "Retry the assessment once the stage data source is reachable.");
        }
    }
}
