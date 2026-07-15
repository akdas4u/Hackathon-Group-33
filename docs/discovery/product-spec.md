---
title: "Release Readiness AI Assistant"
status: "Built"
complexity: "Complex"
created: "2026-07-14"
last-updated: "2026-07-15"
specialists-required:
  - Design System Agent
standards-invoked:
  - Secure by Design (JWT auth, role-based permissions)
pr-url: ""
---

# Feature: release-readiness-ai-assistant

Note: this spec is written retroactively, after the build, to give the project a saved
record of intent alongside the code. The team skipped the formal pre-build spec step to
move faster within the hackathon window — this document captures what was asked and
built, sourced from the original PRD, the delivery plan, and the ordered backlog.

## User Need

As a **Release Coordinator**, I need to validate every release pipeline stage before CAB
submission, so that I stop manually collating evidence across five separate tools and can
trust a single, consistent readiness signal.

As a **Release Manager**, I need to own the GO/NO-GO decision with evidence behind it, so
that I can approve or block a production deployment without re-doing the coordinator's
legwork.

Today, this validation takes 2–4 hours per release, spent moving between Jira, GitHub,
SonarQube, test results, and Azure Monitor. The process is fragmented and
experience-dependent — a missing PR, a failed quality gate, or a configuration gap can
slip through, and each resulting production rollback costs roughly 1.5–3 hours to recover
from. As release cadence increases, manual validation becomes both a bottleneck and a
governance liability.

## Acceptance Criteria

- [x] All 8 pipeline stages (Jira, GitHub, SonarQube, Test Results, Azure Monitor,
      OWASP/Compliance, Deployment Config, Stress Test) return a Pass/Fail status with
      findings and a risk rating
- [x] Critical blockers are listed explicitly and prevent a GO recommendation
- [x] The AI risk assessment provides written reasoning, not just a label
- [x] Confidence score is rendered as a percentage using the weighted stage-risk formula,
      with a single Critical finding capping the score at 0% and forcing NO GO
- [x] Executive summary is 3–5 sentences, suitable for a non-technical CAB member
- [x] PDF export includes every validation stage, identified blockers, the AI risk
      assessment, supporting evidence, and the final GO/NO-GO recommendation
- [x] The scripted demo scenario (unmerged hotfix PR + missing deployment config key)
      correctly returns NO GO with both blockers detected and cited
- [x] End-to-end flow (trigger → result) completes well under 15 minutes

## Business Rules

- Confidence scoring: Critical finding = 0%, High risk = 40%, Medium risk = 70%, Low
  risk/Pass = 100%. Overall score is the mean across all stages, **unless** any single
  stage is Critical — in that case the overall score is forced to 0% and the decision is
  forced to NO GO regardless of the other stages.
- Decision thresholds (when no stage is Critical): 80–100% → GO, 50–79% → GO WITH
  CONDITIONS, 0–49% → NO GO.
- Only `TriggerAssessment` permission holders (Release Coordinator, Release Manager,
  Administrator) may trigger an assessment; QA Lead and DevOps Engineer are read-only and
  receive a 403.
- Every mock data source maps 1:1 to a named production connector (documented in
  `TECHNICAL_DEBT.md`) so the demo-to-production path is explicit, not hand-waved.

## Out of Scope

- Live MCP integrations — the production integration pattern is documented as an
  architecture diagram, not implemented; all 8 stages run on mocked JSON fixtures
- Automated deployment execution
- Change ticket creation or ITSM workflow automation
- Historical trend analysis across multiple sprints
- Per-release environment tagging (Production/Staging/Development) — captured as a UI
  preference only, not wired to real release data (see `TECHNICAL_DEBT.md`)

## Constraints and Compliance Flags

- **Auth**: JWT bearer authentication, role-based permissions (5 roles). Dev-only secret
  and dev-only mock users are explicitly disclosed, never treated as production-ready.
- **Personal data**: none handled — all users are demo/mock accounts.
- **Timeline**: built within a single hackathon session; scope was deliberately cut
  mid-build (see `Release_Readiness_Delivery_Plan.md`) to protect the scripted demo path
  over stretch features.

## Success Metrics (from PRD)

- Validation time reduced by ≥95% — from 2–4 hours to under 15 minutes per release
- Detects all predefined blockers in the mocked release dataset, validated against the
  demo scenarios used during the hackathon
- GO/NO-GO decision consistency ≥95% — same inputs produce the same recommendation
  regardless of coordinator

## Open Questions

- None outstanding. The "7 vs 8 pipeline stages" ambiguity in the original PRD prose was
  resolved at kickoff in favour of 8 (adds Deployment Config as its own stage) — see
  `docs/Architecture.md`.
