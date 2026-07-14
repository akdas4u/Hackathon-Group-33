# Release Readiness AI Assistant

Coordinators trigger a single "Run Assessment" action. The system evaluates 8 mocked pipeline stages, computes a weighted confidence score, and returns a GO / GO WITH CONDITIONS / NO GO decision with a written executive summary. Every data source is a mocked JSON fixture for this hackathon build; production would swap each mock for a named MCP connector or API (see `Architecture.md`).

## What it evaluates

| # | Stage key | Source (mocked) |
|---|---|---|
| 1 | Jira | `jira-stories.json` |
| 2 | GitHub | `pull-requests.json` |
| 3 | SonarQube | `sonarqube-results.json` |
| 4 | TestResults | `test-results.json` |
| 5 | AzureMonitor | `azure-monitor.json` |
| 6 | OwaspCompliance | `owasp-results.json` |
| 7 | DeploymentConfig | `deployment-config.json` |
| 8 | StressTest | `stress-test-results.json` |

## Scripted demo outcome

The primary demo dataset scores `GitHub` and `DeploymentConfig` as Critical (unmerged hotfix PR #482 against `release/2.14`, and a missing `PAYMENTS_API_KEY`). Any Critical stage forces `confidenceScore = 0` and `decision = NoGo`, regardless of the other 6 stages. See `Architecture.md` diagram 8 for the full scoring rule.

## Architecture summary

- **Frontend**: React + TypeScript + Vite, Zustand for auth/pipeline/UI state, TanStack Query for data fetching, Axios inside query fetchers, a generated OpenAPI TypeScript client, shadcn-style primitives on Tailwind.
- **Backend**: .NET 9 ASP.NET Core, Clean Architecture (API -> Application -> Domain, Infrastructure -> Domain), JWT (HS256) mock auth, Polly resilience around a mock SonarQube client, OpenTelemetry + Serilog observability, 13 JSON fixtures as the mock repository layer.

Full diagrams (solution architecture, components, API flow, auth flow, authorization flow, data flow, full vertical-slice sequence, confidence score calculation) live in [`Architecture.md`](./Architecture.md).

## 60-second quick start

```bash
# Backend (from src/backend/ReleaseReadiness.API)
dotnet run

# Frontend (from src/frontend)
npm install && npm run dev
```

Full prerequisites, ports, and env files: [`LocalSetup.md`](./LocalSetup.md).

## Documentation index

| Doc | Covers |
|---|---|
| [`Architecture.md`](./Architecture.md) | 8 Mermaid diagrams, production readiness checklist, known assumptions |
| [`API.md`](./API.md) | Every endpoint, request/response examples, error codes |
| [`AuthGuide.md`](./AuthGuide.md) | JWT flow, mock users, swapping in Azure AD / Entra ID |
| [`AuthorizationGuide.md`](./AuthorizationGuide.md) | Roles, permissions, policy evaluation, adding a role |
| [`LocalSetup.md`](./LocalSetup.md) | Prerequisites, env files, run commands |
| [`TestingGuide.md`](./TestingGuide.md) | NUnit, Jest, Playwright, k6 |
| [`DeploymentGuide.md`](./DeploymentGuide.md) | Docker build, production env vars |

Root-level [`TECHNICAL_DEBT.md`](../TECHNICAL_DEBT.md) lists every mock/shortcut and what replaces it in production.
