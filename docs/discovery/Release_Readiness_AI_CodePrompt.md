# Claude Code Harness Prompt
## Release Readiness AI Assistant — Hackathon Group 33

---

## Objective

Scaffold a **minimal, production-ready MVP** for the complete feature set covering **User Stories 1 to 16**.

The solution must demonstrate enterprise architecture and engineering best practices while remaining lightweight enough to **build, run, and demonstrate in under 10 minutes** using **mock data**.

---

## Technology Stack

### Frontend

| Concern | Technology | Version | Notes |
|---|---|---|---|
| UI Framework | ReactJS | Latest Stable | Functional components only |
| Language | TypeScript | 5.x | Strict mode enabled |
| Routing | React Router | v6 | |
| State Management | **Zustand** | Latest | Replaces prop-drilling; auth state, pipeline results, confidence score |
| Data Fetching | **TanStack Query (React Query)** | v5 | Loading states, caching, retries, error boundaries — replaces raw Axios for API calls |
| HTTP Client | Axios | Latest | Used inside TanStack Query fetchers only |
| UI Components | **shadcn/ui** | Latest | Unstyled, composable; Version 1 brand tokens applied via Tailwind |
| Styling | **Tailwind CSS** | v3 | Utility-first; shadcn/ui peer dependency |
| Unit Testing | Jest + React Testing Library | Latest | |
| E2E Testing | Playwright | Latest | |
| API Contract | **openapi-typescript** | Latest | Auto-generate TypeScript client from Swagger spec — zero drift |
| Environment Config | **dotenv** (.env files) | — | `.env.development`, `.env.production`; never commit secrets |

### Backend

| Concern | Technology | Version | Notes |
|---|---|---|---|
| Framework | ASP.NET Core Web API | .NET 9 | |
| Language | C# | 13 | Nullable reference types enabled |
| API Documentation | Swagger / OpenAPI | Swashbuckle | |
| **API Versioning** | **Asp.Versioning.Http** | Latest | Declare from day one; default v1 |
| Unit Testing | NUnit + FluentAssertions | Latest | |
| Resilience | **Polly v8** | Latest | Retry, Circuit Breaker, Timeout, Bulkhead, Fallback |
| Observability | OpenTelemetry | Latest | Traces, metrics, logs |
| Repository | In-Memory (Mock Data) | — | Interface-first; swap for real DB/MCP without touching services |
| Environment Config | **appsettings.{env}.json** | — | `Development`, `Staging`, `Production`; secrets via User Secrets locally |

### Performance Testing

| Concern | Technology | Notes |
|---|---|---|
| Load Testing | **k6** | Replaces LoadRunner — open source, JS scripting, GitHub Actions native, results in minutes |
| Sample Scenario | k6 script | Ramp 10→100 VUs, 2-minute soak, P95 target <500ms |

---

## Solution Structure

```
ReleaseReadinessAI/
├── src/
│   ├── frontend/                        # React + TypeScript
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── api/                     # Axios fetchers + openapi-typescript client
│   │   │   ├── components/              # shadcn/ui + custom components
│   │   │   │   ├── ui/                  # shadcn primitives
│   │   │   │   ├── pipeline/            # Stage cards, status badges, confidence score
│   │   │   │   ├── decision/            # GO/NO-GO panel, executive summary
│   │   │   │   └── auth/                # Login form, protected route wrapper
│   │   │   ├── hooks/                   # TanStack Query hooks per pipeline stage
│   │   │   ├── store/                   # Zustand stores (auth, pipeline, ui)
│   │   │   ├── pages/                   # Dashboard, Login, ReleaseDetail, Report
│   │   │   ├── types/                   # Generated from openapi-typescript
│   │   │   ├── utils/                   # Confidence score calculator, formatters
│   │   │   └── tests/                   # Jest + Playwright
│   │   ├── .env.development
│   │   ├── .env.production
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── backend/                         # .NET 9 ASP.NET Core
│       ├── ReleaseReadiness.API/
│       │   ├── Controllers/             # Versioned controllers (v1)
│       │   ├── Middleware/              # Auth, exception, correlation ID, request logging
│       │   ├── Configuration/           # appsettings.json, appsettings.Development.json
│       │   └── Program.cs
│       ├── ReleaseReadiness.Application/
│       │   ├── Services/                # IReleaseReadinessService, IRiskAssessmentService
│       │   ├── DTOs/                    # Request/Response models
│       │   └── Validators/              # FluentValidation
│       ├── ReleaseReadiness.Domain/
│       │   ├── Entities/                # Release, PipelineStage, RiskAssessment
│       │   ├── Enums/                   # StageStatus, RiskLevel, DecisionType
│       │   └── Exceptions/              # Custom domain exceptions
│       ├── ReleaseReadiness.Infrastructure/
│       │   ├── Repositories/            # IMock* implementations
│       │   ├── MockData/                # All JSON fixture files
│       │   ├── Resilience/              # Polly pipeline configurations
│       │   └── Observability/           # OpenTelemetry setup
│       └── ReleaseReadiness.Tests/
│           ├── Unit/
│           ├── Integration/
│           └── Performance/             # k6 scripts
│
├── docs/
│   ├── README.md
│   ├── Architecture.md
│   ├── API.md
│   ├── AuthGuide.md
│   ├── LocalSetup.md
│   ├── TestingGuide.md
│   └── DeploymentGuide.md
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
└── docker-compose.yml
```

