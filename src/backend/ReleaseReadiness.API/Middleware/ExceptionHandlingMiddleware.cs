using System.Net;
using System.Text.Json;
using ReleaseReadiness.Domain.Exceptions;

namespace ReleaseReadiness.API.Middleware;

/// <summary>
/// Global exception middleware: catches every unhandled exception, maps the known
/// Domain exceptions to their HTTP status code, and always responds with the standard
/// <see cref="ErrorResponse"/> envelope. Never leaks stack traces to the client.
/// </summary>
public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context).ConfigureAwait(false);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception).ConfigureAwait(false);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var correlationId = context.Items.TryGetValue(CorrelationIdMiddleware.HttpContextItemKey, out var value)
            ? value?.ToString() ?? string.Empty
            : string.Empty;

        var (statusCode, message, errors) = Map(exception);

        _logger.LogError(
            exception,
            "Unhandled exception mapped to {StatusCode}. CorrelationId={CorrelationId} Path={Path}",
            statusCode,
            correlationId,
            context.Request.Path);

        var response = new ErrorResponse(
            correlationId,
            statusCode,
            message,
            errors,
            DateTimeOffset.UtcNow.ToString("O"));

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions)).ConfigureAwait(false);
    }

    private (int StatusCode, string Message, IReadOnlyList<string> Errors) Map(Exception exception) => exception switch
    {
        ReleaseNotFoundException notFound => ((int)HttpStatusCode.NotFound, notFound.Message, Array.Empty<string>()),
        ValidationException validation => ((int)HttpStatusCode.UnprocessableEntity, validation.Message, validation.Errors),
        AssessmentFailedException assessmentFailed => ((int)HttpStatusCode.UnprocessableEntity, assessmentFailed.Message, Array.Empty<string>()),
        AuthorizationException authorization => ((int)HttpStatusCode.Forbidden, authorization.Message, Array.Empty<string>()),
        _ => ((int)HttpStatusCode.InternalServerError, SafeMessage(exception), Array.Empty<string>())
    };

    /// <summary>Never exposes stack traces or internal exception detail outside Development.</summary>
    private string SafeMessage(Exception exception) =>
        _environment.IsDevelopment() ? exception.Message : "An unexpected error occurred. Please try again or contact support.";
}
