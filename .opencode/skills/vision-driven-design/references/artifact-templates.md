# Artifact Templates

Copy-paste templates for every VDD artifact. All include the VDD traceability header and S&T assumption blocks.

---

## constitution.md Template

*Created once per project at the root. Applied to every phase, every feature.*

```markdown
# Project Constitution

Version: 1.0.0
Last updated: [YYYY-MM-DD]

## Architecture Principles

- [e.g., "API-first: all features expose a REST endpoint before any UI is built"]
- [e.g., "Server Components by default; use client components only when required"]
- [e.g., "No ORM other than Drizzle; raw SQL only for complex analytics queries"]

## Technology Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Language | TypeScript 5.x | Strict mode, no `any` |
| Runtime | Node.js 20+ | |
| Framework | [e.g., Next.js 15+] | App Router only |
| Database | PostgreSQL + Drizzle | No direct SQL in route handlers |
| Auth | [e.g., Better Auth] | No custom auth logic outside the auth module |
| Testing | Vitest + Playwright | |

## Security Constraints

- Authentication: all endpoints require a valid session unless explicitly marked `[PUBLIC]`
- Input validation: all external inputs validated with Zod at the route boundary
- SQL injection: parameterized queries only — never string-concatenate user input into queries
- Secrets: never log tokens, passwords, or PII; never hardcode secrets
- CORS: allow-list only — no wildcard origins in production
- Rate limiting: all public endpoints must declare a rate limit in their contract

## Naming Conventions

- Files: kebab-case (`user-repository.ts`)
- Variables/functions: camelCase
- Types/interfaces: PascalCase
- DB columns: snake_case
- Env vars: SCREAMING_SNAKE_CASE

## Banned Patterns

- No `any` type in TypeScript
- No `console.log` in production code (use logger)
- No synchronous file I/O in request handlers
- No direct DOM manipulation (use React)
- No [project-specific banned pattern]

## File Structure Rules

```
src/
  app/          # Routes and pages
  components/   # Shared UI components
  lib/          # Business logic and utilities
  db/           # Schema, migrations, repositories
  types/        # Shared TypeScript types
```

## Domain Primitives

<!-- Which domain-primers apply to this project? -->
- webapp
- data-storage
- [etl / infrastructure]

## Open Questions / Deferred Decisions

- [PENDING] [Decision 1]: [context and options]
```

---

## vision.md Template

*Created once per product/feature. The root of all traceability. Human provides a freeform statement; AI formalizes into this template.*

```markdown
# Vision

> Impact Chain: V-001

Status: Approved
Version: 1.0
Last updated: [YYYY-MM-DD]

## Vision Statement

<!-- Non-technical 1-3 paragraphs describing the intended impact.
     Who benefits? What changes in their world? Why does it matter? -->

[Human's freeform vision, expanded and formalized by AI]

## Impact Model

### Goal (the desired future state)

[1 sentence — the measurable outcome this product aims to create]

### Actors (who must behave differently)

| Actor | Current State | Desired State | Benefit |
|-------|--------------|---------------|---------|
| [Primary user] | [What they do today] | [What they will do] | [Why it's better] |
| [Secondary user] | [What they do today] | [What they will do] | [Why it's better] |

### Impacts (the behavioral changes that produce the goal)

| Impact ID | Description | Actor | Measurement |
|-----------|-------------|-------|-------------|
| I-001 | [Behavioral change] | [Actor] | [How to measure] |
| I-002 | [Behavioral change] | [Actor] | [How to measure] |

## Stakeholder Map

| Role | Interest | Influence | Engagement Strategy |
|------|----------|-----------|-------------------|
| [Primary user] | [What they care about] | High | [How to involve them] |
| [Decision maker] | [What they care about] | High | [How to involve them] |
| [Secondary beneficiary] | [What they care about] | Medium | [How to involve them] |

## Success Metrics

### Lagging Indicators (the outcomes — measured months after launch)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| [e.g., User retention at day 30] | [e.g., > 40%] | [e.g., Analytics event + cohort analysis] |
| [e.g., Net Promoter Score] | [e.g., > 50] | [e.g., In-app survey at day 14] |

### Leading Indicators (early signals — measured during build & launch)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| [e.g., Activation rate] | [e.g., > 60%] | [e.g., Completed key journey within first session] |
| [e.g., Time to first value] | [e.g., < 5 min] | [e.g., Analytics event timing] |

## Constraints & Boundaries

### Constraints (non-negotiable)

- [e.g., Must serve users in regions X, Y, Z]
- [e.g., Must comply with regulation ABC]
- [e.g., Must work offline in low-connectivity environments]

### Boundaries (explicitly out of vision scope)

- [e.g., Not targeting enterprise customers in v1]
- [e.g., Not replacing existing system X — complementing it]

## Target Domains

<!-- Check all that apply. Load corresponding domain-primers during Strategy phase. -->
- [ ] WebApp
- [ ] Data Storage
- [ ] ETL
- [ ] Infrastructure

## S&T Assumptions (Vision → Strategy)

<!-- Filled by AI during Gate G1 — how this Vision decomposes into Strategy -->

**Necessity:** Why is Strategy-level research necessary to achieve this Vision?

**Achievability:** Why is this Vision achievable given the planned Strategy approach?

**Sufficiency:** Why is the planned Strategy approach sufficient to realize this Vision?

**Warnings:** What must go right / be avoided for Strategy to succeed?
```

