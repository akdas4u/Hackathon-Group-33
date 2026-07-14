namespace ReleaseReadiness.Domain.Exceptions;

/// <summary>Thrown when an authenticated principal lacks the permission/policy required for an operation. Maps to HTTP 403.</summary>
public sealed class AuthorizationException : Exception
{
    public AuthorizationException(string message) : base(message)
    {
    }
}
