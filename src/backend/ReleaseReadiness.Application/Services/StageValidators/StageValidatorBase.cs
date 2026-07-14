using ReleaseReadiness.Domain.Entities;
using ReleaseReadiness.Domain.Repositories;

namespace ReleaseReadiness.Application.Services.StageValidators;

/// <summary>
/// Shared plumbing for every stage validator: fetch the raw stage data from its
/// repository, compute the numeric score from the risk level via
/// <see cref="IRiskAssessmentService"/>, and assemble the final <see cref="PipelineStageResult"/>.
/// Concrete stages only need to supply their stage key and repository.
/// </summary>
public abstract class StageValidatorBase : IStageValidator
{
    private readonly IStageDataRepository _repository;
    private readonly IRiskAssessmentService _riskAssessmentService;

    protected StageValidatorBase(
        string stageKey,
        IStageDataRepository repository,
        IRiskAssessmentService riskAssessmentService)
    {
        StageKey = stageKey;
        _repository = repository;
        _riskAssessmentService = riskAssessmentService;
    }

    public string StageKey { get; }

    public async Task<PipelineStageResult> ValidateAsync(string releaseId, CancellationToken cancellationToken)
    {
        StageFixtureData data = await _repository
            .GetStageDataAsync(releaseId, cancellationToken)
            .ConfigureAwait(false);

        int score = _riskAssessmentService.ScoreForRiskLevel(data.RiskLevel);

        return new PipelineStageResult(
            StageKey,
            data.Status,
            data.RiskLevel,
            score,
            data.Findings,
            data.Evidence,
            data.Remediation);
    }
}