---

## strategy.md Template

*AI-generated during Phase 2. Loads relevant domain-primers. Spawns parallel research subagents.*

```markdown
# Strategy

> Impact Chain: V-001 → S-002

Status: Draft
Version: 1.0
Last updated: [YYYY-MM-DD]

## Vision Reference
Derived from: `vdd/vision.md`

## Domain Primers Loaded
<!-- Determined by vision's Target Domains -->
- [domain-primer 1]
- [domain-primer 2]

## Research Synthesis

### Market & Domain Landscape
<!-- Synthesized from Brave Search, Perplexity research, competitive analysis -->
[Summary of market conditions, trends, competitor positioning, user needs]

### Technology Landscape
<!-- Synthesized from domain-primer checklists, Context7 library research -->
[Summary of viable technologies, trade-offs, constraints imposed by constitution]

### Feasibility Assessment
<!-- Is this vision technically and operationally achievable with current resources? -->
[Assessment with evidence from research]

## Strategic Pillars

<!-- 3-5 pillars. Each pillar is a major theme that decomposes the vision into actionable domains.
     Every pillar maps to at least one vision goal. -->

### Pillar 1: [Name]

**Rationale:** [Why this pillar exists — what vision goal does it serve?]

**Vision Trace:** [Which vision goal/impact/actor does this address?]

**Key Research Finding:** [Evidence that supports this pillar]

**Expected Impact:** [How will this pillar contribute to the success metrics?]

### Pillar 2: [Name]

**Rationale:** [Why this pillar exists]
**Vision Trace:** [Which vision goal does this serve?]
**Key Research Finding:** [Evidence]
**Expected Impact:** [Contribution to metrics]

### Pillar N: [Name]

**Rationale:** [...]
**Vision Trace:** [...]
**Key Research Finding:** [...]
**Expected Impact:** [...]

## Competitive Analysis

| Competitor | Strengths | Weaknesses | Our Differentiator |
|------------|-----------|-----------|-------------------|
| [Name] | [What they do well] | [What they lack] | [How we differ] |

## Risk Register

| Risk ID | Description | Likelihood | Impact | Mitigation |
|---------|-------------|-----------|--------|-----------|
| R-001 | [e.g., Target audience doesn't adopt] | Medium | High | [e.g., Early adopter program, UX research] |
| R-002 | [e.g., Key technology choice becomes deprecated] | Low | High | [e.g., Abstraction layer, migration plan] |

## S&T Assumptions (Strategy → Tactics)

<!-- Filled by AI during Gate G2 — how this Strategy decomposes into Tactics -->

**Necessity:** Why is Tactical-level action-item breakdown necessary to execute this Strategy?

**Achievability:** Why is this Strategy achievable given the planned Tactical approach?

**Sufficiency:** Why is the planned Tactical approach sufficient to implement this Strategy?

**Warnings:** What must go right / be avoided for Tactics to succeed?

## Out of Scope (Strategic)
<!-- Strategic directions explicitly excluded for this release/iteration -->
- [Direction we chose NOT to pursue and why]
```

