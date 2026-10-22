# Workflow Phases

Step-by-step execution guide for all 8 VDD phases. Each phase follows Goldratt's recursive Strategy-Tactic pattern: every level's Tactic is the next level's Strategy.

---

## Phase 0 — Constitution

### Goal
Produce a `constitution.md` at the project root encoding immutable constraints for all subsequent phases. Applied to every AI prompt during implementation. Verified at every gate.

### Step-by-Step

**Step 0.1 — Project intake**
Gather:
- Tech stack: languages, frameworks, databases, auth mechanism
- Team conventions: naming, file structure, testing approach
- Compliance or security requirements: OWASP, GDPR, PCI-DSS, etc.
- Known anti-patterns to avoid
- Any existing CLAUDE.md, .cursorrules, AGENTS.md files to incorporate
- Domain scope: which domain-primers apply? (webapp, data-storage, etl, infrastructure)

**Step 0.2 — Generate constitution.md**
Use `references/prompt-patterns.md → Phase 0 → Initial Constitution Generation Prompt`.
Place output at the project root: `constitution.md`.

**Step 0.3 — Domain declaration**
Set `Domain Primitives` section in constitution.md. These determine which domain-primers load during Phase 2 (Strategy).

**Step 0.4 — Resolve PENDING items**
All `[PENDING]` items resolved before the first vision. A pending decision (e.g., "do we use Redis for sessions?") causes the first strategy to make assumptions that should be decided here.

**Step 0.5 — Human review (Gate 0)**
Review using Gate 0 checklist in `references/quality-gates.md`.

**Step 0.6 — Commit**
```bash
git add constitution.md
git commit -m "chore: add project constitution"
```

---

## Phase 1 — Vision

### Goal
Produce `vdd/vision.md` — the root of all traceability. Formalized from human's freeform impact statement. Defines WHO benefits, WHAT changes, and HOW success is measured.

### S&T Role
**Vision = L1 Strategy.** Sets the highest-level objective: "What impact should this product create in the world?"

### Step-by-Step

**Step 1.1 — Human provides freeform vision**
Human writes 1-3 paragraphs describing the intended impact. No structure required — natural language preferred. Example:

> "I want to build a platform that helps small farmers in developing countries access fair market prices for their crops. Today they're exploited by middlemen who take most of the profit. By connecting farmers directly to buyers and providing transparent pricing data, we can put more money in farmers' pockets and help lift rural communities out of poverty."

