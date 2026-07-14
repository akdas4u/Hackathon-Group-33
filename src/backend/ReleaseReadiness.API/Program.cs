using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using ReleaseReadiness.API.Configuration;
using ReleaseReadiness.API.Middleware;
using ReleaseReadiness.Application;
using ReleaseReadiness.Infrastructure;
using ReleaseReadiness.Infrastructure.Observability;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Serilog: structured logging (JSON in production), correlation id enriched via CorrelationIdMiddleware.
builder.Host.UseSerilog((context, services, loggerConfiguration) =>
{
    loggerConfiguration
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .WriteTo.Console(outputTemplate:
            "[{Timestamp:HH:mm:ss} {Level:u3}] ({CorrelationId}) {Message:lj}{NewLine}{Exception}");
});

// Fail fast and loud if the JWT secret is missing, instead of a confusing per-request
// crash loop the first time anything tries to authenticate (see JwtAuthenticationSetup).
// Empty appsettings.json ships "" deliberately (fail-closed default) -- Production must
// override it via the Jwt__Secret environment variable.
var jwtSecret = builder.Configuration["Jwt:Secret"];
if (string.IsNullOrWhiteSpace(jwtSecret))
{
    throw new InvalidOperationException(
        "Jwt:Secret is not configured. Set the Jwt__Secret environment variable to a random " +
        "string of at least 32 characters before starting this service.");
}

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// [ApiController]'s automatic ModelState -> 400 ProblemDetails short-circuit is disabled
// so that every validation failure -- including implicit "required" checks ASP.NET Core
// infers from non-nullable route/query parameters -- flows through FluentValidation and
// ExceptionHandlingMiddleware instead, producing one consistent ErrorResponse envelope
// (and the contract's 422, not the framework's default 400) everywhere.
builder.Services.Configure<Microsoft.AspNetCore.Mvc.ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

// Clean Architecture layer registration: API -> Application -> Domain, API -> Infrastructure -> Domain.
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddReleaseReadinessApiVersioning();
builder.Services.AddReleaseReadinessSwagger();
builder.Services.AddReleaseReadinessAuthentication(builder.Configuration);
builder.Services.AddReleaseReadinessAuthorization();
builder.Services.AddReleaseReadinessRateLimiting(builder.Configuration);
builder.Services.AddReleaseReadinessCors(builder.Configuration);
builder.Services.AddReleaseReadinessHealthChecks();

builder.AddReleaseReadinessObservability();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Release Readiness AI Assistant API v1");
});

// Exception handling wraps everything so every downstream failure -- including from
// the middleware below -- still produces the standard ErrorResponse envelope.
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<RequestResponseLoggingMiddleware>();
app.UseMiddleware<SecurityHeadersMiddleware>();

app.UseHttpsRedirection();
app.UseCors(CorsSetup.PolicyName);
app.UseRateLimiter();

// Health checks must stay reachable even if auth is misconfigured -- they're what a
// deploy platform (Railway, k8s, etc.) polls to decide if this container is healthy.
// UseAuthentication() otherwise runs for every request regardless of [AllowAnonymous],
// so without this branch a broken Jwt:Secret takes down health checks too.
app.UseWhen(
    context => !context.Request.Path.StartsWithSegments("/health"),
    branch =>
    {
        branch.UseAuthentication();
        branch.UseAuthorization();
    });

app.MapControllers();

// Health checks: no auth, no /api/v{version} prefix.
app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false }).AllowAnonymous();
app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = check => check.Tags.Contains("ready") }).AllowAnonymous();

app.Run();

// Exposes the implicit top-level Program class publicly so ReleaseReadiness.Tests can
// spin up an in-memory server via WebApplicationFactory<Program> for integration tests.
public partial class Program
{
}