---

## tactics.md Template

*AI-generated during Phase 3. Full repository audit. Gap analysis. Action items feed directly into Specs.*

```markdown
# Tactics

> Impact Chain: V-001 → S-002 → T-003

Status: Draft
Version: 1.0
Last updated: [YYYY-MM-DD]

## Strategy Reference
Derived from: `vdd/strategy.md`

## Codebase Audit

### What Exists

| Asset | Location | Purpose | Strategic Pillar Trace | Quality |
|-------|----------|---------|----------------------|---------|
| [e.g., User auth module] | `src/auth/` | [What it does] | [Which pillar] | Good / Needs Refactor / Replace |
| [e.g., Dashboard page] | `src/app/dashboard/` | [What it does] | [Which pillar] | Good / Needs Refactor / Replace |

### Technical Debt Assessment

| Debt Item | Location | Severity | Impact on Strategy |
|-----------|----------|----------|-------------------|
| [e.g., No input validation] | `src/api/` | High | Blocks Pillar 1 (security) |
| [e.g., Missing indexes] | `db/schema.ts` | Medium | Slows Pillar 2 (analytics) |

### Reusable Assets

| Asset | How It Supports Strategy | Effort to Reuse |
|-------|------------------------|----------------|
| [e.g., Shared component library] | Accelerates Pillar 1 UI | Low |
| [e.g., Existing API patterns] | Consistent with Pillar 2 | Low |

## Gap Analysis

| Gap | Strategic Pillar Affected | Impact if Unaddressed |
|-----|--------------------------|----------------------|
| [e.g., No mobile-responsive layout] | Pillar 1 (UX) | Vision target audience unreachable |
| [e.g., No analytics pipeline] | Pillar 2 (Data) | Cannot measure success metrics |

## Prioritized Action Items

<!-- Each action item feeds directly into a spec.md via /vdd:specify.
     Priority follows MoSCoW: [MUST] = required for vision, [SHOULD] = important, [COULD] = nice -->

| ID | Action Item | Priority | Strategy Pillar | Estimated Spec Size | Dependencies |
|----|------------|----------|----------------|--------------------|--------------|
| A-001 | [e.g., User authentication with SSO] | MUST | Pillar 1 | M | None |
| A-002 | [e.g., Responsive dashboard redesign] | MUST | Pillar 1 | L | None |
| A-003 | [e.g., Analytics data pipeline] | SHOULD | Pillar 2 | M | A-001 |
| A-004 | [e.g., Export to CSV] | COULD | Pillar 2 | S | A-003 |

## Dependency Map

```
A-001 (Auth) ──┐
               ├──→ A-003 (Analytics) ──→ A-004 (Export)
A-002 (UI) ────┘
```

## Infrastructure Requirements

| Requirement | Domain | Priority | Notes |
|-------------|--------|----------|-------|
| [e.g., CI/CD pipeline] | Infrastructure | MUST | GitHub Actions for deploy |
| [e.g., Monitoring dashboards] | Infrastructure | SHOULD | Grafana + Prometheus |
| [e.g., Multi-region DB] | Data Storage | SHOULD | Postgres read replicas |
| [e.g., ETL for analytics] | ETL | SHOULD | dbt + Airflow |

## S&T Assumptions (Tactics → Specs)

<!-- Filled by AI during Gate G3 — how Tactics decompose into Specs -->

**Necessity:** Why are Spec-level requirements necessary to execute these Tactical action items?

**Achievability:** Why are these Tactical items achievable given the planned Spec approach?

**Sufficiency:** Why is the planned Spec approach sufficient to implement these Tactical items?

**Warnings:** What must go right / be avoided for Specs to succeed?
```

---

## spec.md Template

*Enhanced from SDD. Adds impact-chain header and tactical-origin reference. Generated per action item.*

