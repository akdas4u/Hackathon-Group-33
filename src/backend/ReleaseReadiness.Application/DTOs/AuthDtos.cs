namespace ReleaseReadiness.Application.DTOs;

public sealed record LoginRequest(string Username, string Password);

public sealed record UserDto(string Username, string Role, IReadOnlyList<string> Permissions);

public sealed record LoginResponse(string AccessToken, string RefreshToken, UserDto User);

public sealed record RefreshRequest(string RefreshToken);

public sealed record RefreshResponse(string AccessToken);
