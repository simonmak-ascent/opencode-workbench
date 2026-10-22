# AI Agent Patterns

Multi-agent orchestration, context management, parallel execution, and bidirectional verification patterns for VDD.

---

## The Recursive S&T Pattern

Every VDD phase follows Goldratt's Strategy-Tactic recursive decomposition. An AI agent at each phase must understand its dual role:

| Role | Question | Phase |
|------|----------|-------|
| **Strategy** (parent) | "What must the level below achieve?" | Sets the objective for the next phase |
| **Tactic** (child to parent) | "How does this level achieve the level above?" | Implements the parent's objective |
| **Next Strategy** (child to grandchild) | "What must the level below achieve?" | Passes the torch to the next phase |

An agent generating Strategy is simultaneously the Tactic for Vision AND the Strategy for Tactics. This recursive understanding is essential for correct bidirectional verification.

---

## Context Management

### The Single-Phase Context Rule

Each phase starts with a fresh context window. Never carry context across phases.

**Why:** AI sessions accumulate assumptions. By Phase 7 (Implement), an agent that also generated the Strategy has anchored to decisions made days ago and may resist the current spec.

**What to include per phase:**

| Phase | Required Context |
|-------|-----------------|
| Vision | Human's freeform statement only |
| Strategy | vision.md + domain-primers (loaded) |
| Tactics | strategy.md + full repository access |
| Specs | tactics.md → specific action item + vision.md (relevant section) |
| Plan | spec.md + constitution.md + research.md (if present) |
| Tasks | plan.md + contracts/ |
| Implement | Single task + relevant ACs + relevant contract + relevant plan section + constitution.md |
| Validate | Full chain — all artifacts + all code |

### The Per-Task Context Rule (Phase 7)

Each task in tasks.md gets its own AI context window. Include:

1. The specific task from tasks.md
2. The specific ACs it covers from spec.md
3. The Boundaries section from spec.md
4. The relevant contract from contracts/
5. The relevant plan section from plan.md
6. The relevant entities from data-model.md
7. constitution.md (always — never skip)

**Do NOT include:**
- The entire spec.md (noise)
- Output from other tasks ("you already created X in TASK-003")
- Architectural summaries not related to this task

---

## Parallel Research Subagents (Phase 2 — Strategy)

The Strategy phase requires the most intensive parallel AI work. Spawn 5 subagents simultaneously.

### Dispatch Pattern

```
[Main Agent spawns 5 subagents in parallel]

Subagent 1 — Market Research:
  Tools: Brave Search, Perplexity Research
  Input: vision.md (goal, actors, impacts, target domains)
  Output: 300-500 word summary with citations
  Timeout: 120s

Subagent 2 — Competitive Analysis:
  Tools: Brave Search, Playwright (if URLs available)
  Input: vision.md + domain-primers (market section)
  Output: 300-500 word competitive matrix with citations
  Timeout: 120s

Subagent 3 — Technology Assessment:
  Tools: Context7, gh_grep
  Input: vision.md + constitution.md (tech stack) + domain-primers (tech section)
  Output: 300-500 word technology fit assessment
  Timeout: 120s

Subagent 4 — Impact Feasibility:
  Tools: Perplexity Research
  Input: vision.md (impact model + success metrics)
  Output: 300-500 word feasibility analysis with case studies
  Timeout: 120s

Subagent 5 — Domain Deep-Dive:
  Tools: Loaded domain-primers (all research patterns)
  Input: vision.md + domain-primers
  Output: 300-500 word domain-specific constraints and patterns
  Timeout: 120s

[All subagents complete → Main Agent synthesizes into strategy.md]
```

### Failure Handling

- If a subagent times out: re-run with reduced scope (single question instead of broad topic)
- If a subagent returns low-confidence results: flag in strategy.md under "Research Limitations"
- If 3+ subagents fail: halt. The strategy is under-researched. Ask human whether to proceed with limited research.

---

## Bidirectional Verification Agent Pairs

At each gate, two critic agents run in parallel — one forward, one backward. Neither agent sees the other's output until both complete. This prevents anchoring.

### Gate Critic Dispatch Pattern