```markdown
# [Feature Name]

> Impact Chain: V-001 → S-002 → T-003 → SP-004

Status: Draft
Version: 1.0
Last updated: [YYYY-MM-DD]

## Tactical Origin
Implements: `vdd/tactics.md` → Action Item [A-XXX]

## Overview
<!-- 1-2 sentences describing the feature for a non-technical stakeholder -->
<!-- Must reference which vision impact this feature serves -->

## User Stories

### Primary
As a [role], I want [goal] so that [benefit].

### Secondary (optional)
As a [role], I want [goal] so that [benefit].

## Boundaries

**Always do:**
- [e.g., "validate all inputs before processing"]
- [e.g., "check permissions before returning data"]

**Ask first (do not proceed unilaterally):**
- [e.g., "adding a new database table or field not in this spec"]
- [e.g., "introducing a new dependency"]
- [e.g., "extending scope beyond these ACs"]

**Never do:**
- [e.g., "skip authentication for this endpoint"]
- [e.g., "log sensitive user data"]
- [e.g., "modify data or contracts owned by other features"]

## Acceptance Criteria

### AC-1: [Short Title] [MUST]
Given [initial context]
When [action is taken]
Then [expected outcome]

### AC-2: [Short Title] [MUST]
Given [initial context]
When [action is taken]
Then [expected outcome]

### AC-E1: [Error Case Title] [MUST]
Given [invalid or edge condition]
When [action is taken]
Then [expected error response or behavior]

### AC-3: [Short Title] [SHOULD]
Given [initial context]
When [action is taken]
Then [expected outcome]

### AC-4: [Explicitly Excluded Feature] [WONT]
This feature will NOT include [capability]. Reason: [why it's excluded from this iteration].

## Out of Scope
- [Item 1]
- [Item 2]

## Open Questions
- [NEEDS CLARIFICATION] [Question 1]
- [RESOLVED] [Question 2] → Decision: [answer]

## Non-Functional Requirements
- Performance: [e.g., "search results in < 200ms at p95"]
- Security: [e.g., "requires authenticated session — see constitution.md"]
- Accessibility: [e.g., "WCAG 2.1 AA for all interactive elements"]

## Impact Verification
<!-- How will we verify this spec contributes to the vision's success metrics? -->
- [e.g., AC-1 enables Impact I-001 by allowing users to complete journey X]
- [e.g., Feature analytics will track activation rate (Leading Indicator from vision.md)]

## S&T Assumptions (Specs → Plan)

**Necessity:** Why is a Plan necessary to implement these Specs?

**Achievability:** Why are these Specs achievable given the planned technical approach?

**Sufficiency:** Why is the planned technical approach sufficient to satisfy these Specs?

**Warnings:** What must go right / be avoided for the Plan to succeed?
```

---

## plan.md Template

*Enhanced from SDD. Adds impact-chain header and spec-origin reference.*

```markdown
# Technical Plan: [Feature Name]

> Impact Chain: V-001 → S-002 → T-003 → SP-004 → PL-005

## Spec Reference
Implements: `vdd/specs/[branch]/spec.md`

## Architecture Overview
<!-- High-level description of the approach. 3-5 sentences max. -->

## Component Breakdown

### [Component 1 Name]
- **Responsibility:** [What it does]
- **Location:** `[file path]`
- **Accepts:** [inputs]
- **Returns:** [outputs]
- **AC Coverage:** AC-1, AC-2

### [Component 2 Name]
- **Responsibility:** [What it does]
- **Location:** `[file path]`
- **Accepts:** [inputs]
- **Returns:** [outputs]
- **AC Coverage:** AC-3

## Technology Choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| [e.g., DB query] | [e.g., Drizzle ORM] | [e.g., already in stack, type-safe] |

## Integration Points
- [System]: [How it's used]

## AC Coverage Map

| AC | Component(s) | Contract(s) | Verified By |
|----|-------------|-------------|-------------|
| AC-1 | [ComponentName] | [contracts/file.md] | Playwright: `tests/e2e/feature.spec.ts` |
| AC-2 | [ComponentName] | [contracts/file.md] | Vitest: `tests/unit/feature.test.ts` |
| AC-E1 | [ComponentName] | [contracts/file.md] | Vitest: `tests/unit/feature.test.ts` |
| AC-5 (perf) | [ComponentName] | — | Browserless Lighthouse: LCP < [ms] |

## Toolchain Verification

| Tool | AC Coverage | CI Stage |
|------|------------|----------|
| Vitest | AC-2, AC-E1 | `unit-test` |
| Playwright | AC-1 | `e2e-test` |
| Browserless (perf) | AC-5 | `perf` |
| Browserless (visual) | All UI ACs | `visual-diff` |
| axe-core | A11y ACs | `a11y` |
| Sentry | I-002 (reliability) | `sentry-init` (post-deploy) |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| [e.g., Third-party API unavailable] | Low | High | Circuit breaker + fallback |

## S&T Assumptions (Plan → Tasks)

**Necessity:** Why is a Task breakdown necessary to execute this Plan?

**Achievability:** Why is this Plan achievable given the planned task decomposition?

**Sufficiency:** Why is the planned task decomposition sufficient to implement this Plan?

**Warnings:** What must go right / be avoided for Tasks to succeed?
```

