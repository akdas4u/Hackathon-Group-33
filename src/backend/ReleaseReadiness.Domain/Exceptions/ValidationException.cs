namespace ReleaseReadiness.Domain.Exceptions;

/// <summary>Thrown when an inbound request fails validation. Maps to HTTP 422 with the individual error messages attached.</summary>
public sealed class ValidationException : Exception
{
    public IReadOnlyList<string> Errors { get; }

    public ValidationException(IReadOnlyList<string> errors)
        : base("One or more validation errors occurred.")
    {
        Errors = errors ?? Array.Empty<string>();
    }

    public ValidationException(string error)
        : this(new[] { error })
    {
    }
}
