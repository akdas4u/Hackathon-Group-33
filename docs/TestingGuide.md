# Testing Guide

## Backend unit/integration tests (NUnit + FluentAssertions)

Run from `src/backend`:

```bash
dotnet test ReleaseReadiness.Tests
```

With coverage (Coverlet, used by CI to feed Codecov):

```bash
dotnet test ReleaseReadiness.Tests --collect:"XPlat Code Coverage"
```

| Test file | Covers |
|---|---|
| `ReleaseReadinessServiceTests.cs` | Happy-path dataset returns `Go`; scripted-blockers dataset returns `NoGo` at `confidenceScore = 0` |
| `RiskAssessmentServiceTests.cs` | Score mapping (Critical=0/High=40/Medium=70/Low=100), mean calculation, Critical-override rule, Go/GoWithConditions/NoGo thresholds |
| `AuthorizationTests.cs` | Policy checks - `CanTriggerAssessment` returns `403` for `qalead@demo.io`, `200` for `coordinator@demo.io` |
| `ValidationTests.cs` | Invalid requests (e.g. empty/malformed release id) return `422 Unprocessable Entity` with the error envelope |

Located under `src/backend/ReleaseReadiness.Tests/{Unit,Integration}`.

## Frontend unit tests (Jest + React Testing Library)

Run from `src/frontend`:

```bash
npm run test
npm run test -- --coverage
```

| Test file | Covers |
|---|---|
| `ReleaseAssessmentCard.test.tsx` | Renders each stage's status/risk badge correctly |
| `ConfidenceScore.test.tsx` | Calculates and displays the correct percentage (including the 0% Critical-override case) |
| `GoNoGoDecision.test.tsx` | Renders the NO GO panel with both blockers visible |
| `useAssessment.test.tsx` | TanStack Query hook exposes correct loading/success/error state |
| `authStore.test.ts` | Zustand auth store: login sets tokens/user, logout clears them |

Located under `src/frontend/src/tests`.

## End-to-end tests (Playwright)

Run from `src/frontend`:

```bash
npx playwright install --with-deps
npx playwright test
```

| Spec file | Covers |
|---|---|
| `happy-path.spec.ts` | Login → trigger assessment (all-pass dataset) → GO panel visible |
| `no-go-path.spec.ts` | Login → trigger assessment (scripted dataset) → NO GO panel with 2 blockers visible |
| `auth-failure.spec.ts` | Expired token → redirected to login |
| `forbidden.spec.ts` | `qalead@demo.io` attempts to trigger an assessment → 403 shown in UI |
| `validation-failure.spec.ts` | Empty release id → validation error shown |

Located under `src/frontend/e2e`. Playwright drives the real frontend against a running backend - start both (see `LocalSetup.md`) before running this suite locally; CI starts them automatically.

## Performance tests (k6)

Script: `src/backend/ReleaseReadiness.Tests/Performance/assessment-load.js`.

Run locally (requires [k6](https://k6.io/docs/get-started/installation/) installed and the backend running):

```bash
k6 run src/backend/ReleaseReadiness.Tests/Performance/assessment-load.js
```

Scenario: ramp 0→10 VUs over 30s, hold 100 VUs for 2 minutes, ramp down. Exercises `POST /releases/{id}/assess`, `GET /releases/{id}/report`, and `GET /releases/{id}/report/pdf`. Thresholds (`P95 < 500ms`, error rate `< 1%`) are defined in the script's `options.thresholds`, so a threshold breach fails the k6 run with a non-zero exit code - this is what CI's `performance` job checks.

CI runs a lighter **smoke** variant (10 VUs, 30s, same thresholds) on every push/PR; the full ramp profile above is intended for manual or staging runs, not every CI run (see `TECHNICAL_DEBT.md`: "k6 smoke only" → full soak test in staging).

## Running everything before a PR

```bash
# Backend
cd src/backend && dotnet test ReleaseReadiness.Tests

# Frontend
cd src/frontend && npm run test && npx playwright test

# Performance (optional locally, mandatory in CI)
k6 run src/backend/ReleaseReadiness.Tests/Performance/assessment-load.js
```
