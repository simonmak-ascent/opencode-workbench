# Tactics

Status: Active
Version: 1.0
Last updated: 2026-10-03

> Impact Chain: V-001 → S-002 → T-003

## Strategy Reference

Derived from: `vdd/strategy.md`. Scope: Infrastructure only.

## Codebase Audit

### What Exists

| Asset | Location | Purpose | Pillar Trace | Quality |
|-------|----------|---------|-------------|---------|
| Local/SSH transport | `mcp-server/src/target.ts` | `bash -s` over local spawn or SSH; `shellQuote` | P1, P5 | Good |
| Probe script | `mcp-server/src/probe.ts` | One-shot JSON probe: OS, kernel, arch, package manager, tools | P2 | Good — extend |
| Component model | `mcp-server/src/components.ts` | detect/install per component; `PREAMBLE` detects `$PM`; `pkg_install` | P2, P4 | Refactor |
| Clone engine | `mcp-server/src/clone.ts` | `inspect`/`plan`/`apply`/`verify` | P1, P4 | Good — extend |
| Tool surface | `mcp-server/src/tools.ts` | 6 tools with input/output Zod schemas | P1, P5 | Extend |
| Profile load/render | `mcp-server/src/profile.ts`, `render.ts` | Renders `opencode.json`, env template (names only) | P4, P5 | Good |
| Transports | `mcp-server/src/index.ts`, `http.ts` | stdio + Streamable HTTP | P1 | Good |
| Tests | `mcp-server/test/*.test.ts` | vitest, in-memory MCP client | all | Good — extend |

### Technical Debt

| Debt Item | Location | Severity | Strategy Impact |
|-----------|----------|----------|----------------|
| OpenCode installed **unpinned**, version not recorded | `components.ts:126` | High | Blocks P3 / R-003 |
| No OS upgrade plan or execution (only `pkg_install`) | `components.ts:42-52` | Medium | Blocks P2 |
| Four-call chain (inspect→plan→apply→verify), no single entry | `tools.ts` | Medium | Blocks P1 / I-001 |
| No `help`/self-description parameter on tools | `tools.ts` | Low | Blocks I-005 |
| `PREAMBLE` manager list lacks `emerge`/`nix-env`; no upgrade commands | `components.ts:39-52` | Low | Limits P2 coverage |
| Docs drift: MCP count stated 19/18/29 vs 35 actual; README Figma/secret rows stale; changelog stale | `README.md`, `AGENTS.md`, `docs/` | High | Governance (VDD adoption) |
| No CI assertion that docs match `opencode.json` | `.github/workflows/` | Medium | Lets drift recur |

### Reusable Assets

| Asset | Strategy Support | Reuse Effort |
|-------|-----------------|-------------|
| Component detect/install model | Add platform + pin steps without new framework | Low |
| `inspect`/`apply`/`verify` | Backbone of `bootstrap` | Low |
| `PREAMBLE` + `$PM` detection | Basis for manager mapping | Low |
| Env-template renderer | Secret-safety for P5 | None |

## Gap Analysis

| Gap | Pillar Affected | Impact if Unaddressed |
|-----|----------------|----------------------|
| No platform scan/upgrade plan | P2 | "kernel up" requirement unmet; I-002 fails |
| No one-call bootstrap entry | P1 | 4+ commands; I-001/I-005 fail |
| No OpenCode version capture | P3 | "latest stable" unreproducible; R-003 |
| No `help` | P1 | User must read source; I-005 fails |
| VDD artifacts/CI drift | Governance | Traceability and drift detection fail |

## Prioritized Action Items

