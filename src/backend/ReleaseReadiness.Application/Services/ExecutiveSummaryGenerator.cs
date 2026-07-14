using ReleaseReadiness.Domain.Entities;
using ReleaseReadiness.Domain.Enums;

namespace ReleaseReadiness.Application.Services;

/// <summary>
/// Templated, deterministic "AI-style" narrative summary. No LLM call is made in the
/// demo -- this is a pure text template driven by the computed risk result, which keeps
/// the output reproducible for tests while still reading like a written assessment.
/// </summary>
public sealed class ExecutiveSummaryGenerator : IExecutiveSummaryGenerator
{
    public string Generate(string releaseId, IReadOnlyList<PipelineStageResult> stageResults, RiskAssessmentResult riskResult)
    {
        int total = stageResults.Count;
        int passing = stageResults.Count(s => s.Status == StageStatus.Pass);

        if (riskResult.CriticalStages.Count > 0)
        {
            var stageNames = string.Join(", ", riskResult.CriticalStages.Select(s => s.StageKey));
            var blockerSentences = string.Join(" ", riskResult.CriticalStages.Select(FormatBlocker));

            return
                $"Release {releaseId} is NOT READY for deployment. " +
                $"{riskResult.CriticalStages.Count} of {total} pipeline stages reported a Critical finding that blocks release: {stageNames}. " +
                $"{blockerSentences} " +
                $"The overall confidence score is capped at 0% because a single Critical finding forces a NO GO decision regardless of the other {passing} passing stage(s). " +
                "Resolve every listed blocker and re-run the assessment before this release can proceed.";
        }

        return
            $"Release {releaseId} reached an overall confidence score of {riskResult.ConfidenceScore:0.##}% across {total} pipeline stages, with {passing} stage(s) passing cleanly. " +
            "No Critical findings were detected in this run. " +
            $"The recommended decision is {DecisionText(riskResult.Decision)}. " +
            "Review any Medium or High risk stages listed below before final sign-off, and re-run the assessment if release conditions change.";
    }

    private static string FormatBlocker(PipelineStageResult stage)
    {
        var finding = stage.Findings.FirstOrDefault() ?? stage.Evidence;
        return $"{stage.StageKey} blocker: {finding}.";
    }

    private static string DecisionText(DecisionType decision) => decision switch
    {
        DecisionType.Go => "GO",
        DecisionType.GoWithConditions => "GO WITH CONDITIONS",
        DecisionType.NoGo => "NO GO",
        _ => decision.ToString()
    };
}
