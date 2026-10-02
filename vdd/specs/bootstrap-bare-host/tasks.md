# Task List

Status: Active
Version: 1.0
Last updated: 2026-10-03

> Impact Chain: V-001 → S-002 → T-003 → SP-004 → PL-005 → TK-006

## Plan Reference

Implements: `vdd/specs/bootstrap-bare-host/plan.md`

## Tasks

### Setup
- [x] **TASK-001** [S] Add `osIdLike` to the probe JSON
  - Creates/Edits: `mcp-server/src/probe.ts`, `mcp-server/src/clone.ts` (InspectResult)
  - Satisfies: AC-2 (family accuracy)
  - Depends on: none

### Implementation (test-first)
- [x] **TASK-002** [M] [P] Write tests for `platform.ts`
  - Tests: AC-2, AC-3, AC-E1 from `vdd/specs/bootstrap-bare-host/spec.md`
  - Creates: `mcp-server/test/platform.test.ts`
  - Depends on: TASK-001

- [x] **TASK-003** [M] Implement `platform.ts`
  - Creates: `mcp-server/src/platform.ts`
  - Satisfies: AC-2, AC-3, AC-E1
  - Depends on: TASK-002

- [x] **TASK-004** [M] Implement `bootstrap.ts` orchestration
  - Creates: `mcp-server/src/bootstrap.ts`
  - Satisfies: AC-3, AC-4, AC-5, AC-6, AC-7, AC-E2
  - Depends on: TASK-003

- [x] **TASK-005** [M] Register `bootstrap_host` tool with `help`
  - Edits: `mcp-server/src/tools.ts`
  - Contract: `contracts/bootstrap_host.md`
  - Satisfies: AC-1, AC-E3
  - Depends on: TASK-004

- [x] **TASK-006** [S] Update server tool-list test
  - Edits: `mcp-server/test/server.test.ts`
  - Tests: AC-1 tool registration + help shape
  - Depends on: TASK-005

### Documentation / Governance
- [x] **TASK-007** [M] Reconcile docs drift + changelog entry
  - Edits: `README.md`, `AGENTS.md`, `docs/CHANGELOG_WORKBENCH.md`
  - Satisfies: A-005 (governance)
  - Depends on: none

- [x] **TASK-008** [S] Add CI drift assertion (docs counts vs `opencode.json`)
  - Edits: `.github/workflows/validate-inventory.yml`
  - Satisfies: A-006
  - Depends on: none

### Verification
- [x] **TASK-009** [M] Verify on compute box
  - Runs: `cs run "pnpm typecheck && pnpm test && pnpm build"`
  - Tests: AC-1 … AC-7, AC-E1 … AC-E3
  - Depends on: TASK-005, TASK-006

## Legend

- `[S]` < 1h, `[M]` 1-3h, `[L]` 3-6h, `[P]` Parallelizable
