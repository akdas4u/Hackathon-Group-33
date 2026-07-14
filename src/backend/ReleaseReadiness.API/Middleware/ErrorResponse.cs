namespace ReleaseReadiness.API.Middleware;

/// <summary>The standard error envelope returned for every non-2xx response.</summary>
public sealed record ErrorResponse(
    string CorrelationId,
    int StatusCode,
    string Message,
    IReadOnlyList<string> Errors,
    string Timestamp);