---

## Generate the Following

Create a complete solution including:

- Solution and folder structure (as above)
- Project references and configuration files
- Sample mock data (JSON fixtures)
- REST APIs (versioned, OpenAPI documented)
- React UI (shadcn/ui + Tailwind + Version 1 brand colours)
- Zustand stores for auth, pipeline state, and UI state
- TanStack Query hooks for all API calls
- openapi-typescript client generated from Swagger spec
- Business service layer
- Repository layer (interface-first, in-memory mock implementation)
- Mock authentication and authorization
- Polly resilience pipelines
- Unit tests (Jest frontend, NUnit backend)
- E2E tests (Playwright)
- k6 performance test script
- Full documentation set
- GitHub Actions CI/CD pipeline

The solution must compile and execute successfully.

---

## Authentication & Authorization (Mock)

Implement using mock data. Architecture must be designed for future drop-in replacement with Azure AD / Entra ID / OAuth2 / OpenID Connect.

Include:

- Mock Login API (`POST /api/v1/auth/login`)
- Mock JWT token generation (HS256, configurable secret via appsettings)
- Mock refresh token endpoint
- Mock users, roles, and permissions stored in JSON fixture
- Claims-based, role-based, and policy-based authorization
- Authorization middleware (applied globally, exclude `/health` and `/swagger`)
- Protected API endpoints — return 401 Unauthorized / 403 Forbidden correctly
- Auth state managed in Zustand store on the frontend
- Protected route wrapper component using React Router v6

**Mock Roles:**

| Role | Permissions |
|---|---|
| Release Coordinator | Read pipeline, trigger assessment |
| Release Manager | Read pipeline, trigger assessment, approve GO/NO-GO |
| QA Lead | Read test results, read pipeline |
| DevOps Engineer | Read all stages, read deployment config |
| Administrator | Full access |

---

## Resilience Patterns (Polly v8)

Apply to all external dependency calls (mock service boundary counts as external).

Include:

- Retry (3 attempts, exponential backoff with jitter)
- Circuit Breaker (open after 5 failures, 30s reset)
- Timeout (10s per request)
- Bulkhead Isolation (max 10 concurrent calls per dependency)
- Fallback (return cached last-known result or degraded response)
- Idempotent API design (safe GET, conditional PUT with ETag)
- Rate Limiting (ASP.NET Core built-in, 100 req/min per user)
- Health Checks (`/health/live`, `/health/ready`)
- Graceful degradation (if one stage fails, others continue; mark stage as Unavailable)
- Transient fault handling (HttpRequestException, TimeoutException, SocketException)

Demonstrate with one sample mock external service (e.g. SonarQube mock client).

---

## Environment Configuration

### Frontend (.env files)

```
# .env.development
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_ENV=development
VITE_MOCK_AUTH=true
```

```
# .env.production
VITE_API_BASE_URL=https://api.releasereadiness.internal
VITE_APP_ENV=production
VITE_MOCK_AUTH=false
```

### Backend (appsettings)

```json
// appsettings.Development.json
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

---

## API Versioning

- Use `Asp.Versioning.Http` from day one
- Default version: `v1`
- Version via URL segment: `/api/v1/releases`
- Deprecated versions return `Sunset` header
- Swagger generates separate docs per version

---

## End-to-End Vertical Slice

Implement one complete working flow for **Trigger Release Readiness Assessment**:

```
[React Button: "Run Assessment"]
        ↓
