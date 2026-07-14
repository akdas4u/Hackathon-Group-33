using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using ReleaseReadiness.Infrastructure.MockData;

namespace ReleaseReadiness.Infrastructure.Identity;

/// <summary>
/// TECHNICAL DEBT: mock identity provider for the hackathon demo. Reads credentials
/// and roles from <c>users.json</c> / <c>roles.json</c> and issues real, self-signed
/// HS256 JWTs. Replace with Azure AD / Entra ID (MSAL) in production -- callers only
/// depend on <see cref="IIdentityProvider"/>, so the swap is contained to DI registration.
/// </summary>
public sealed class MockTokenService : IIdentityProvider
{
    private const string UsersFile = "users.json";
    private const string RolesFile = "roles.json";

    private readonly IMockDataProvider _dataProvider;
    private readonly JwtOptions _jwtOptions;
    private readonly ConcurrentDictionary<string, string> _refreshTokenToUsername = new(StringComparer.Ordinal);

    public MockTokenService(IMockDataProvider dataProvider, IOptions<JwtOptions> jwtOptions)
    {
        _dataProvider = dataProvider;
        _jwtOptions = jwtOptions.Value;
    }

    public async Task<AuthenticatedUser?> ValidateCredentialsAsync(string username, string password, CancellationToken cancellationToken)
    {
        JsonDocument usersDocument = await _dataProvider.LoadAsync(UsersFile, cancellationToken).ConfigureAwait(false);

        JsonElement userElement = usersDocument.RootElement.GetProperty("users").EnumerateArray()
            .FirstOrDefault(u => string.Equals(u.GetProperty("username").GetString(), username, StringComparison.OrdinalIgnoreCase));

        if (userElement.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        string? storedPassword = userElement.GetProperty("password").GetString();
        if (!string.Equals(storedPassword, password, StringComparison.Ordinal))
        {
            return null;
        }

        string role = userElement.GetProperty("role").GetString() ?? string.Empty;
        var permissions = await GetPermissionsForRoleAsync(role, cancellationToken).ConfigureAwait(false);

        return new AuthenticatedUser(username, role, permissions);
    }

    public Task<TokenPair> IssueTokensAsync(AuthenticatedUser user, CancellationToken cancellationToken)
    {
        string accessToken = GenerateAccessToken(user);
        string refreshToken = GenerateRefreshToken();
        _refreshTokenToUsername[refreshToken] = user.Username;
        return Task.FromResult(new TokenPair(accessToken, refreshToken));
    }

    public async Task<string?> RefreshAccessTokenAsync(string refreshToken, CancellationToken cancellationToken)
    {
        if (!_refreshTokenToUsername.TryGetValue(refreshToken, out string? username))
        {
            return null;
        }

        JsonDocument usersDocument = await _dataProvider.LoadAsync(UsersFile, cancellationToken).ConfigureAwait(false);
        JsonElement userElement = usersDocument.RootElement.GetProperty("users").EnumerateArray()
            .FirstOrDefault(u => string.Equals(u.GetProperty("username").GetString(), username, StringComparison.OrdinalIgnoreCase));

        if (userElement.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        string role = userElement.GetProperty("role").GetString() ?? string.Empty;
        var permissions = await GetPermissionsForRoleAsync(role, cancellationToken).ConfigureAwait(false);

        return GenerateAccessToken(new AuthenticatedUser(username, role, permissions));
    }

    private async Task<IReadOnlyList<string>> GetPermissionsForRoleAsync(string role, CancellationToken cancellationToken)
    {
        JsonDocument rolesDocument = await _dataProvider.LoadAsync(RolesFile, cancellationToken).ConfigureAwait(false);

        JsonElement roleElement = rolesDocument.RootElement.GetProperty("roles").EnumerateArray()
            .FirstOrDefault(r => string.Equals(r.GetProperty("name").GetString(), role, StringComparison.OrdinalIgnoreCase));

        if (roleElement.ValueKind != JsonValueKind.Object)
        {
            return Array.Empty<string>();
        }

        return roleElement.GetProperty("permissions").EnumerateArray()
            .Select(p => p.GetString() ?? string.Empty)
            .ToArray();
    }

    private string GenerateAccessToken(AuthenticatedUser user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Secret));
        var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Username),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, user.Role),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        claims.AddRange(user.Permissions.Select(permission => new Claim("permission", permission)));

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtOptions.ExpiryMinutes),
            signingCredentials: signingCredentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
}
