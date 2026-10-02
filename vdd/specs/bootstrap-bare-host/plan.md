# Technical Plan

Status: Active
Version: 1.0
Last updated: 2026-10-03

> Impact Chain: V-001 → S-002 → T-003 → SP-004 → PL-005

## Spec Reference

Implements: `vdd/specs/bootstrap-bare-host/spec.md`

## Architecture Overview

`bootstrap_host` is a thin orchestrator over the existing clone engine. Pure
platform logic lives in a new side-effect-free `platform.ts` (parsed
`/etc/os-release`, distro→manager mapping, upgrade-command plan, upgradable
count parsing). The tool calls `inspect` → builds a platform report + upgrade
plan (executed only when `upgrade:true`) → `apply` (installs latest-stable
OpenCode, records version via a follow-up `opencode --version`) → `verify`, and
returns one composite Zod-typed result. `help:true` short-circuits before any
target access. No new runtime dependency.

## Component Breakdown

### platform.ts
- **Responsibility:** Pure helpers — `parseOsRelease`, `resolvePackageManager`,
  `managerSpec`, `buildUpgradePlan`, `parseUpgradableCount`, `planPlatform`.
- **Location:** `mcp-server/src/platform.ts`
- **AC Coverage:** AC-2, AC-3, AC-E1

### bootstrap.ts
- **Responsibility:** Orchestration — inspect, plan platform, optional upgrade
  execution, apply, version capture, verify; returns `BootstrapResult`.
- **Location:** `mcp-server/src/bootstrap.ts`
- **AC Coverage:** AC-3, AC-4, AC-5, AC-6, AC-7, AC-E2

### tools.ts (`bootstrap_host`)
- **Responsibility:** Zod input/output schema, `help` short-circuit, error
  handling; register alongside existing tools.
- **Location:** `mcp-server/src/tools.ts`
- **AC Coverage:** AC-1, AC-E3

### probe.ts
- **Responsibility:** add `ID_LIKE` to the probe JSON so distro family is exact.
- **Location:** `mcp-server/src/probe.ts`
- **AC Coverage:** AC-2

## Technology Choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Platform logic | Pure TypeScript module | Deterministic, unit-testable without root/network |
| Manager mapping | `ID`/`ID_LIKE` → family → manager | Matches established cross-distro pattern |
| Version capture | run `opencode --version` post-install | Only reliable source of resolved build |
| Upgrade execution | opt-in, non-interactive flags | Constitution: destructive steps opt-in |
| Schemas | Zod input/output (existing pattern) | TDQS + type safety |

## AC Coverage Map

| AC | Component(s) | Contract(s) | Verified By |
|----|-------------|-------------|-------------|
| AC-1 | tools.ts | `contracts/bootstrap_host.md` | Vitest (in-memory client) |
| AC-2 | platform.ts, probe.ts | contract | Vitest unit + server test |
| AC-3 | bootstrap.ts | contract | Vitest (dry-run) |
| AC-4 | bootstrap.ts, components.ts | contract | Unit + server test (version shape) |
| AC-5 | bootstrap.ts (apply/verify) | contract | Existing clone tests + server test |
| AC-6 | clone.apply (present) | contract | Vitest |
| AC-7 | profile.renderEnvTemplate | contract | Existing render tests |
| AC-E1 | platform.ts | contract | Vitest |
| AC-E2 | tools.ts | contract | Vitest |
| AC-E3 | tools.ts | contract | Vitest |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Version parse varies by opencode build | Medium | Low | Regex-tolerant parser; `null` on failure |
| Probe schema change breaks existing tests | Low | Medium | Additive field only |
| Upgrade execution unsafe | Medium | High | Dry-run default; `upgrade:true` + root required |

## S&T Assumptions (Plan → Tasks)

**Necessity:** Tasks must be test-first and ordered so pure logic lands before
orchestration.

**Achievability:** Every task touches a file already covered by CI.

**Sufficiency:** The task set yields all Must ACs with unit + integration tests.

**Warnings:** Keep `components.ts` `opencode` install semantics (idempotent); add
versioning without changing detect behavior.