[Zustand: set loading state]
        ↓
[TanStack Query mutation → Axios POST /api/v1/releases/{id}/assess]
        ↓
[JWT Authorization header validated by middleware]
        ↓
[Policy check: requires "CanTriggerAssessment" claim]
        ↓
[ReleaseReadinessService.AssessAsync(releaseId, cancellationToken)]
        ↓
[7x Stage validators run in parallel (Task.WhenAll)]
        ↓
[MockRepository returns fixture data per stage]
        ↓
[RiskAssessmentService calculates confidence score]
        ↓ Confidence = weighted avg(stage scores)
          Critical=0%, High=40%, Medium=70%, Low=100%
          Single Critical caps overall → NO GO
        ↓
[Structured log + OpenTelemetry span emitted]
        ↓
[ReleaseReadinessResponse returned (200 OK)]
        ↓
[TanStack Query updates cache]
        ↓
[Zustand pipeline store updated]
        ↓
[React UI renders: stage table, confidence score, GO/NO-GO panel]
        ↓
[NUnit test: AssessAsync returns correct decision for scripted blockers]
        ↓
[Playwright test: button click → NO GO panel visible with 2 blockers]
```

---

## Demo Scenario (Scripted Failure Path)

The primary demo mock dataset must contain exactly two blockers:

- **Blocker 1** — Deployment Config stage: missing external API configuration key → Critical → stage Fail
- **Blocker 2** — GitHub stage: unmerged hotfix PR against release branch → Critical → stage Fail

Expected system output:
- Overall decision: **NO GO**
- Confidence score: **0%** (Critical finding present)
- Critical Issues panel: both blockers listed with stage, evidence, and suggested remediation
- All other 5 stages: Pass with their respective risk ratings

The happy-path dataset (all stages Pass, no blockers) must also be available as a toggle for demo flexibility.

---

## Mock Data (JSON Fixtures)

Provide realistic fixtures for:

- `users.json` — 5 users, one per role
- `roles.json` — roles with permissions array
- `releases.json` — 3 releases (in-progress, blocked, completed)
- `jira-stories.json` — 20 stories, mix of Done/In Progress/Blocked
- `pull-requests.json` — including 1 unmerged hotfix PR
- `sonarqube-results.json` — quality gate passed, 2 code smells
- `test-results.json` — 487/500 passed, 5 failed non-critical, 8 skipped
- `azure-monitor.json` — 99.8% availability, 3 warnings, 0 critical alerts
- `owasp-results.json` — 0 critical CVEs, 2 medium findings
- `stress-test-results.json` — P95 320ms, 0 errors at 500 RPS
- `deployment-config.json` — missing external API config key (scripted blocker)
- `release-risks.json` — historical risk patterns
- `release-history.json` — last 10 releases with outcomes

Each fixture file has a comment block at the top: `// MOCK: Replace with [connector name] MCP call or [API endpoint] in production`

---

## Confidence Score

Weighted aggregation across all 7 pipeline validation stages:

| Risk Rating | Score |
|---|---|
| Critical finding | 0% |
| High risk | 40% |
| Medium risk | 70% |
| Low risk / Pass | 100% |

Rules:
- Overall score = average of all stage scores
- Single Critical finding → caps total score at 0% → forces NO GO
- Score 80–100% → GO
- Score 50–79% → GO WITH CONDITIONS
- Score 0–49% → NO GO

---

## Exception Handling

- Global exception middleware (catches all unhandled exceptions)
- Custom exception types: `ReleaseNotFoundException`, `AssessmentFailedException`, `AuthorizationException`, `ValidationException`
- Standard error response envelope: `{ correlationId, statusCode, message, errors[], timestamp }`
- Validation errors: FluentValidation → 422 Unprocessable Entity
- Correlation ID: generated per request, propagated in response headers and logs
- Meaningful error messages (never expose stack traces in production)
- Serilog structured logging integration

---

## Observability

- OpenTelemetry SDK (traces + metrics + logs)
- Structured logging via Serilog (JSON output in production)
- Distributed tracing: trace per assessment, child spans per stage validator
- Correlation ID: generated at middleware, attached to all log entries and response headers
- Audit log: every GO/NO-GO decision logged with user, timestamp, release ID, confidence score
- Application metrics: assessment count, average duration, decision distribution (GO/NOGO/CONDITIONS)
- Health checks: `/health/live` (process alive), `/health/ready` (dependencies available)
- Request and response logging middleware (log method, path, status, duration)
- Diagnostic events for circuit breaker state changes