---

## data-model.md Template

*Enhanced with impact-chain header.*

```markdown
# Data Model: [Feature Name]

> Impact Chain: V-001 → S-002 → T-003 → SP-004 → PL-005

## Spec Reference
Implements: `vdd/specs/[branch]/spec.md`

## Entities

### [EntityName]
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, NOT NULL | Primary key |
| [field] | [type] | [constraints] | [description] |
| created_at | timestamp | NOT NULL, DEFAULT now() | |
| updated_at | timestamp | NOT NULL | |

### Relationships
- `[EntityA]` has many `[EntityB]` (via `entity_b.entity_a_id`)
- `[EntityA]` belongs to `[EntityC]`

## Indexes
| Table | Columns | Type | Rationale |
|-------|---------|------|-----------|
| [table] | [col1, col2] | btree | [e.g., lookup by user + date] |

## Constraints
- [e.g., `CHECK (status IN ('active', 'inactive', 'pending'))` on `users`]

## Migrations

### [Migration 001] Initial schema
- Create `[table_name]` table with all fields above
- Add indexes from the Indexes section above
- **Rollback:** drop `[table_name]` table
```

---

## contracts/[endpoint].md Template

*Enhanced with impact-chain header.*

```markdown
# API Contract: [Endpoint Name]

> Impact Chain: V-001 → S-002 → T-003 → SP-004 → PL-005

## [HTTP METHOD] [/path/:param]

### Description
[One sentence describing what this endpoint does]

### Authentication
[e.g., "Bearer token required" / "Public" / "Admin role required"]

### Request

**Path Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| [param] | string | yes | [description] |

**Query Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| [param] | string | no | [default] | [description] |

**Request Body:**
```json
{
  "field": "type — description",
  "optionalField?": "type — description"
}
```

### Response

**Success (200 OK):**
```json
{
  "id": "uuid",
  "field": "value"
}
```

**Error Codes:**
| Status | Code | When |
|--------|------|------|
| 400 | VALIDATION_ERROR | [condition] |
| 401 | UNAUTHORIZED | [condition] |
| 404 | NOT_FOUND | [condition] |
| 409 | CONFLICT | [condition] |

### AC Coverage
- AC-1: [How this endpoint satisfies it]
```

---

## tasks.md Template

*Enhanced with full impact-chain per task.*

```markdown
# Task List: [Feature Name]

> Impact Chain: V-001 → S-002 → T-003 → SP-004 → PL-005 → TK-006

## Plan Reference
Implements: `vdd/specs/[branch]/plan.md`

## Tasks

### Setup

- [ ] **TASK-001** [S] Set up [component/module] skeleton
  - Creates: `[file path]`
  - Depends on: none

### [Component Group]

- [ ] **TASK-002** [M] [P] Write tests for [component]
  - Tests: AC-1, AC-2 from `vdd/specs/[branch]/spec.md`
  - Depends on: TASK-001

- [ ] **TASK-003** [M] Implement [component]
  - Contract: `vdd/specs/[branch]/contracts/[file].md`
  - Satisfies: AC-1, AC-2
  - Depends on: TASK-002

### Integration

- [ ] **TASK-006** [L] Integration test: full [feature] flow
  - Tests: AC-1 through AC-4
  - Depends on: TASK-003, TASK-005

### Cleanup

- [ ] **TASK-007** [S] Update API documentation
  - Depends on: TASK-006

## Legend
- `[S]` Small — under 1 hour
- `[M]` Medium — 1–3 hours
- `[L]` Large — 3–6 hours (consider splitting)
- `[P]` Parallelizable — can run concurrently with other `[P]` tasks at same level
```

