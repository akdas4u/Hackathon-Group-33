# Technical Debt Log

Every placeholder, mock, and shortcut taken for the hackathon build, and what replaces it in production.

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

See `docs/Architecture.md` for the Production Readiness Checklist and Known Assumptions that accompany this log.
