# Release Readiness AI — Delivery Plan
4-person team, 10 hours.

Note: PRD says "7 pipeline stages" in several places, but mock table lists 8 sources (adds Deployment Config separately). Plan below treats all 8 as stages. Resolve at kickoff.

| Workstream | Owner | Dependency | Checkpoint |
|---|---|---|---|
| Kickoff: agree data schema, stage contract | All 4 | None | T+0:30 |
| Mock fixtures — 8 sources, 2 scripted blockers (GitHub PR, Deployment Config) | Dev 2 | Kickoff | T+2:00 |
| Stage evaluator + risk scoring skeleton | Dev 1 | Kickoff (schema) | T+2:00 |
| UI skeleton — trigger button, stage cards | Dev 3 | Kickoff | T+2:00 |
| PDF template + architecture diagram draft | Dev 4 | Kickoff | T+2:00 |
| Wire real fixtures into stage evaluator | Dev 1 | Mock fixtures | T+4:00 |
| AI Risk Assessment reasoning + weighted confidence score | Dev 1, Dev 2 | Stage evaluator wired | T+5:00 |
| UI wired to live backend output | Dev 3 | Stage evaluator wired | T+5:00 |
| Critical Issues panel + executive summary (3-5 sentences) | Dev 3 | Risk assessment done | T+6:30 |
| PDF export, full output, under 30s | Dev 4 | Risk assessment + score done | T+7:00 |
| End-to-end rehearsal — scripted NO GO path | All 4 | Panel + PDF done | T+8:30 |
| Bug fixes from rehearsal | All 4 | Rehearsal | T+9:30 |
| Final demo lock, no more code | All 4 | Bug fixes | T+10:00 |

MVP demo-able by T+8:30. Rest is buffer.

## Stretch goals (only if time left)
- GO WITH CONDITIONS state, distinct remediation text
- Second clean-path dataset, shows contrast vs NO GO
- Re-run consistency check (ties to 95% consistency metric)
- Stress test human-in-loop toggle in UI
- Polished MCP architecture walkthrough for judges
