# Authentication Guide

Authentication is fully mocked for this hackathon build. The architecture is designed so `MockTokenService` can be swapped for Azure AD / Entra ID without touching `Application` or `Domain` layers.

## JWT flow

1. User submits email + password to `POST /api/v1/auth/login`.
2. `MockTokenService` (in `ReleaseReadiness.Infrastructure/Identity`) looks the user up in the `users.json` fixture, checks the password, and reads the user's role and permissions from `roles.json`.
3. On success, the service issues:
   - an **access token**: JWT, signed HS256, 60-minute expiry, `iss=ReleaseReadinessAI`, `aud=ReleaseReadinessUI`, claims include `sub` (email), `role`, and one `permission` claim per granted permission.
   - a **refresh token**: opaque GUID, longer-lived, used only against `POST /api/v1/auth/refresh`.
4. The frontend stores both tokens in the Zustand `auth` store (not `localStorage` directly - the store may persist to storage, but components never read tokens from storage themselves).
5. Every subsequent request attaches `Authorization: Bearer <accessToken>`.
6. On a `401` caused by an expired access token, the frontend calls `/auth/refresh` with the stored refresh token, receives a new pair, updates the Zustand store, and retries the original request once.

See `Architecture.md` diagram 4 for the full sequence diagram.

## Mock users

Password value below is a **development-only fixture value**, defined in `users.json`. It is never used, checked, or referenced outside local/demo environments, and must never be reused in a real credential store.

| Email | Role | Permissions | Password (dev-only fixture value) |
|---|---|---|---|
| `coordinator@demo.io` | ReleaseCoordinator | `ReadPipeline`, `TriggerAssessment` | `Password123!` |
| `manager@demo.io` | ReleaseManager | `ReadPipeline`, `TriggerAssessment`, `ApproveDecision` | `Password123!` |
| `qalead@demo.io` | QALead | `ReadTestResults`, `ReadPipeline` (no `TriggerAssessment` - gets 403 on `assess`) | `Password123!` |
| `devops@demo.io` | DevOpsEngineer | `ReadAllStages`, `ReadDeploymentConfig` | `Password123!` |
| `admin@demo.io` | Administrator | All permissions | `Password123!` |

## Token contents (example, decoded)

```json
{
  "sub": "coordinator@demo.io",
  "role": "ReleaseCoordinator",
  "permission": ["ReadPipeline", "TriggerAssessment"],
  "iss": "ReleaseReadinessAI",
  "aud": "ReleaseReadinessUI",
  "iat": 1752480000,
  "exp": 1752483600
}
```

## Configuration

Defined in `appsettings.Development.json` under `Jwt`:

```json
{
  "Jwt": {
    "Secret": "dev-secret-min-32-chars-replace-in-prod",
    "Issuer": "ReleaseReadinessAI",
    "Audience": "ReleaseReadinessUI",
    "ExpiryMinutes": 60
  }
}
```

The secret is a development-only value read from configuration, never hardcoded in source, and never committed for any non-development environment.

## Swapping in Azure AD / Entra ID (production path)

1. Implement `IIdentityProvider` (already the seam used by `Application`) against Microsoft.Identity.Web / MSAL instead of `MockTokenService`.
2. Replace the login/refresh endpoints with the standard OAuth2 Authorization Code + PKCE flow (frontend redirects to Entra ID; no password ever touches this API).
3. Configure the API as a protected resource in Entra ID (`Audience` = the app registration's API URI); ASP.NET Core JWT bearer middleware validates tokens against Entra ID's public signing keys (JWKS) instead of the local HS256 secret.
4. On the frontend, replace the Zustand-managed login form with MSAL's `PublicClientApplication`; MSAL manages token acquisition, caching, and silent refresh, so the Zustand `auth` store becomes a thin projection of MSAL's account state rather than the source of truth.
5. Map Entra ID app roles / group claims to the same `role` and `permission` claims this API already expects, so `AuthorizationGuide.md`'s policy definitions do not need to change.
6. Move the JWT secret out of configuration entirely - Entra ID issues and validates its own tokens, so there is no shared secret to store in Key Vault for this flow.
