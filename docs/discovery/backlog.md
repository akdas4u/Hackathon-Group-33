# Release Readiness AI — Ordered Backlog

Derived from the PRD. Ordered by build sequence (Must → Should → Could).

| # | Story | Acceptance criteria | Priority | Time risk |
|---|---|---|---|---|
| 1 | Mock fixtures — 8 stages, 2 scripted blockers | Jira, GitHub, SonarQube, Test Results, Azure Monitor, OWASP/Compliance, Deployment Config, Stress Test all have JSON fixtures; GitHub shows open PR, Deployment Config missing key | Must | Y |
| 2 | Trigger UI | Coordinator starts check; mocked data loads for all stages | Must | N |
| 3 | Per-stage Pass/Fail + risk rating engine | Each of 8 stages returns Pass/Fail, findings, risk rating | Must | Y |
| 4 | Weighted confidence score | Score = weighted avg of stage risk; single Critical caps score at 0% and forces NO GO | Must | Y |
| 5 | AI Risk Assessment reasoning | Overall Low/Med/High with written reasoning grounded in fixture content | Must | Y |
| 6 | GO / GO WITH CONDITIONS / NO-GO decision | Correct label rendered from confidence score + Critical rule | Must | N |
| 7 | Critical Issues panel | Blockers listed explicitly, visually highlighted, block GO | Must | N |
| 8 | Executive summary | 3–5 sentences, readable by non-technical CAB member | Must | N |
| 9 | PDF export | Includes all stages, blockers, AI assessment, evidence, final rec; generated under 30s | Must | Y |
| 10 | Demo scripted failure path | Returns NO GO, both blockers cited with evidence, remediation suggested | Must | Y |
| 11 | Remediation action suggestions, all stages | Each Fail/Critical finding includes a suggested remediation | Should | N |
| 12 | Architecture diagram — MCP mapping | Diagram shows each mock mapped 1:1 to named MCP connector/API | Should | N |
| 13 | End-to-end run time tuning | Full flow, trigger to PDF, completes under 15 minutes | Should | N |
| 14 | Decision consistency check | Same inputs re-run produce same GO/NO-GO label | Could | N |
| 15 | Second clean-path dataset | All-pass fixture set, contrasts against NO GO demo | Could | N |
| 16 | Stress test human-in-loop toggle | UI lets user manually confirm stress test step | Could | N |

## Y-risk notes

- **#1** — 8 fixtures plus blocker scripting is detailed work; late delivery blocks every downstream team.
- **#3** — 8 distinct scoring rules to encode and test correctly under time pressure.
- **#4** — weighted formula plus Critical-override edge case is easy to get wrong, hard to debug live.
- **#5** — PRD flags hallucination risk; grounding and prompt testing eats time.
- **#9** — PRD flags PDF library compatibility risk; needs validation on target environment.
- **#10** — single point of demo failure; PRD flags blockers not being visible on screen as a named risk.

## Build status

All 16 stories are implemented as of this writing. Story 16 (stress test human-in-loop) is represented in the mock fixture and UI copy ("human-in-loop confirmation required") but does not yet gate the assessment on a manual confirmation step — see `TECHNICAL_DEBT.md`.
