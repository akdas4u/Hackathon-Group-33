namespace ReleaseReadiness.Application.DTOs;

public sealed record ReleaseDto(string Id, string Name, string Version, string Status);

public sealed record AssessReleaseRequest(string ReleaseId);
