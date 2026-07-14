namespace ReleaseReadiness.Domain.Exceptions;

/// <summary>Thrown when a requested release id does not exist in the repository. Maps to HTTP 404.</summary>
public sealed class ReleaseNotFoundException : Exception
{
    public string ReleaseId { get; }

    public ReleaseNotFoundException(string releaseId)
        : base($"Release '{releaseId}' was not found.")
    {
        ReleaseId = releaseId;
    }
}
