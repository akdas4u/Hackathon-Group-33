# Architecture

This document is the single source of truth for how Release Readiness AI Assistant fits together. It covers solution architecture, component layering, request flow, auth, data flow, the full vertical slice, and confidence score maths. All 8 diagrams required by the build spec are below.

> Note on stage count: earlier planning notes referenced "7 pipeline stages". The team resolved this at kickoff to **8 stages** (Jira, GitHub, SonarQube, TestResults, AzureMonitor, OwaspCompliance, DeploymentConfig, StressTest). This document and all other docs use 8 as the authoritative count.

## 1. Solution architecture diagram

```mermaid
flowchart TB
    subgraph Client["Client"]
        Browser["Browser - React SPA"]
    end

    subgraph Frontend["Frontend - src/frontend (React + TS + Vite)"]
        UI["Pages / Components"]
        Store["Zustand stores"]
        Query["TanStack Query"]
        Axios["Axios + generated OpenAPI client"]
    end

    subgraph Backend["Backend - src/backend (.NET 9)"]
        API["ReleaseReadiness.API"]
        App["ReleaseReadiness.Application"]
        Domain["ReleaseReadiness.Domain"]
        Infra["ReleaseReadiness.Infrastructure"]
    end

    subgraph Mocks["Mock data sources (hackathon only)"]
        Fixtures["13 JSON fixtures\nInfrastructure/MockData"]
    end

    subgraph Future["Production replacements (not built)"]
        MCP["Named MCP connectors /\nreal APIs per stage"]
        AAD["Azure AD / Entra ID"]
        KV["Azure Key Vault"]
        DB["SQL Server + EF Core"]
        OTelBackend["Azure Monitor / Jaeger"]
    end

    Browser --> UI
    UI --> Store
    UI --> Query
    Query --> Axios
    Axios -- "HTTPS JSON, JWT Bearer" --> API
    API --> App
    App --> Domain
    App --> Infra
    Infra --> Domain
    Infra --> Fixtures

    Infra -. "swap in production" .-> MCP
    API -. "swap in production" .-> AAD
    API -. "swap in production" .-> KV
    Infra -. "swap in production" .-> DB
    API -. "swap in production" .-> OTelBackend
```

## 2. Component diagram (frontend + backend layers)

```mermaid
flowchart LR
    subgraph FE["Frontend - src/frontend/src"]
        direction TB
        pages["pages/\nDashboard, Login, ReleaseDetail, Report"]
        components["components/\nui, pipeline, decision, auth"]
        hooks["hooks/\nTanStack Query hooks per stage"]
        store["store/\nZustand: auth, pipeline, ui"]
        api["api/\nAxios fetchers + generated client"]
        types["types/\nopenapi-typescript generated"]
        utils["utils/\nscore + formatters"]
        pages --> components
        pages --> hooks
        components --> store
        hooks --> api
        hooks --> store
        api --> types
        components --> utils
    end

    subgraph BE["Backend - src/backend"]
        direction TB
        apiL["ReleaseReadiness.API\nControllers, Middleware, Program.cs"]
        appL["ReleaseReadiness.Application\nServices, DTOs, Validators"]
        domL["ReleaseReadiness.Domain\nEntities, Enums, Exceptions"]
        infraL["ReleaseReadiness.Infrastructure\nRepositories, MockData, Resilience, Observability"]
        testL["ReleaseReadiness.Tests\nUnit, Integration, Performance"]
        apiL --> appL
        appL --> domL
        infraL --> domL
        apiL --> infraL
        testL -.-> apiL
        testL -.-> appL
    end

    api -- "HTTPS /api/v1, JWT Bearer" --> apiL
```

## 3. API flow diagram

