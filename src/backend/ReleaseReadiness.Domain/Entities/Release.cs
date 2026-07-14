namespace ReleaseReadiness.Domain.Entities;

/// <summary>
/// Aggregate root representing a software release under readiness evaluation.
/// Holds the most recently cached <see cref="RiskAssessment"/>, if any, so that
/// GET /report can serve the last computed result without re-running the pipeline.
/// </summary>
public sealed class Release
{
    public string Id { get; }
    public string Name { get; }
    public string Version { get; }
    public string Status { get; }
    public RiskAssessment? LastAssessment { get; private set; }

    public Release(string id, string name, string version, string status, RiskAssessment? lastAssessment = null)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new ArgumentException("Release id must be provided.", nameof(id));
        }

        Id = id;
        Name = name ?? string.Empty;
        Version = version ?? string.Empty;
        Status = status ?? string.Empty;
        LastAssessment = lastAssessment;
    }

    public void RecordAssessment(RiskAssessment assessment)
    {
        LastAssessment = assessment ?? throw new ArgumentNullException(nameof(assessment));
    }
}