```
[Main Agent dispatches 2 critics for Gate G(N)]

Critic A — Forward Verifier:
  Role: "You verify parent→child coverage"
  Input: Parent artifact + child artifact
  Prompt: Gate G(N) Forward Verification checks
  Output: [FAIL-FWD] items or "Forward verification pass"

Critic B — Backward Verifier:
  Role: "You verify child→parent authorization"
  Input: Parent artifact + child artifact
  Prompt: Gate G(N) Backward Verification checks
  Output: [FAIL-BWD] items or "Backward verification pass"

[Both critics complete → Main Agent aggregates results]

If both pass: Gate passes. Record S&T assumptions.
If either fails: Main Agent attempts self-heal (regenerate failing sections).
If self-heal fails twice: Halt for human review.
```

### Critic Rules

1. **Critics never share context with the generating agent.** A fresh context window produces honest criticism.
2. **Critics never rewrite.** They report issues only. The generating agent (or main agent) applies fixes.
3. **Critics are role-specific.** A QA critic checks testability, not architecture. A Security critic checks auth, not performance.
4. **Critics are binary.** "PASS" or a numbered list of [FAIL-XXX] items. No summaries, no compliments, no hedging.

### Critic Roles by Phase

| Phase | Forward Critic | Backward Critic |
|-------|---------------|-----------------|
| Vision (after expansion) | Product Critic (scope gaps, missing actors) | Impact Critic (unmeasurable goals, vague metrics) |
| Strategy (after synthesis) | Coverage Critic (vision goals mapped to pillars) | Authorization Critic (pillars trace to vision) + Feasibility Critic |
| Tactics (after audit) | Gap Critic (uncovered pillars, missed gaps) | Authorization Critic (action items trace to strategy) + Dependency Critic |
| Specs (after generation) | QA Critic (untestable ACs) + Security Critic (missing auth) | Scope Critic (spec within tactical item bounds) |
| Plan (after design) | Architecture Critic (over-engineering) + Contract Critic (incomplete APIs) | Constitution Critic (violations) + Trace Critic (components match ACs) |
| Tasks (after breakdown) | Coverage Critic (components → tasks) + Size Critic (oversized tasks) | Order Critic (test-first valid) + Dependency Critic (no cycles) |
| Implement (per task) | Task completion check | Scope adherence + signature check |
| Validate (full chain) | Impact Coverage Critic (vision goals → code) | Orphan Critic (unauthorized code) + Drift Critic |

---

## Parallel Task Execution (Phase 7)

Tasks marked `[P]` can run in parallel AI sessions.

### Rules

- Parallelizable tasks MUST NOT write to the same files
- Parallelizable tasks MUST NOT depend on each other's output
- Merge conflicts from parallel tasks = problem with task decomposition (fix tasks.md)

### Dispatch Pattern

```
Task A [P]: Independent UI component
  → Agent 1: fresh context + task + spec sections
  → Commit

Task B [P]: Independent utility function
  → Agent 2: fresh context + task + spec sections
  → Commit

[Both complete → merge → integration test task]
```

---

## AI Tool Selection Per Phase

| Phase | Capability Needed | Tools |
|-------|------------------|-------|
| Constitution | Broad domain knowledge, instruction following | Any capable model |
| Vision | Intent understanding, impact modeling | Any capable model |
| Strategy | Web research, parallel subagents, large context | Brave Search, Perplexity, Context7, gh_grep, Playwright |
| Tactics | Repository analysis, pattern detection | File system access, glob, grep, read |
| Specs | Ambiguity detection, requirements engineering | Any capable model |
| Plan | Technical architecture reasoning, large context | File system access, Context7 |
| Tasks | Structured output, dependency reasoning | Any capable model |
| Implement | File access, code completion, test execution | IDE-native (Claude Code, Cursor, Copilot) |
| Validate | Multi-file comparison, full-chain analysis | File system access, shell |

---

## Handling AI Resistance (Spec Drift)

When AI resists following the spec during implementation:

```
Stop. The specification is not a suggestion. The contract is not negotiable during Phase 7.
Your role in this task is to implement [task title] as specified.
If you believe the spec or contract is incorrect, flag it and wait for human review.
Do not unilaterally change the approach.
```

If the suggestion is genuinely valuable:
1. Note it in `vdd/specs/[feature]/decision_log.md`
2. Finish Phase 7 as specified
3. Create a follow-up issue
4. Process it through `/vdd:amend` before implementing

---

## Spec as Recovery Point

When an implementation session fails (context overflow, cascading errors, wrong direction):