| ID | Action Item | Priority | Pillar | Size | Deps |
|----|------------|----------|--------|------|------|
| A-001 | Add `platform.ts`: parse `/etc/os-release`, map distro→manager, build upgrade plan, parse upgradable count | MUST | P2 | M | None |
| A-002 | Add `bootstrap_host` tool (+ `help`) orchestrating inspect→platform plan→apply→verify | MUST | P1 | M | A-001 |
| A-003 | Capture resolved OpenCode version; allow `opencodeVersion` override | MUST | P3 | S | A-002 |
| A-004 | Opt-in `upgrade:true` execution of the plan (dry-run default) | SHOULD | P2 | M | A-001, A-002 |
| A-005 | Reconcile docs + record VDD chain + changelog entry | MUST | Governance | M | None |
| A-006 | CI assertion: docs counts match `opencode.json` | SHOULD | Governance | S | None |
| A-007 | Tests: platform parsing/plan, help, idempotency | MUST | P1, P2 | M | A-001, A-002 |

### [AMEND 2026-10-03] Quality + registry distribution (V-001 → I-006/I-007)

| ID | Action Item | Priority | Pillar | Size | Deps |
|----|------------|----------|--------|------|------|
| A-008 | Resolve TDQS lint warnings (shadow-candidates) and keep lint at 0 errors | MUST | P1 | S | A-002 |
| A-009 | Add `server.json` manifest for the Official MCP Registry | MUST | Distribution | S | None |
| A-010 | Registry-listing runbook + claim/verify each of the 5 registries; automate what the API allows | MUST | Distribution | M | A-009 |
| A-011 | Capture a full `mcp-tdqs score` (tier A floor) and wire a CI gate when a scorer key is available | SHOULD | P1 | M | A-008 |
| A-012 | Add an optional `sandbox` component: a bubblewrap wrapper (`scripts/sandbox/opencode-sandbox.sh`) confining the OpenCode CLI (read-only system, no `~/.ssh`/secret mounts) | SHOULD | Security | S | None |
| A-013 | Remove the orchestrator `provision_host` (and `bootstrap.ts`/`platform.ts`) to eliminate tool-purpose overlap with `apply_clone`, raising TDQS coherence | MUST | P1 | S | A-002 |

**AMEND dependency map:** `A-002 → A-008 → A-011`; `A-009 → A-010`; `A-002 → A-013`.

> **[AMEND 2026-10-03 — v4.0.0]** A-013 supersedes A-002's one-call orchestrator:
> `provision_host`, `bootstrap.ts` and `platform.ts` were removed (tool count 11 → 10).
> The `bootstrap-bare-host` spec's orchestrator ACs are retired; its inspect/apply/verify
> ACs are served by `clone.ts` via `plan_clone`/`apply_clone`/`verify_clone`.
**AMEND blocker:** A-011 (full score) and Smithery/PulseMCP listing require credentials the
agent does not hold (TDQS hosted API key, Smithery API key, PulseMCP submission); Glama is
already live/claimable and the Official Registry supports GitHub OIDC.

## Dependency Map

```
A-001 ──► A-002 ──► A-003
   └────► A-004 ◄── A-002
A-005   A-006   A-007(A-001,A-002)
```

## Infrastructure Requirements

| Requirement | Domain | Priority | Notes |
|-------------|--------|----------|-------|
| `mcp-server.yml` CI (typecheck+test) | Infra | MUST | Exists; new tests run there |
| Compute box `cs run` verification | Infra | MUST | Per constitution — no local compute |
| gitleaks secret scan | Security | MUST | Exists; must stay clean |

## S&T Assumptions (Tactics → Specs)

**Necessity:** The vision's Must-haves map to a single feature (`bootstrap-bare-host`) spanning platform plan, one entry point, version capture and verify.

**Achievability:** All changes are additive to an existing, tested server; `platform.ts` is pure and unit-testable without root or network.

**Sufficiency:** A-001–A-003 + A-007 deliver the Must ACs; A-004/A-005/A-006 close the Should and governance gaps.

**Warnings:** Do not break the existing six tools or their schemas; the upgrade path stays dry-run-first and root-gated; docs reconciliation must not invent counts.
