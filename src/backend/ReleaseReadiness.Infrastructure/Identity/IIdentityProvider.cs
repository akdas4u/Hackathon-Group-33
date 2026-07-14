namespace ReleaseReadiness.Infrastructure.Identity;

public sealed record AuthenticatedUser(string Username, string Role, IReadOnlyList<string> Permissions);

public sealed record TokenPair(string AccessToken, string RefreshToken);

/// <summary>
/// Seam for swapping the mock identity provider for Azure AD / Entra ID / any
/// OAuth2/OIDC provider without touching any caller. <see cref="MockTokenService"/> is
/// the only implementation today: it issues HS256 JWTs from <c>users.json</c> /
/// <c>roles.json</c> and never a real identity backend.
/// </summary>
public interface IIdentityProvider
{
    Task<AuthenticatedUser?> ValidateCredentialsAsync(string username, string password, CancellationToken cancellationToken);

    Task<TokenPair> IssueTokensAsync(AuthenticatedUser user, CancellationToken cancellationToken);

    /// <summary>Returns a fresh access token if the refresh token is known and still valid; null otherwise.</summary>
    Task<string?> RefreshAccessTokenAsync(string refreshToken, CancellationToken cancellationToken);
}