---

## research.md Template

*Optional artifact for documenting context and alternatives.*

```markdown
# Research: [Feature Name or Decision Topic]

> Impact Chain: V-001 → S-002 → T-003 → SP-004

## Context
<!-- Why was this research needed? What decision does it inform? -->

## Options Considered

### Option A: [Name]
**Description:** [1-2 sentences]
**Pros:**
- [Advantage 1]
**Cons:**
- [Disadvantage 1]
**Estimated effort:** [S / M / L]

### Option B: [Name]
**Description:** [1-2 sentences]
**Pros:**
- [Advantage 1]
**Cons:**
- [Disadvantage 1]
**Estimated effort:** [S / M / L]

## Decision
**Chosen:** Option [A/B]
**Rationale:** [Why this option was selected]
**Date:** [YYYY-MM-DD]
**Decided by:** [human / team / constraint]

## References
- [Link or document title]
```

---

## decision_log.md Template

```markdown
# Decision Log: [Feature Name]

> Impact Chain: [Full impact chain]

---

## [YYYY-MM-DD] [Short Decision Title]

**Context:** [What situation triggered this decision]
**Options:**
- Option A: [brief description]
- Option B: [brief description]
**Decision:** [What was decided]
**Rationale:** [Why]
**Impact:** [Which files or specs are affected]
**Decided by:** [human / team]
```

---

## Impact Verification Report Template

*Generated during Phase 8 (Validate) — verifies the chain from code back to vision.*

```markdown
# Impact Verification Report

> Full Chain: V-001 → S-002 → T-003 → SP-004 → PL-005 → TK-006 → [commits]

Date: [YYYY-MM-DD]

## Traceability Summary

| Level | Artifact | Status |
|-------|----------|--------|
| Vision | V-001 | Approved |
| Strategy | S-002 | Approved |
| Tactics | T-003 | Approved |
| Spec | SP-004 | All MUST ACs pass |
| Plan | PL-005 | All components implemented |
| Tasks | TK-006 | All tasks complete |
| Code | [N commits] | All tests pass |
| Impact | [metrics gathered] | [results] |

## Forward Coverage (Parent → Children)

| Parent | Children | All Covered? |
|--------|----------|-------------|
| V-001 (Vision) | S-002 (Strategy) | Yes |
| S-002 (Strategy) | T-003 (Tactics) | Yes |
| T-003 (Tactics) | SP-004 (Spec) | Yes |
| SP-004 (Spec) | PL-005 (Plan) | Yes |
| PL-005 (Plan) | TK-006 (Tasks) | Yes |
| TK-006 (Tasks) | [N commits] | Yes |

## Backward Authorization (Child → Parent)

| Child | Authorized Parent | Valid? |
|-------|------------------|--------|
| [Every task] | PL-005 | Yes |
| [Every component] | SP-004 | Yes |
| [Every AC] | T-003 | Yes |
| [Every code artifact] | [Spec AC] | Yes |

## Orphan Detection

| Artifact | Status | Action |
|----------|--------|--------|
| (none found) | — | — |

## Uncovered Detection

| Parent | Status | Action |
|--------|--------|--------|
| (none found) | — | — |

## Impact Metrics vs Targets

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| [Leading indicator 1] | [target] | [actual] | [ON TRACK / AT RISK / BELOW] |
| [Lagging indicator 1] | [target] | [TBD — post-launch] | [PENDING] |

## S&T Assumption Validation

| Assumption | Held? | Evidence |
|-----------|-------|----------|
| Necessity (V→S) | Yes | Strategy research was required to identify viable approaches |
| Achievability (V→S) | Yes | All strategic pillars have implementation paths |
| Sufficiency (V→S) | Yes | Strategy covers all vision goals |
| Warnings (V→S) | Yes | All warnings monitored; no violations detected |
| ... (repeat for all 7 gates) | ... | ... |

## Drift Report

| Drift Type | Artifact | Severity | Status |
|-----------|----------|----------|--------|
| (none found) | — | — | — |

## Decision

**Release Readiness:** [GO / NO-GO / GO WITH CONDITIONS]

**Conditions (if any):**
- [Condition 1]
```
