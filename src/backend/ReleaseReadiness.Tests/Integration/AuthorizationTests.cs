using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using NUnit.Framework;

namespace ReleaseReadiness.Tests.Integration;

/// <summary>
/// Full HTTP-pipeline tests of the <c>CanTriggerAssessment</c> policy: JWT bearer auth
/// + claims-based policy enforcement on <c>POST /releases/{id}/assess</c>.
/// </summary>
[TestFixture]
public sealed class AuthorizationTests
{
    private TestApiFactory _factory = null!;
    private HttpClient _client = null!;

    [SetUp]
    public void SetUp()
    {
        _factory = new TestApiFactory();
        _client = _factory.CreateClient();
    }

    [TearDown]
    public void TearDown()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    [Test]
    public async Task Assess_RoleWithoutTriggerAssessmentPermission_Returns403Forbidden()
    {
        // QA Lead has ReadTestResults + ReadPipeline only -- no TriggerAssessment.
        var token = await LoginAsync("qalead@demo.io", "Password123!");

        var response = await PostAssessAsync("REL-2001", token);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Test]
    public async Task Assess_RoleWithTriggerAssessmentPermission_Returns200Ok()
    {
        // Release Coordinator has TriggerAssessment.
        var token = await LoginAsync("coordinator@demo.io", "Password123!");

        var response = await PostAssessAsync("REL-2001", token);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Test]
    public async Task Assess_DevOpsRoleWithoutTriggerAssessmentPermission_Returns403Forbidden()
    {
        // DevOps Engineer has ReadAllStages + ReadDeploymentConfig only -- no TriggerAssessment.
        var token = await LoginAsync("devops@demo.io", "Password123!");

        var response = await PostAssessAsync("REL-2001", token);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Test]
    public async Task Assess_NoBearerToken_Returns401Unauthorized()
    {
        var response = await _client.PostAsync("/api/v1/releases/REL-2001/assess", content: null);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task Login_InvalidPassword_Returns401Unauthorized()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new { username = "coordinator@demo.io", password = "wrong-password" });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    private Task<HttpResponseMessage> PostAssessAsync(string releaseId, string token)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/releases/{releaseId}/assess");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return _client.SendAsync(request);
    }

    private async Task<string> LoginAsync(string username, string password)
    {
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new { username, password });
        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync();
        using var document = await JsonDocument.ParseAsync(stream);
        return document.RootElement.GetProperty("accessToken").GetString()!;
    }
}