1. **Do not fix in the same session** — accumulated context is the problem
2. Note the commit SHA
3. Start a fresh session with only the spec artifacts as context
4. Re-implement from the failing task using a clean context window

The VDD chain is not just a planning tool — it is the recovery checkpoint. A session that goes wrong with a complete VDD chain loses at most one task. A session without it loses everything.

---

## Research Phase with Parallel Subagents

For complex features where the right approach is unclear, run research *before* generating the spec:

```
Spawn parallel subagents to research:

Agent 1: existing patterns in the codebase (grep for similar implementations)
Agent 2: library/framework documentation (Context7 for relevant libraries)
Agent 3: real-world examples (gh_grep for similar patterns in public repos)
Agent 4: domain best practices (domain-primers loaded)

Each agent: read relevant code, search patterns, summarize in 300 words.
After all complete: consolidate into vdd/specs/[feature]/research.md.
Then generate spec.md using research.md as additional context.
```

---

## Auto-Mode Execution

In full-auto mode (default), the VDD chain runs without human intervention from Vision through Validate.

### Auto-Mode Rules

1. **Human provides Vision only.** Everything else is AI-executed.
2. **All gates are self-gates.** AI runs both forward and backward verification.
3. **Self-heal up to 3 attempts per gate.** If a gate fails, AI regenerates the failing section and re-checks. After 3 failures, halt.
4. **Critical-risk gates always halt.** Payment flows, auth core, data encryption — human required regardless of mode.
5. **All decisions are logged.** Every gate pass/fail, every self-heal attempt, every assumption validated — recorded in `vdd/decision_log.md`.
6. **Commit after every phase.** Clean rollback at any phase boundary.
7. **Progress is visible.** After each phase completes, AI reports: "Phase N complete. [N/N] gates passed. [X] warnings."

### Human Override Points

Even in full-auto mode, the human can intervene at any point:
- After vision.md is generated (confirm/refine before Strategy)
- After strategy.md is generated (redirect strategic direction before Tactics)
- After tasks.md is generated (adjust priorities before Implementation)
- At any gate where AI self-heal fails 3 times

### Configuring Auto-Mode

Auto-mode is the default. To switch to gated mode, set in constitution.md:
```
## VDD Mode: gated
```
Or override per-project via environment variable: `VDD_MODE=gated`

---

## Task Extraction Tool (`/vdd:get-next-task`)

Problem: If you show the AI agent the full tasks.md, it may try to implement multiple
tasks at once, or reference future tasks that haven't been defined in context.

Solution: Retrieve one task at a time:

```bash
# Extract a single task by ID from tasks.md
extract-task() {
  local task_id=$1
  local tasks_file=$2
  awk "/\*\*${task_id}\*\*/,/^- \[ \] \*\*TASK-/{if(/^- \[ \] \*\*TASK-/ && !/\*\*${task_id}\*\*/) exit; print}" "$tasks_file"
}
```

Or via VDD command:
```
/vdd:get-next-task vdd/specs/[feature]
```
Returns the next uncompleted task (by checking `- [ ]` vs `- [x]`), with all
necessary context for a single implementation session.

---

## CI/CD Task Progress Tracking

```yaml
# Add to .github/workflows/vdd-gates.yml
- name: Task completion report
  run: |
    total=$(grep -rc "\- \[" vdd/specs/*/tasks.md 2>/dev/null | cut -d: -f2 | paste -sd+ 2>/dev/null | bc 2>/dev/null || echo 0)
    done=$(grep -rc "\- \[x\]" vdd/specs/*/tasks.md 2>/dev/null | cut -d: -f2 | paste -sd+ 2>/dev/null | bc 2>/dev/null || echo 0)
    remaining=$((total - done))
    echo "## Task Progress" >> $GITHUB_STEP_SUMMARY
    echo "| Status | Count |" >> $GITHUB_STEP_SUMMARY
    echo "|--------|-------|" >> $GITHUB_STEP_SUMMARY
    echo "| Completed | $done |" >> $GITHUB_STEP_SUMMARY
    echo "| Remaining | $remaining |" >> $GITHUB_STEP_SUMMARY
    echo "| Total | $total |" >> $GITHUB_STEP_SUMMARY
    if [ $remaining -eq 0 ]; then
      echo ":white_check_mark: All tasks complete" >> $GITHUB_STEP_SUMMARY
    fi
```
