# Authorization Guide

Authorization is claims-based, role-based, and policy-based, layered on top of the JWT issued by `MockTokenService` (see `AuthGuide.md`). Applied globally via middleware, excluding `/health/*` and `/swagger/*`.

## Roles and permissions

| Role | Permissions | Notes |
|---|---|---|
| ReleaseCoordinator | `ReadPipeline`, `TriggerAssessment` | Primary demo persona; can run assessments |
| ReleaseManager | `ReadPipeline`, `TriggerAssessment`, `ApproveDecision` | Superset of Coordinator, plus sign-off |
| QALead | `ReadTestResults`, `ReadPipeline` | Cannot trigger assessments - demonstrates 403 |
| DevOpsEngineer | `ReadAllStages`, `ReadDeploymentConfig` | Broad read access, no trigger/approve rights |
| Administrator | All permissions | Full access, used for admin/support scenarios |

Permissions are defined in the `roles.json` fixture as an array per role, and issued as individual `permission` claims on the JWT at login.

## How `CanTriggerAssessment` is evaluated

`CanTriggerAssessment` is an ASP.NET Core authorization **policy**, registered in `Program.cs`:

```csharp
options.AddPolicy("CanTriggerAssessment", policy =>
    policy.RequireClaim("permission", "TriggerAssessment"));
```

Applied to the controller action with `[Authorize(Policy = "CanTriggerAssessment")]` on `POST /api/v1/releases/{id}/assess`.

Evaluation order for any protected request:

1. JWT authentication middleware validates the token's signature, issuer, audience, and expiry. Missing/invalid token → `401 Unauthorized`.
2. The authorization middleware extracts claims from the validated token: `sub`, `role`, and one or more `permission` claims.
3. If the endpoint declares a role requirement, the caller's `role` claim is checked against the allowed list.
4. If the endpoint declares a policy (like `CanTriggerAssessment`), the policy's requirement handler checks whether the required `permission` claim is present.
5. If any check fails, the request short-circuits with `403 Forbidden` (never a stack trace - the standard error envelope is returned).
6. If all checks pass, the controller action executes.

See `Architecture.md` diagram 5 for the flowchart version of this sequence.

### Worked example

- `coordinator@demo.io` calls `POST /releases/{id}/assess` → JWT has `permission=TriggerAssessment` → policy passes → `200 OK`.
- `qalead@demo.io` calls the same endpoint → JWT has no `TriggerAssessment` permission claim → policy fails → `403 Forbidden` with error envelope `{"message": "You do not have permission to trigger an assessment.", ...}`.

## Adding a new role or permission

1. Add the new permission string to the relevant role(s) in `roles.json` (Infrastructure mock fixture). No code change needed for existing policies that already check for an existing permission string.
2. If introducing a **new permission**, add it to the `Permissions` constants class in `ReleaseReadiness.Domain` (or wherever permission string constants are centralised) so callers get compile-time safety instead of magic strings.
3. If the new permission needs to gate a **new endpoint or action**, register a new policy in `Program.cs`:
   ```csharp
   options.AddPolicy("CanApproveDecision", policy =>
       policy.RequireClaim("permission", "ApproveDecision"));
   ```
4. Decorate the controller action with `[Authorize(Policy = "CanApproveDecision")]`.
5. Add a corresponding mock user (or extend an existing one) in `users.json` for local testing, and add an `AuthorizationTests.cs` case asserting the new policy returns `403` for a role without the permission and `200`/expected status for a role with it.
6. Update this table and `AuthGuide.md`'s mock users table so the docs stay in sync with the fixtures.