**Step 1.2 — AI expands vision**
Use `references/prompt-patterns.md → Phase 1 → Vision Expansion Prompt`.
AI reads the human's freeform statement and expands it into structured `vision.md`:
- Vision Statement (formalized from human input)
- Impact Model (Goal → Actors → Impacts using Impact Mapping format)
- Stakeholder Map (primary, secondary, tertiary)
- Success Metrics (lagging + leading indicators)
- Constraints & Boundaries
- Target Domains (checked from constitution's domain primitives)

**Step 1.3 — AI runs Vision Completeness self-check**
AI verifies:
- Every success metric has a measurement method
- Every actor has a desired behavioral change documented
- Every impact maps to at least one metric
- Target domains are declared
- Constraints are explicit and verifiable

**Step 1.4 — Human confirmation (optional override point)**
AI presents `vision.md` to human. In full-auto mode, this step is skipped unless the vision fails the completeness self-check. Human can override any section.

**Step 1.5 — Commit**
```bash
mkdir -p vdd
git add vdd/vision.md
git commit -m "vision: formalized product vision and impact model"
```

---

## Phase 2 — Strategy

### Goal
Produce `vdd/strategy.md` — the research-backed bridge from vision to action. AI loads domain-primers, spawns parallel research subagents, and synthesizes findings into strategic pillars.

### S&T Role
**Strategy = L1 Tactic → L2 Strategy.**
L1 Tactic: "How do we achieve the vision?" → Domain research, market analysis, feasibility assessment.
L2 Strategy: "What research-backed approach will we take?" → Strategic pillars, competitive positioning, risk register.

### Step-by-Step

**Step 2.1 — Load domain primers**
AI reads `vdd/vision.md` → Target Domains section. Loads corresponding domain-primers from `domain-primers/`. If vision declares webapp + data-storage, both primers load.

**Step 2.2 — Spawn parallel research subagents**
Use `references/ai-agent-patterns.md → Parallel Research Dispatch`.
AI spawns 4-5 subagents, each researching one dimension:
- **Market Agent**: Brave Search + Perplexity — market size, trends, user demographics
- **Competitive Agent**: Brave Search + Playwright — competitor feature analysis, user reviews
- **Technology Agent**: Context7 + gh_grep — technology feasibility, stack fit, library analysis
- **Impact Agent**: Perplexity research — how similar products measured impact, what worked/failed
- **Domain Agent**: Domain-primer checklist — domain-specific constraints and patterns

**Step 2.3 — Synthesize research**
AI aggregates subagent findings into `strategy.md`:
- Domain & Market Landscape (synthesized from Market + Competitive agents)
- Technology Landscape (from Technology agent, filtered through constitution's tech stack)
- Feasibility Assessment (is this achievable with available resources?)
- Strategic Pillars (3-5 themes, each with rationale, vision trace, and evidence)
- Competitive Analysis table
- Risk Register (threats to the strategy, not just technical risks)

**Step 2.4 — Run Bi-Directional Gate G1 (V→S)**
Use `references/prompt-patterns.md → Phase 2 → Bi-Directional Gate G1 Prompt`.

**Forward check:** Every vision goal has >= 1 strategy pillar. Every vision impact has a strategic approach.
**Backward check:** Every strategy pillar traces to a vision goal. Every research finding serves a vision purpose.
**4 S&T Assumptions:** AI documents Necessity, Achievability, Sufficiency, Warnings for the V→S transition.

If gate fails: AI regenerates the failing section before proceeding.

**Step 2.5 — Commit**
```bash
git add vdd/strategy.md
git commit -m "strategy: research-backed strategic pillars and risk register"
```

---

## Phase 3 — Tactics

### Goal
Produce `vdd/tactics.md` — the repository-grounded action plan. AI audits the existing codebase, maps assets to strategy pillars, identifies gaps, and produces prioritized action items ready for spec generation.

### S&T Role
**Tactics = L2 Tactic → L3 Strategy.**
L2 Tactic: "How do we implement the strategy?" → Codebase audit, gap analysis, action items.
L3 Strategy: "What concrete action items must be built?" → Prioritized action items with dependencies.

### Step-by-Step

**Step 3.1 — Full repository audit**
AI performs comprehensive codebase scan:
- Reads package manifests, directory structure, key source files
- Identifies existing modules, components, utilities, infrastructure
- Assesses technical debt: lint violations, missing tests, outdated dependencies
- Identifies reusable assets that serve strategic pillars
- Maps existing code patterns to strategy pillars

**Step 3.2 — Gap analysis**
For each strategic pillar, identify what exists vs what must be built:
- What code/modules already serve this pillar? (quality assessment)
- What is missing entirely?
- What exists but needs refactoring or replacement?

**Step 3.3 — Generate prioritized action items**
AI produces a numbered list of action items:
- Each item maps to a strategy pillar and has a MoSCoW priority
- Estimated spec size: S/M/L (feeds into planning effort)
- Dependencies declared (what must be done first?)
- Each action item is concrete enough to feed directly into `/vdd:specify`

**Step 3.4 — Run Bi-Directional Gate G2 (S→T)**
Use `references/prompt-patterns.md → Phase 3 → Bi-Directional Gate G2 Prompt`.

**Forward check:** Every strategy pillar has >= 1 tactical action item. Every identified gap has a corresponding action item.
**Backward check:** Every action item traces to a strategy pillar. Every action item is justified (not gold-plating).
**4 S&T Assumptions:** Necessity, Achievability, Sufficiency, Warnings for the S→T transition.

**Step 3.5 — Commit**
```bash
git add vdd/tactics.md
git commit -m "tactics: codebase audit, gap analysis, and prioritized action items"
```

---

## Phase 4 — Specs

### Goal
For each MUST-priority action item in `tactics.md`, generate a `spec.md` that precisely defines WHAT to build. This is where SDD begins within VDD. Can also accept freeform descriptions directly via `/vdd:specify "description"` for simple features that don't need the full V/S/T chain — in that backwards-compatible mode, VDD operates identically to SDD Phase 1 (Specify).

### S&T Role
**Specs = L3 Tactic → L4 Strategy.**

### Spec Level Selection

VDD supports three spec postures:
- **Spec-first**: Write full spec.md upfront → default for action items with clear scope
- **Spec-anchored**: Maintain spec alongside evolving code → use for long-lived features
- **Spec-as-source**: Spec is primary; code is generated → use for high-compliance work

Choose posture per spec. Override in spec.md header: `Spec Level: [spec-first | spec-anchored | spec-as-source]`.

### Step-by-Step

**Step 4.1 — Surface assumptions**
For each action item, AI lists implicit assumptions about roles, permissions, error behavior, scope boundaries. Use `references/prompt-patterns.md → Phase 4 → Assumptions Surface Prompt`.

**Step 4.2 — Generate spec.md**
Use `references/prompt-patterns.md → Phase 4 → Initial Specification Prompt`.
Include corrected assumptions. Each spec includes:
- Impact Chain header (full trace back to vision)
- Tactical Origin (which action item this implements)
- Impact Verification (how this spec contributes to vision metrics)

**Step 4.3 — Clarify (mandatory before Plan)**
Run `references/prompt-patterns.md → Phase 4 → Clarify Phase Prompt`.
Resolve every `[NEEDS CLARIFICATION]` item. Add edge-case ACs. Run automated spec validation.

Perform a full clarification pass covering:
- Resolve ambiguous requirements (make vague terms concrete)
- Find missing edge cases (empty inputs, concurrent requests, service failures)
- Add error/edge case ACs for every happy-path MUST AC
- Resolve all [NEEDS CLARIFICATION] markers
Can also be invoked standalone: `/vdd:clarify <feature>`

**Step 4.4 — Run Bi-Directional Gate G3 (T→S)**
**Forward check:** Every MUST tactical action item has a spec. Every spec has ACs covering the action item's scope.
**Backward check:** Every AC traces to a tactical action item. No spec invents scope not in tactics.
**4 S&T Assumptions:** Documented for the T→S transition.

**Step 4.5 — Cross-artifact analysis**
Run `/vdd:analyze` — checks spec against all existing specs for conflicts (endpoint overlap, entity conflicts, behavioral contradictions). Use `references/prompt-patterns.md → Cross-Phase → Analyze Prompt`.

**Step 4.6 — Commit**
```bash
git add vdd/specs/[feature]/spec.md
git commit -m "spec: [feature name] requirements → action item [A-XXX]"
```

---

## Phase 5 — Plan

### Goal
Translate each `spec.md` into a concrete technical blueprint. Works identically to SDD Phase 2 with enhanced traceability.

### Step-by-Step

**Step 5.1 — Generate plan.md, data-model.md, contracts/**
Use `references/prompt-patterns.md → Phase 5 → Technical Plan Generation Prompt`.
Each artifact includes the full impact chain header.

**Step 5.2 — AC traceability**
Every AC must appear in at least one component in plan.md and at least one contract.

**Step 5.3 — Run Bi-Directional Gate G4 (S→P)**
**Forward check:** Every AC has >= 1 plan component and >= 1 contract coverage.
**Backward check:** Every plan component traces to an AC. No over-engineering.
**4 S&T Assumptions:** Documented for S→P transition.

**Step 5.4 — Lock contracts**
Once approved and committed, contracts are frozen. Changes require amending the full chain.

**Step 5.5 — Commit**
```bash
git add vdd/specs/[feature]/plan.md vdd/specs/[feature]/data-model.md vdd/specs/[feature]/contracts/
git commit -m "plan: [feature name] technical design"
```

---

## Phase 6 — Tasks

### Goal
Break plan.md into granular test-first tasks. Works identically to SDD Phase 3 with enhanced traceability.

### Step-by-Step

**Step 6.1 — Generate tasks.md**
Use `references/prompt-patterns.md → Phase 6 → Task Breakdown Prompt`.

**Step 6.2 — Test-first ordering**
Every implementation task has a preceding test task. Tasks reference specific ACs and contracts.

**Step 6.3 — Run Bi-Directional Gate G5 (P→T)**
**Forward check:** Every plan component has >= 1 task. Every AC has test coverage in task list.
**Backward check:** Every task traces to a plan component. No task invents work outside the plan.
**4 S&T Assumptions:** Documented for P→T transition.

**Step 6.4 — Commit**
```bash
git add vdd/specs/[feature]/tasks.md
git commit -m "tasks: [feature name] task breakdown"
```

---

## Phase 7 — Implement

### Goal
Execute tasks from tasks.md with AI constrained by the full artifact chain. One commit per task. Works identically to SDD Phase 4.

### Step-by-Step

**Step 7.1 — Session setup per task**
Start a fresh context window. Include:
- `constitution.md` (always)
- The task description from `tasks.md`
- The full impact chain header (for commit message)
- Relevant ACs, Boundaries, contracts, plan section, data model

**Step 7.2 — Implement task**
Use `references/prompt-patterns.md → Phase 7 → Single Task Implementation Prompt`.

**Step 7.3 — Run Bi-Directional Gate G6 (T→I)**
**Forward check:** Task produces code that passes tests. Commit references task ID.
**Backward check:** No code outside the task's scope was modified. Commit message traces to task.
**4 S&T Assumptions:** Documented for T→I transition.

**Step 7.4 — Commit after each task**
```bash
git add [files]
git commit -m "feat(scope): [task-id] → [ac-id] → [tactical-item-id]"
```
Commit message format includes full traceability.

**Step 7.5 — Mark task complete in tasks.md**
```markdown
- [x] **TASK-003** [M] Implement UserRepository.create()
```

---

## Phase 8 — Validate

### Goal
Verify the implementation satisfies every acceptance criterion, no drift occurred, and — critically — the built product delivers on the original vision's intended impact.

### Step-by-Step

**Step 8.1 — Generate full-chain traceability matrix**
Use `references/prompt-patterns.md → Phase 8 → Full-Chain Traceability Matrix Prompt`.
Produces the complete V→S→T→SP→PL→TK→Code→Tests traceability report.

**Step 8.2 — Run drift detection**
Use `references/prompt-patterns.md → Phase 8 → Drift Detection Prompt`.
Checks API signatures, database schema, and behavior against all artifacts.

**Step 8.3 — Run Bi-Directional Gate G7 (I→V) — forward**
**Forward check:** Every MUST AC has passing tests. Every spec AC has an implementation. Every tactical item has a completed spec.

**Step 8.4 — Run Bi-Directional Gate G7 (I→V) — backward**
**Backward check:** Every code artifact traces through the full chain to a vision goal. No orphan code, no uncovered vision goals.

**Step 8.5 — Impact verification**
AI assesses whether the built product's behavior aligns with the vision's intended impact:
- Compare implemented features against the Impact Model in vision.md
- Verify leading indicators against targets established in vision.md
- Identify any vision goals that remain unaddressed
- Document lagging indicator expectations (post-launch measurement plan)

**Step 8.6 — S&T assumption validation (all 7 gates)**
For each gate's 4 S&T assumptions (28 total), validate:
- Did the necessity hold? (Was the child level actually necessary?)
- Was the parent achievable? (Did the child approach deliver?)
- Was the child sufficient? (Did it fully cover the parent?)
- Were warnings heeded? (Did documented risks materialize?)

**Step 8.7 — User story walkthrough**
Manually walk through each user story from spec.md in the running application.
Check each AC as a user, not as a developer. This is the "validation" half of
verification-and-validation — does the product actually work for its intended users?

**Step 8.8 — Generate impact verification report**
Use `references/artifact-templates.md → Impact Verification Report Template`.
Output at `vdd/impact-report.md`.

**Step 8.9 — Fix drift immediately**
If drift is found:
- Do not "adjust the spec to match the code"
- Fix the implementation to match the spec
- If the spec is genuinely wrong, run `/vdd:amend` to cascade the change through the full chain
- Re-verify the affected gates

**Step 8.9 — Commit**
```bash
git add vdd/impact-report.md
git commit -m "validate: full-chain impact verification report"
```

---

## Phase-to-S&T Mapping Summary

| Phase | Strategy (What for?) | Tactic (How to?) | Gate |
|-------|---------------------|------------------|------|
| Vision | What impact should we create? | Research-backed strategy | — |
| Strategy | What approach should we take? | Codebase-grounded action items | G1 (V→S) |
| Tactics | What must we build? | Precise acceptance criteria | G2 (S→T) |
| Specs | What behaviors must exist? | Technical architecture | G3 (T→SP) |
| Plan | How should we design it? | Concrete task breakdown | G4 (SP→PL) |
| Tasks | What tasks must be done? | Working code | G5 (PL→TK) |
| Implement | What code must be written? | Verified impact | G6 (TK→IM) |
| Validate | Did we achieve the vision? | — | G7 (IM→VS) |

---

## Amend Workflow (`/vdd:amend`)

When requirements change at any phase, cascade the change through the full chain.

**Step A.1 — Impact assessment**
Identify which artifacts are affected and at which level. Document the impact chain.

**Step A.2 — Update in order**
Always update from the highest affected level downward:
1. vision.md (if vision changed)
2. strategy.md (if strategy changed or vision change cascaded)
3. tactics.md (if tactics changed or above cascaded)
4. spec.md (if spec changed or above cascaded)
5. plan.md + contracts/ (if plan changed or above cascaded)
6. tasks.md (regenerate from first affected task forward)
7. Re-implement affected tasks
8. Re-validate full chain

**Step A.3 — Re-run all gates**
Every gate in the affected chain is re-run. Commit each updated artifact separately with `[AMEND]` marker.
