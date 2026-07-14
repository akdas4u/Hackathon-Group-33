# Deployment Guide

This build is dev/demo-oriented. The steps below produce a working local or demo deployment, not a hardened production one - see `Architecture.md`'s Production Readiness Checklist for what changes before this goes to production.

## Docker build steps

Each app is expected to own its own `Dockerfile` (backend at `src/backend/Dockerfile`, frontend at `src/frontend/Dockerfile`), built by the parallel backend/frontend workstreams. `docker-compose.yml` at the repo root wires both together for a one-command demo run:

```bash
docker compose build
docker compose up
```

This builds:

- `backend` from `src/backend` (multi-stage: `dotnet publish` → ASP.NET Core runtime image), exposing port `5000`.
- `frontend` from `src/frontend` (multi-stage: `npm run build` → static assets served, e.g. via `nginx` or `vite preview`), exposing port `5173`.

Both containers join a single `release-readiness-net` bridge network so the frontend container can reach the backend by its service name (`http://backend:5000`) if configured to do so via `VITE_API_BASE_URL`.

To build/run only one side:

```bash
docker compose build backend
docker compose up backend
```

## Required environment variables (production)

These are never committed with real values. Production values are sourced from Azure Key Vault (see `Architecture.md` Production Readiness Checklist), injected as environment variables or mounted secrets at deploy time.

| Variable | Used by | Purpose |
|---|---|---|
| `Jwt__Secret` | Backend | JWT signing key (HS256) - replaced entirely if swapping to Azure AD, see `AuthGuide.md` |
| `Jwt__Issuer` | Backend | Token issuer claim |
| `Jwt__Audience` | Backend | Token audience claim |
| `Jwt__ExpiryMinutes` | Backend | Access token lifetime |
| `MockData__Enabled` | Backend | Feature flag - `false` once real connectors replace fixtures |
| `RateLimit__RequestsPerMinute` | Backend | Per-user rate limit, tune for production load |
| `Resilience__RetryCount` / `CircuitBreakerThreshold` / `TimeoutSeconds` | Backend | Polly policy tuning |
| `ASPNETCORE_ENVIRONMENT` | Backend | `Production` in prod |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Backend | Points OpenTelemetry at the production collector (Azure Monitor / Jaeger) instead of the local/console exporter |
| `ConnectionStrings__ReleaseReadinessDb` | Backend | Real database connection string once in-memory repo is replaced |
| `VITE_API_BASE_URL` | Frontend (build-time) | Production backend URL |
| `VITE_APP_ENV` | Frontend (build-time) | `production` |
| `VITE_MOCK_AUTH` | Frontend (build-time) | `false` in production - disables any dev-only auth shortcuts |

## CORS and security headers

Production CORS must list explicit allowed origins (the deployed frontend domain only) - no wildcard. Security headers middleware (`X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`) is applied by default; validate the `Content-Security-Policy` value against the real frontend's asset origins before go-live.

## Reference

See `docker-compose.yml` at the repo root for the full service definitions, and `.github/workflows/ci.yml`'s `deploy` job for the (placeholder, manual-trigger-only) deployment pipeline entry point.
