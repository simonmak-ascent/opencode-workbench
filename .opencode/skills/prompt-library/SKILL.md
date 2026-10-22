---
name: prompt-library
description: Trigger the master 'improve' prompt — autonomous continuous repo improvement (research, audit incl. spec-gap + security + E2E, SDD plan, execute, loop). Use when the user says "run improve", "improve this repo", "run the master prompt", "continuous improvement", "list prompts", or asks about the prompt library.
license: MIT
compatibility: opencode
metadata:
  domain: tooling
  audience: developers
---

## What I do

Load and execute the single master prompt `improve`
(`~/.config/opencode/prompts/improve.md`), which runs autonomous,
user-input-free improvement cycles on the current repo.

## When to use me

Trigger phrases: "run improve", "run improve [N]" (N = target cycles,
default 10 — pass it through to the prompt's Invocation & cycle count
section), "improve this repo", "run the master prompt",
"continuous improvement", "keep improving until done", "list prompts",
"prompt library".

## The library has one master prompt

`~/.config/opencode/prompts/improve.md` — read it in full and follow it
exactly. It subsumes: spec-quality review, spec-gap traceability, security
audit, dependency audit, E2E testing, SDD remediation, and cycle
orchestration. Do not recreate these as separate prompts; extend the master
file instead.

Project-local override: if `<repo>/.opencode/prompts/improve.md` exists, it
takes precedence over the global file (mention this to the user).

## Workflow

1. Resolve the prompt file (project scope first, then global).
2. Read it completely. Its frontmatter `mcp:` list declares the servers it
   uses — for each, confirm availability before first use; on failure apply
   the file's graceful-degradation rules (never block).
3. Execute the phases in order (P1→P9), honoring:
   - the safety rails (no default-branch pushes, no merges, no local compute,
     read-only live-state MCP, no secrets exposure),
   - the Autonomous Decision Policy — never ask the user questions,
   - the loop-control stop conditions S1–S5.
4. Memory bookends: `recall("improve <repo-name>")` at start;
   `remember("improve/<repo-name>/cycle-<n>", ...)` after each cycle.
5. Emit the per-cycle summaries and, on stop, the Final Run Report.

## Guardrails

- The master prompt is autonomous by design — do not insert approval pauses.
  The human reviews via the PRs and the Human-Decision Register.
- Verification (unit/E2E/lint/type-check) runs only in SWAS or CI —
  never on the local machine.
- If the task is narrower than full improvement (e.g., "just write tests for
  X"), prefer the matching dedicated skill (`test-writer`, `spec-writer`,
  `dependency-audit`, …) and say so, rather than launching the full loop.
