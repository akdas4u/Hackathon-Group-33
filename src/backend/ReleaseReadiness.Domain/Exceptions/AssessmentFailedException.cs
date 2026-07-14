namespace ReleaseReadiness.Domain.Exceptions;

/// <summary>Thrown when the assessment pipeline cannot produce a result (e.g. every stage validator failed). Maps to HTTP 422.</summary>
public sealed class AssessmentFailedException : Exception
{
    public string ReleaseId { get; }

    public AssessmentFailedException(string releaseId, string message)
        : base(message)
    {
        ReleaseId = releaseId;
    }

    public AssessmentFailedException(string releaseId, string message, Exception innerException)
        : base(message, innerException)
    {
        ReleaseId = releaseId;
    }
}