```mermaid
flowchart LR
    Req["Incoming HTTP request"] --> Cors["CORS middleware"]
    Cors --> Sec["Security headers middleware"]
    Sec --> Corr["Correlation ID middleware"]
    Corr --> Log["Request/response logging middleware"]
    Log --> RateLimit["Rate limiting (100 req/min/user)"]
    RateLimit --> AuthN["JWT authentication middleware"]
    AuthN --> Ver["API version resolution (Asp.Versioning.Http, default v1)"]
    Ver --> AuthZ["Policy/claims authorization\n(e.g. CanTriggerAssessment)"]
    AuthZ --> Ctrl["Versioned controller action"]
    Ctrl --> Val["FluentValidation"]
    Val -- "valid" --> Svc["Application service"]
    Val -- "invalid" --> Err422["422 Unprocessable Entity\nerror envelope"]
    Svc --> Repo["Infrastructure repository (mock fixtures)"]
    Repo --> Svc
    Svc --> Resp["ReleaseReadinessResponse / DTO"]
    Resp --> ExMw["Global exception middleware\n(catches unhandled errors)"]
    ExMw --> Out["200 OK response\ncorrelationId in header"]
    AuthN -- "no/invalid token" --> Err401["401 Unauthorized"]
    AuthZ -- "missing permission" --> Err403["403 Forbidden"]
```

## 4. Authentication flow

```mermaid
sequenceDiagram
    actor User
    participant FE as React App
    participant ZAuth as Zustand auth store
    participant API as POST /api/v1/auth/login
    participant MTS as MockTokenService
    participant Users as users.json fixture

    User->>FE: Enter email + password
    FE->>API: POST /auth/login {email, password}
    API->>MTS: Validate credentials
    MTS->>Users: Look up user by email
    Users-->>MTS: User record + role + permissions
    MTS->>MTS: Verify password (dev-only fixture check)
    alt credentials valid
        MTS->>MTS: Issue JWT (HS256) access token (60 min)\n+ refresh token
        MTS-->>API: accessToken, refreshToken, expiresIn, user
        API-->>FE: 200 OK
        FE->>ZAuth: setAuth(user, accessToken, refreshToken)
        ZAuth-->>FE: isAuthenticated = true
        FE->>User: Redirect to Dashboard
    else credentials invalid
        MTS-->>API: Authentication failed
        API-->>FE: 401 Unauthorized (error envelope)
        FE->>User: Show login error
    end

    Note over FE,API: Subsequent requests attach\nAuthorization: Bearer <accessToken>

    FE->>API: Any request with expired access token
    API-->>FE: 401 Unauthorized
    FE->>API: POST /auth/refresh {refreshToken}
    API->>MTS: Validate refresh token, issue new pair
    MTS-->>API: New accessToken, refreshToken
    API-->>FE: 200 OK
    FE->>ZAuth: updateTokens(accessToken, refreshToken)
```

## 5. Authorization / policy flow

```mermaid
flowchart TD
    Start["Request reaches authorization middleware"] --> HasToken{"Valid JWT\npresent?"}
    HasToken -- "No" --> Return401["401 Unauthorized"]
    HasToken -- "Yes" --> Claims["Extract claims:\nsub, role, permissions[]"]
    Claims --> RoleCheck{"Endpoint requires\na role-based policy?"}
    RoleCheck -- "Yes" --> RoleMatch{"Role in\nallowed roles?"}
    RoleMatch -- "No" --> Return403["403 Forbidden"]
    RoleMatch -- "Yes" --> PolicyCheck
    RoleCheck -- "No" --> PolicyCheck{"Endpoint requires\na claim/permission policy?\ne.g. CanTriggerAssessment"}
    PolicyCheck -- "Yes" --> PermMatch{"permissions[] contains\nrequired permission?\ne.g. TriggerAssessment"}
    PermMatch -- "No" --> Return403
    PermMatch -- "Yes" --> Allow["Allow: invoke controller action"]
    PolicyCheck -- "No" --> Allow

    Allow --> Example["Example: POST /releases/{id}/assess\nrequires CanTriggerAssessment"]
    Example --> Coordinator["coordinator@demo.io - has TriggerAssessment - 200 OK"]
    Example --> QaLead["qalead@demo.io - lacks TriggerAssessment - 403 Forbidden"]
```

## 6. Data flow (mock fixture to service to response)

