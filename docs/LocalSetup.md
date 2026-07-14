# Local Setup

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| .NET SDK | 9.x | Backend build/run/test |
| Node.js | 20+ | Frontend build/run/test |
| npm | Bundled with Node 20+ | Frontend package manager |
| Git | Any recent | Clone the repo |
| Docker + Docker Compose | Optional | Only needed for `docker-compose.yml` path - see `DeploymentGuide.md` |

## Environment files

### Backend

`src/backend/ReleaseReadiness.API/appsettings.Development.json` (checked in, dev-only values - never real secrets):

```json
{
  "Jwt": {
    "Secret": "dev-secret-min-32-chars-replace-in-prod",
    "Issuer": "ReleaseReadinessAI",
    "Audience": "ReleaseReadinessUI",
    "ExpiryMinutes": 60
  },
  "MockData": {
    "Enabled": true,
    "DataPath": "Infrastructure/MockData"
  },
  "RateLimit": {
    "RequestsPerMinute": 100
  },
  "Resilience": {
    "RetryCount": 3,
    "CircuitBreakerThreshold": 5,
    "TimeoutSeconds": 10
  }
}
```

No `.env` file is used on the backend - configuration is `appsettings.{Environment}.json` plus User Secrets for anything sensitive in real (non-mock) environments.

### Frontend

Create `src/frontend/.env.development` (already listed in the spec, not committed with real values beyond these dev defaults):

```
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_ENV=development
VITE_MOCK_AUTH=true
```

And `src/frontend/.env.production` for production builds:

```
VITE_API_BASE_URL=https://api.releasereadiness.internal
VITE_APP_ENV=production
VITE_MOCK_AUTH=false
```

Never commit real production values into `.env.production` - treat it as a template.

## Run the backend

```bash
cd src/backend/ReleaseReadiness.API
dotnet restore
dotnet run
```

Default URLs:

- API: `http://localhost:5000` (HTTPS on `https://localhost:5001` if the dev HTTPS profile is used)
- Swagger UI: `http://localhost:5000/swagger`
- Health checks: `http://localhost:5000/health/live`, `http://localhost:5000/health/ready`

## Run the frontend

```bash
cd src/frontend
npm install
npm run dev
```

Default URL: `http://localhost:5173` (Vite default).

## First login

Use any mock user from `AuthGuide.md`, e.g. `coordinator@demo.io` / `Password123!` (dev-only fixture value), against the running backend at `http://localhost:5000`.

## Verify the stack is up

1. Backend: `GET http://localhost:5000/health/live` returns `{"status":"Healthy"}`.
2. Frontend: open `http://localhost:5173`, log in, and confirm the dashboard lists 3 releases.
3. Trigger an assessment on release `REL-2002` (Payments Gateway) and confirm a NO GO panel appears with 2 blockers, GitHub and DeploymentConfig (see `API.md` for the exact expected response).
