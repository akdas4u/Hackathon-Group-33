using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using NUnit.Framework;

namespace ReleaseReadiness.Tests.Integration;

/// <summary>
/// Full HTTP-pipeline tests of the FluentValidation -> <c>ValidationException</c> -> 422
/// <c>ErrorResponse</c> path. <c>ApiBehaviorOptions.SuppressModelStateInvalidFilter</c>
/// is set in Program.cs specifically so every invalid request -- including ones ASP.NET
/// Core would otherwise auto-reject with its own 400 ProblemDetails -- flows through
/// this single, consistent envelope instead.
/// </summary>
[TestFixture]
public sealed class ValidationTests
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
    public async Task Login_EmptyUsernameAndPassword_Returns422WithErrorEnvelope()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new { username = "", password = "" });

        response.StatusCode.Should().Be((HttpStatusCode)422);

        var body = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(body);
        document.RootElement.GetProperty("statusCode").GetInt32().Should().Be(422);
        document.RootElement.GetProperty("errors").GetArrayLength().Should().BeGreaterThan(0);
        document.RootElement.TryGetProperty("correlationId", out _).Should().BeTrue();
        document.RootElement.TryGetProperty("timestamp", out _).Should().BeTrue();
    }

    [Test]
    public async Task Assess_ReleaseIdExceedsMaximumLength_Returns422()
    {
        var token = await LoginAsync("coordinator@demo.io", "Password123!");
        var tooLongReleaseId = new string('x', 100);

        var request = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/releases/{tooLongReleaseId}/assess");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be((HttpStatusCode)422);
    }

    [Test]
    public async Task Assess_UnknownButValidReleaseId_Returns404NotFound()
    {
        var token = await LoginAsync("coordinator@demo.io", "Password123!");

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/releases/does-not-exist/assess");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task Refresh_EmptyRefreshToken_Returns422()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/auth/refresh", new { refreshToken = "" });

        response.StatusCode.Should().Be((HttpStatusCode)422);
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