```mermaid
flowchart LR
    subgraph Fixtures["Infrastructure/MockData (13 JSON files)"]
        F1["jira-stories.json"]
        F2["pull-requests.json"]
        F3["sonarqube-results.json"]
        F4["test-results.json"]
        F5["azure-monitor.json"]
        F6["owasp-results.json"]
        F7["stress-test-results.json"]
        F8["deployment-config.json"]
    end

    subgraph Repos["Repository layer (interface-first)"]
        R["IMock*Repository implementations"]
    end

    subgraph Validators["8 IStageValidator implementations"]
        V["JiraValidator, GitHubValidator, SonarQubeValidator,\nTestResultsValidator, AzureMonitorValidator,\nOwaspComplianceValidator, DeploymentConfigValidator,\nStressTestValidator"]
    end

    subgraph AppLayer["Application layer"]
        S1["ReleaseReadinessService.AssessAsync"]
        S2["RiskAssessmentService"]
        S3["ReleaseReadinessResponseBuilder"]
    end

    F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 --> R
    R --> V
    V -- "StageResult {stageKey, status, riskLevel, findings, evidence, remediation}" --> S1
    S1 -- "8 StageResults" --> S2
    S2 -- "per-stage score + confidenceScore + decision" --> S3
    S3 -- "ReleaseReadinessResponse" --> Out["API controller -> 200 OK JSON"]
    Out --> FE["Frontend: TanStack Query cache -> Zustand pipeline store -> UI"]
```

## 7. Sequence diagram - full vertical slice (button click to UI update)

```mermaid
sequenceDiagram
    actor User
    participant Btn as "React: Run Assessment button"
    participant ZP as "Zustand pipeline store"
    participant TQ as "TanStack Query mutation"
    participant Ax as "Axios client"
    participant MW as "JWT auth middleware"
    participant Pol as "Policy check: CanTriggerAssessment"
    participant Svc as "ReleaseReadinessService.AssessAsync"
    participant Val as "8x IStageValidator (Task.WhenAll)"
    participant Repo as "Mock repositories / fixtures"
    participant Risk as "RiskAssessmentService"
    participant OTel as "OpenTelemetry span + Serilog"
    participant UI as "React UI"

    User->>Btn: Click "Run Assessment"
    Btn->>ZP: setLoading(true)
    ZP-->>Btn: loading = true (spinner shown)
    Btn->>TQ: mutate()
    TQ->>Ax: POST /api/v1/releases/{id}/assess
    Ax->>MW: Authorization: Bearer <JWT>
    MW->>MW: Validate signature, expiry, issuer, audience
    MW->>Pol: Check permissions[] contains TriggerAssessment
    alt authorized
        Pol->>Svc: AssessAsync(releaseId, cancellationToken)
        Svc->>Val: Task.WhenAll(8 stage validators)
        par Jira
            Val->>Repo: read jira-stories.json
        and GitHub
            Val->>Repo: read pull-requests.json (PR #482 unmerged)
        and SonarQube
            Val->>Repo: Polly-wrapped mock client -> sonarqube-results.json
        and TestResults
            Val->>Repo: read test-results.json
        and AzureMonitor
            Val->>Repo: read azure-monitor.json
        and OwaspCompliance
            Val->>Repo: read owasp-results.json
        and DeploymentConfig
            Val->>Repo: read deployment-config.json (missing PAYMENTS_API_KEY)
        and StressTest
            Val->>Repo: read stress-test-results.json
        end
        Repo-->>Val: 8x StageResult
        Val-->>Svc: StageResult[8]
        Svc->>Risk: CalculateConfidence(StageResult[8])
        Risk->>Risk: map status->score, mean, Critical-override, decision thresholds
        Risk-->>Svc: confidenceScore=0, decision=NoGo
        Svc->>OTel: emit span "AssessAsync" + child spans per stage + audit log
        Svc-->>Pol: ReleaseReadinessResponse
        Pol-->>MW: 200 OK
        MW-->>Ax: ReleaseReadinessResponse JSON
        Ax-->>TQ: onSuccess(data)
        TQ->>TQ: update query cache (releases/{id}/report)
        TQ->>ZP: setAssessment(data), setLoading(false)
        ZP->>UI: re-render: stage table, confidence score, NO GO panel
        UI-->>User: NO GO panel with 2 blockers visible
    else forbidden
        Pol-->>MW: 403 Forbidden (error envelope)
        MW-->>Ax: 403 response
        Ax-->>TQ: onError(err)
        TQ->>ZP: setLoading(false), setError(err)
        ZP->>UI: re-render: forbidden message
    end

    Note over Svc,Val: NUnit test asserts AssessAsync returns\nDecision.NoGo + confidenceScore=0 for scripted blockers
    Note over Btn,UI: Playwright test asserts button click\nresults in NO GO panel with 2 blockers visible
```

