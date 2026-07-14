using FluentAssertions;
using NUnit.Framework;
using ReleaseReadiness.Application.Services;
using ReleaseReadiness.Domain.Entities;
using ReleaseReadiness.Domain.Enums;

namespace ReleaseReadiness.Tests.Unit;

[TestFixture]
public sealed class RiskAssessmentServiceTests
{
    private RiskAssessmentService _sut = null!;

    [SetUp]
    public void SetUp()
    {
        _sut = new RiskAssessmentService();
    }

    [TestCase(RiskLevel.Critical, 0)]
    [TestCase(RiskLevel.High, 40)]
    [TestCase(RiskLevel.Medium, 70)]
    [TestCase(RiskLevel.Low, 100)]
    public void ScoreForRiskLevel_MapsExactlyToTheSpecifiedFormula(RiskLevel riskLevel, int expectedScore)
    {
        _sut.ScoreForRiskLevel(riskLevel).Should().Be(expectedScore);
    }

    [Test]
    public void Aggregate_AllStagesLow_ReturnsFullConfidenceAndGo()
    {
        var stages = Enumerable.Range(0, 8).Select(i => Stage($"Stage{i}", RiskLevel.Low, 100)).ToArray();

        var result = _sut.Aggregate(stages);

        result.ConfidenceScore.Should().Be(100);
        result.Decision.Should().Be(DecisionType.Go);
        result.CriticalStages.Should().BeEmpty();
    }

    [Test]
    public void Aggregate_SingleCriticalStage_ForcesScoreToZeroAndNoGo_EvenWithMostlyPassingStages()
    {
        // Seven Low (100) stages + one Critical (0) stage; a naive mean would be 87.5,
        // but a single Critical finding must cap the overall score at 0 and force NoGo.
        var stages = new[]
        {
            Stage("Jira", RiskLevel.Low, 100),
            Stage("GitHub", RiskLevel.Critical, 0),
            Stage("SonarQube", RiskLevel.Low, 100),
            Stage("TestResults", RiskLevel.Low, 100),
            Stage("AzureMonitor", RiskLevel.Low, 100),
            Stage("OwaspCompliance", RiskLevel.Low, 100),
            Stage("DeploymentConfig", RiskLevel.Low, 100),
            Stage("StressTest", RiskLevel.Low, 100)
        };

        var result = _sut.Aggregate(stages);

        result.ConfidenceScore.Should().Be(0);
        result.Decision.Should().Be(DecisionType.NoGo);
        result.CriticalStages.Should().ContainSingle(s => s.StageKey == "GitHub");
    }

    [Test]
    public void Aggregate_TwoCriticalStages_ReportsBothAsCritical()
    {
        var stages = new[]
        {
            Stage("GitHub", RiskLevel.Critical, 0),
            Stage("DeploymentConfig", RiskLevel.Critical, 0),
            Stage("Jira", RiskLevel.Low, 100),
            Stage("SonarQube", RiskLevel.Low, 100),
            Stage("TestResults", RiskLevel.Low, 100),
            Stage("AzureMonitor", RiskLevel.Low, 100),
            Stage("OwaspCompliance", RiskLevel.Low, 100),
            Stage("StressTest", RiskLevel.Low, 100)
        };

        var result = _sut.Aggregate(stages);

        result.ConfidenceScore.Should().Be(0);
        result.Decision.Should().Be(DecisionType.NoGo);
        result.CriticalStages.Select(s => s.StageKey).Should().BeEquivalentTo(new[] { "GitHub", "DeploymentConfig" });
    }

    [TestCase(100, DecisionType.Go)]
    [TestCase(80, DecisionType.Go)]
    [TestCase(79, DecisionType.GoWithConditions)]
    [TestCase(50, DecisionType.GoWithConditions)]
    [TestCase(49, DecisionType.NoGo)]
    [TestCase(0, DecisionType.NoGo)]
    public void Aggregate_NoCriticalStages_AppliesTheDecisionThresholdsExactly(int uniformStageScore, DecisionType expectedDecision)
    {
        var stages = BuildStagesAveragingTo(uniformStageScore);

        var result = _sut.Aggregate(stages);

        result.ConfidenceScore.Should().Be(uniformStageScore);
        result.Decision.Should().Be(expectedDecision);
    }

    private static PipelineStageResult[] BuildStagesAveragingTo(int targetAverage)
    {
        // All 8 stages get the same score, so the mean equals that score exactly. Score
        // 49 doesn't correspond to any single RiskLevel bucket (0/40/70/100), so encode
        // it directly as a stage result with a High risk level but an overridden score --
        // valid because RiskAssessmentService.Aggregate only reads Score and RiskLevel
        // independently (RiskLevel merely decides whether a stage is Critical).
        return Enumerable.Range(0, 8)
            .Select(i => Stage($"Stage{i}", RiskLevel.High, targetAverage))
            .ToArray();
    }

    private static PipelineStageResult Stage(string stageKey, RiskLevel riskLevel, int score) => new(
        stageKey,
        riskLevel == RiskLevel.Critical ? StageStatus.Fail : StageStatus.Pass,
        riskLevel,
        score,
        new[] { $"{stageKey} finding" },
        $"{stageKey} evidence",
        riskLevel == RiskLevel.Critical ? $"Fix {stageKey}" : null);
}
