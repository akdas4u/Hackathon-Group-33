using FluentAssertions;
using NUnit.Framework;
using ReleaseReadiness.Domain.Enums;

namespace ReleaseReadiness.Tests.Unit;

[TestFixture]
public sealed class ReleaseReadinessServiceTests
{
    [Test]
    public async Task AssessAsync_CleanScenario_ReturnsGoAtFullConfidence()
    {
        var sut = ReleaseReadinessServiceTestFactory.Create("Clean");

        var response = await sut.AssessAsync(
            ReleaseReadinessServiceTestFactory.ReleaseId,
            correlationId: Guid.NewGuid().ToString(),
            triggeredBy: "test-runner",
            cancellationToken: CancellationToken.None);

        response.Decision.Should().Be(DecisionType.Go);
        response.ConfidenceScore.Should().Be(100);
        response.Stages.Should().HaveCount(8);
        response.Stages.Should().OnlyContain(s => s.Status == StageStatus.Pass);
        response.Stages.Should().OnlyContain(s => s.RiskLevel == RiskLevel.Low);
    }

    [Test]
    public async Task AssessAsync_BlockedScenario_ReturnsNoGoAtZeroConfidence_WithBothBlockersNamed()
    {
        var sut = ReleaseReadinessServiceTestFactory.Create("Blocked");

        var response = await sut.AssessAsync(
            ReleaseReadinessServiceTestFactory.ReleaseId,
            correlationId: Guid.NewGuid().ToString(),
            triggeredBy: "test-runner",
            cancellationToken: CancellationToken.None);

        response.Decision.Should().Be(DecisionType.NoGo);
        response.ConfidenceScore.Should().Be(0);
        response.Stages.Should().HaveCount(8);

        var criticalStages = response.Stages.Where(s => s.RiskLevel == RiskLevel.Critical).ToList();
        criticalStages.Select(s => s.StageKey).Should().BeEquivalentTo(new[] { "GitHub", "DeploymentConfig" });
        criticalStages.Should().OnlyContain(s => s.Status == StageStatus.Fail && s.Score == 0);

        // The remaining six stages are unaffected by the two blockers.
        response.Stages.Count(s => s.Status == StageStatus.Pass).Should().Be(6);

        // Executive summary must name both blockers by stage (contract requirement).
        response.ExecutiveSummary.Should().Contain("GitHub");
        response.ExecutiveSummary.Should().Contain("DeploymentConfig");

        var sentenceCount = response.ExecutiveSummary.Count(c => c == '.');
        sentenceCount.Should().BeGreaterOrEqualTo(3).And.BeLessOrEqualTo(6);
    }

    [Test]
    public async Task AssessAsync_UnknownReleaseId_ThrowsReleaseNotFoundException()
    {
        var sut = ReleaseReadinessServiceTestFactory.Create("Clean");

        Func<Task> act = () => sut.AssessAsync("does-not-exist", Guid.NewGuid().ToString(), "test-runner", CancellationToken.None);

        await act.Should().ThrowAsync<ReleaseReadiness.Domain.Exceptions.ReleaseNotFoundException>();
    }

    [Test]
    public async Task AssessAsync_ThenGetCachedReportAsync_ReturnsTheSameResult()
    {
        var sut = ReleaseReadinessServiceTestFactory.Create("Blocked");

        var assessed = await sut.AssessAsync(
            ReleaseReadinessServiceTestFactory.ReleaseId, Guid.NewGuid().ToString(), "test-runner", CancellationToken.None);

        var cached = await sut.GetCachedReportAsync(ReleaseReadinessServiceTestFactory.ReleaseId, CancellationToken.None);

        cached.ConfidenceScore.Should().Be(assessed.ConfidenceScore);
        cached.Decision.Should().Be(assessed.Decision);
        cached.Stages.Should().HaveCount(assessed.Stages.Count);
    }

    [Test]
    public async Task GetCachedReportAsync_NoAssessmentYetRun_ThrowsReleaseNotFoundException()
    {
        var sut = ReleaseReadinessServiceTestFactory.Create("Clean");

        Func<Task> act = () => sut.GetCachedReportAsync("REL-2003", CancellationToken.None);

        await act.Should().ThrowAsync<ReleaseReadiness.Domain.Exceptions.ReleaseNotFoundException>();
    }
}