## 8. Confidence score calculation flow

```mermaid
flowchart TD
    Stages["8 StageResults\n(Jira, GitHub, SonarQube, TestResults,\nAzureMonitor, OwaspCompliance, DeploymentConfig, StressTest)"] --> Map["Map each stage riskLevel to score:\nCritical=0, High=40, Medium=70, Low/Pass=100"]
    Map --> AnyCritical{"Any stage\nriskLevel == Critical?"}
    AnyCritical -- "Yes" --> Force0["confidenceScore = 0\ndecision = NoGo (forced)"]
    AnyCritical -- "No" --> Mean["confidenceScore = mean(8 stage scores)"]
    Mean --> Threshold{"confidenceScore range"}
    Threshold -- "80-100" --> Go["decision = Go"]
    Threshold -- "50-79" --> GoCond["decision = GoWithConditions"]
    Threshold -- "0-49" --> NoGo["decision = NoGo"]
    Force0 --> Summary["ExecutiveSummaryGenerator builds\nwritten summary naming each Critical/High finding"]
    Go --> Summary
    GoCond --> Summary
    NoGo --> Summary
    Summary --> Response["ReleaseReadinessResponse.confidenceScore\n+ .decision + .executiveSummary"]
```

### Worked example - scripted demo dataset

| Stage | Status | Risk level | Score |
|---|---|---|---|
| Jira | Pass | Low | 100 |
| GitHub | Fail | **Critical** | 0 |
| SonarQube | Pass | Low | 100 |
| TestResults | Pass | Low | 100 |
| AzureMonitor | Pass | Low | 100 |
| OwaspCompliance | Pass | Low | 100 |
| DeploymentConfig | Fail | **Critical** | 0 |
| StressTest | Pass | Low | 100 |

Two stages are Critical, so the mean is never computed. `confidenceScore = 0`, `decision = NoGo`. The executive summary names both blockers: the unmerged hotfix PR #482 against `release/2.14`, and the missing `PAYMENTS_API_KEY` deployment config value.

---

## Production Readiness Checklist

Before this moves beyond a hackathon demo, all of the following must be true:

- [ ] All 8 mock fixtures replaced with named MCP connectors or real APIs (see `TECHNICAL_DEBT.md` for the 1:1 mapping)
- [ ] Mock JWT (`MockTokenService`) replaced with Azure AD / Entra ID (OAuth2 / OIDC, MSAL on the frontend)
- [ ] Secrets moved from `appsettings.*.json` / dev fixtures to Azure Key Vault
- [ ] In-memory repository replaced with a real database (SQL Server + EF Core)
- [ ] OpenTelemetry exporter pointed at a production backend (Azure Monitor or Jaeger) instead of console/local exporter
- [ ] Rate limiting thresholds tuned for real production load (currently 100 req/min/user, hackathon default)
- [ ] CORS restricted to the production frontend domain (no wildcard origins)
- [ ] Security headers validated with a header-scanning tool (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- [ ] Penetration test completed and findings remediated
- [ ] k6 load test executed against a staging environment (not just the CI smoke test)
- [ ] All `// MOCK:` comments, TODOs, and placeholder services (`NoOpCacheService`, `NoOpEventPublisher`) resolved or intentionally deferred with a tracked ticket

## Known Assumptions

- All 8 pipeline stages (Jira, GitHub, SonarQube, TestResults, AzureMonitor, OwaspCompliance, DeploymentConfig, StressTest) are mocked as JSON fixtures representative of real release data, not live calls.
- The MCP (Model Context Protocol) integration pattern is documented and demo-able as an architecture diagram (see diagram 1 above) but is **not implemented** - no MCP server exists in this codebase.
- Each mock fixture maps 1:1 to a named production MCP connector or API endpoint (see `TECHNICAL_DEBT.md`).
- The JWT signing secret in `appsettings.Development.json` is a development-only value. Production must source it from Key Vault and never commit it.
- No real external network calls are made during the hackathon demo. Every stage validator reads local JSON fixtures.