---

## Security

- OWASP Top 10 mitigations applied
- Security headers middleware: `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`
- Input validation on all API endpoints (FluentValidation)
- Output encoding (React handles by default; verify no `dangerouslySetInnerHTML`)
- Secrets via configuration only — no hardcoded values anywhere
- Mock identity provider interface (`IIdentityProvider`) for future Azure AD swap
- Least privilege: each role has minimum permissions required
- JWT: short expiry (60 min), refresh token pattern, HTTPS only in production
- CORS: configured explicitly, no wildcard in production

---

## Scalability

- Stateless APIs (no server-side session)
- Configuration-driven mock/real switching (feature flag per data source)
- Extensible stage validator pattern: add new pipeline stage by implementing `IStageValidator`
- Caching placeholder: `ICacheService` interface with `NoOpCacheService` default
- Background worker placeholder: `IAssessmentBackgroundWorker` for async batch assessment
- Event-driven extension: `IDomainEventPublisher` interface for future messaging (Azure Service Bus)
- Horizontal scaling: no shared in-process state

---

## Engineering Principles

### Architecture
- SOLID Principles throughout
- Clean Architecture (Domain → Application → Infrastructure → API)
- Domain Driven Design: `Release` and `RiskAssessment` as aggregates
- Repository Pattern (interface in Domain, implementation in Infrastructure)
- Service Layer (Application services orchestrate domain logic)
- Dependency Injection (all dependencies registered in `Program.cs`)
- Strategy Pattern: stage validators plugged in via `IStageValidator[]`
- Factory Pattern: `IReleaseReadinessReportFactory` for PDF/JSON output
- Builder Pattern: `ReleaseReadinessResponseBuilder`
- API First: OpenAPI spec generated first, TypeScript client derived from it

