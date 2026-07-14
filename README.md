# Release Readiness AI Assistant

Hackathon Group 33. A CAB approval and go/no-go decision engine for release coordinators.

Coordinators trigger a release readiness check. The system evaluates 8 mocked pipeline stages (Jira, GitHub, SonarQube, Test Results, Azure Monitor, OWASP/Compliance, Deployment Config, Stress Test), computes a weighted confidence score, and returns a GO / GO WITH CONDITIONS / NO GO decision with a written executive summary, critical blockers, and a PDF export. All data is mocked JSON fixtures; each mock maps 1:1 to a named production connector (see `TECHNICAL_DEBT.md`).

## Tech stack

| Layer | Stack |
|---|---|
| Backend | .NET 9, ASP.NET Core, Clean Architecture (API/Application/Domain/Infrastructure), Polly, OpenTelemetry, Serilog, JWT auth, FluentValidation |
| Frontend | React 18, TypeScript (strict), Vite, Zustand, TanStack Query v5, React Router v6, Tailwind CSS |
| Testing | NUnit + FluentAssertions (backend), Jest + React Testing Library (frontend), Playwright (e2e), k6 (load) |

## Demo scenario

Default dataset is scripted to fail. Trigger an assessment on release `REL-2002` (Payments Gateway) and expect:

- **Decision: NO GO**, confidence score **0%**
- Two Critical blockers: **GitHub** (unmerged hotfix PR #482 against `release/2.14`) and **DeploymentConfig** (missing `PAYMENTS_API_KEY`)
- The other 6 stages pass with Low risk
- An executive summary naming both blockers, plus suggested remediation for each

## Run it

Prerequisites: .NET 9 SDK, Node.js 20+.

```bash
# Backend — http://localhost:5000 (Swagger at /swagger, health at /health/live and /health/ready)
cd src/backend/ReleaseReadiness.API
dotnet run

# Frontend — http://localhost:5173
cd src/frontend
npm install
npm run dev
```

Log in with any mock user (password `Password123!` for all, dev-only):

| Username | Role | Can trigger assessment? |
|---|---|---|
| coordinator@demo.io | Release Coordinator | Yes |
| manager@demo.io | Release Manager | Yes, plus approve |
| qalead@demo.io | QA Lead | No — 403 |
| devops@demo.io | DevOps Engineer | No |
| admin@demo.io | Administrator | Yes |

Full prerequisites, env files, and verification steps: [`docs/LocalSetup.md`](./docs/LocalSetup.md).

## Tests

```bash
# Backend, from src/backend
dotnet test

# Frontend, from src/frontend
npm run typecheck && npm run lint && npm test   # unit
npm run e2e                                     # Playwright
```

Full commands and coverage per test file: [`docs/TestingGuide.md`](./docs/TestingGuide.md).

## Docs

- [`docs/README.md`](./docs/README.md) — architecture overview
- [`docs/Architecture.md`](./docs/Architecture.md) — Mermaid diagrams, production readiness checklist
- [`docs/API.md`](./docs/API.md) — every endpoint, request/response examples
- [`docs/AuthGuide.md`](./docs/AuthGuide.md) / [`docs/AuthorizationGuide.md`](./docs/AuthorizationGuide.md) — auth flow, roles, policies
- [`docs/DeploymentGuide.md`](./docs/DeploymentGuide.md) — Docker, env vars
- [`TECHNICAL_DEBT.md`](./TECHNICAL_DEBT.md) — every mock and its production replacement