### Code Quality
- Strong typing, no `any` on frontend, no `object` on backend
- Async/Await throughout with `CancellationToken` propagation
- Immutable DTOs (C# records, readonly TypeScript interfaces)
- Minimal code duplication (shared validation, shared error handling)
- High cohesion per class/component, low coupling via interfaces

---

## CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
# Triggers: push to main, pull_request to main

jobs:
  backend:
    - Restore NuGet packages
    - Build solution
    - Run NUnit tests
    - Code coverage report (Coverlet → Codecov)
    - Static analysis (dotnet-format)
    - SonarQube scan placeholder (commented, ready to enable)
    - Security scan placeholder (OWASP Dependency Check, commented)
    - Docker build placeholder (commented)

  frontend:
    - npm ci
    - TypeScript type check
    - ESLint
    - Jest unit tests + coverage
    - openapi-typescript client generation (validates contract)
    - Playwright E2E tests
    - Build production bundle

  performance:
    - k6 smoke test (10 VUs, 30s)
    - Assert P95 < 500ms, error rate < 1%

  deploy:
    - Placeholder job (manual trigger only)
```

---

## Testing

### Frontend (Jest + React Testing Library)
- `ReleaseAssessmentCard.test.tsx` — renders stage status correctly
- `ConfidenceScore.test.tsx` — calculates and displays correct percentage
- `GoNoGoDecision.test.tsx` — renders NO GO with blockers visible
- `useAssessment.test.tsx` — TanStack Query hook returns correct state
- `authStore.test.ts` — Zustand auth store login/logout

### Backend (NUnit)
- `ReleaseReadinessServiceTests.cs` — happy path returns GO
- `ReleaseReadinessServiceTests.cs` — scripted blockers return NO GO at 0%
- `RiskAssessmentServiceTests.cs` — confidence score formula correctness
- `AuthorizationTests.cs` — policy checks return 403 for insufficient role
- `ValidationTests.cs` — invalid request returns 422

### E2E (Playwright)
- `happy-path.spec.ts` — login → trigger assessment → GO panel visible
- `no-go-path.spec.ts` — scripted blockers → NO GO panel with 2 blockers visible
- `auth-failure.spec.ts` — expired token → redirect to login
- `forbidden.spec.ts` — QA Lead cannot trigger assessment → 403 shown
- `validation-failure.spec.ts` — empty release ID → validation error shown

### Performance (k6)
```javascript
// tests/performance/assessment-load.js
// Ramp: 0→10 VUs (30s), hold 100 VUs (2min), ramp down
// Thresholds: P95 < 500ms, error rate < 1%
// Scenarios: trigger assessment, fetch results, export PDF
```

---

## Documentation

Generate all of the following:

- `README.md` — overview, quick start, architecture summary
- `Architecture.md` — solution diagram (Mermaid), component diagram, data flow, sequence diagram
- `API.md` — all endpoints, request/response examples, error codes
- `AuthGuide.md` — JWT flow, mock users table, how to swap for Azure AD
- `AuthorizationGuide.md` — roles, permissions, policies, how to add new role
- `LocalSetup.md` — prerequisites, env config, run commands (backend + frontend)
- `TestingGuide.md` — how to run unit, E2E, and performance tests
- `DeploymentGuide.md` — Docker build, env vars required for production

---

## Architecture Diagrams (Mermaid — include in Architecture.md)

Generate all 8:

1. Solution architecture diagram
2. Component diagram (frontend + backend layers)
3. API flow diagram
4. Authentication flow
5. Authorization flow (policy evaluation)
6. Data flow (mock fixture → service → response)
7. Sequence diagram (full vertical slice: button click → UI update)
8. Confidence score calculation flow

---

## Production Readiness Checklist

Generate a checklist in `Architecture.md` covering:

- All mock fixtures replaced with real MCP connectors or APIs
- Azure AD / Entra ID replacing mock JWT provider
- Secrets moved to Azure Key Vault
- Real database replacing in-memory repository
- OpenTelemetry exporter pointed at production backend (Azure Monitor / Jaeger)
- Rate limiting tuned for production load
- CORS restricted to production domain
- Security headers validated
- Penetration test completed
- k6 load test run against staging
- All TODOs and placeholder comments resolved

---

## Known Assumptions

- All 7 pipeline stages use mocked JSON fixtures representative of real release data
- MCP integration pattern is documented and demo-able as an architecture diagram
- Each mock maps 1:1 to a named production MCP connector or API endpoint
- JWT secret is a development-only value; production uses Key Vault
- No real external network calls are made during the hackathon demo

---

## Technical Debt Log

Generate a `TECHNICAL_DEBT.md` listing every placeholder, mock, and shortcut with:

| Item | File/Location | What to Replace With | Effort Estimate |
|---|---|---|---|
| Mock JWT | `MockTokenService.cs` | Azure AD / Entra ID MSAL | Medium |
| In-memory repo | `MockReleaseRepository.cs` | SQL Server + EF Core | Medium |
| Jira fixture | `jira-stories.json` | Jira MCP connector | Low |
| GitHub fixture | `pull-requests.json` | GitHub MCP connector | Low |
| SonarQube fixture | `sonarqube-results.json` | SonarQube REST API | Low |
| Azure Monitor fixture | `azure-monitor.json` | Azure Monitor API | Low |
| OWASP fixture | `owasp-results.json` | OWASP scanner API | Low |
| Deployment config fixture | `deployment-config.json` | Config management API | Low |
| k6 smoke only | CI pipeline | Full soak test in staging | Medium |
| No real cache | `NoOpCacheService.cs` | Redis / Azure Cache | Medium |
| No message bus | `NoOpEventPublisher.cs` | Azure Service Bus | High |

---

## Final Deliverables Checklist

1. Complete folder structure (as specified above)
2. Solution architecture diagram (Mermaid)
3. Component diagram (Mermaid)
4. API flow diagram (Mermaid)
5. Authentication flow (Mermaid)
6. Authorization flow (Mermaid)
7. Data flow diagram (Mermaid)
8. Sequence diagram — full vertical slice (Mermaid)
9. Confidence score calculation flow (Mermaid)
10. Build instructions (`LocalSetup.md`)
11. Run instructions (`LocalSetup.md`)
12. Test execution instructions (`TestingGuide.md`)
13. CI/CD workflow (`.github/workflows/ci.yml`)
14. Production readiness checklist
15. Known assumptions list
16. Technical debt log (`TECHNICAL_DEBT.md`)
17. Every placeholder, mocked dependency, and future integration point documented

---

*Ensure the solution is clean, modular, extensible, secure, observable, resilient, testable, and demonstrates enterprise software engineering standards while remaining suitable for a 24-hour hackathon MVP.*
