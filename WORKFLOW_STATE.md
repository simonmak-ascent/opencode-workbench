# Workflow State

> Auto-updated. Read FIRST on every session start.
> Last updated: 2026-10-03

## Current Status

| Item | Status |
|------|--------|
| Phase #0 — Verify Docs | **COMPLETED** |
| Phase #1 — Research | **COMPLETED** |
| Phase #2 — Architecture | **COMPLETED** |
| Phase #3 — Implementation | **COMPLETED** (clone MCP + provision_host shipped) |
| VDD chain (Phase 0–8) | **COMPLETED** — `constitution.md` + `vdd/` (gates G1–G7 PASS) |
| Distribution | In progress — npm published; Vercel live; registry publish prepared |

## Last Checkpoint

```
Phase: #3 — Implementation (complete)
Status: opencode-workbench v1.1.2 shipped; VDD chain complete; docs refreshed
Timestamp: 2026-10-03
```

## Tracks

### opencode-workbench (clone MCP) — DELIVERED
| Item | Status | Output |
|------|--------|--------|
| Clone engine (inspect/plan/apply/verify) | DONE | `mcp-server/src/clone.ts` |
| Consent gate + value-blind credentials | DONE | `apply_clone`/`install_component` `confirm:true`; `list_required_credentials`, `run_auth_flow` |
| One-call provisioning | DONE | `provision_host` (platform scan + upgrade plan + OpenCode pin + verify + `help`) |
| Tests + CI | DONE | 49 tests; `mcp-server.yml` |

### VDD chain — DELIVERED
| Phase | Artifact |
|-------|----------|
| 0 Init | `constitution.md` |
| 1 Vision | `vdd/vision.md` (V-001; I-001…I-007) |
| 2 Strategy | `vdd/strategy.md` (S-002) |
| 3 Tactics | `vdd/tactics.md` (T-003; A-001…A-011) |
| 4–6 Spec/Plan/Tasks | `vdd/specs/bootstrap-bare-host/`, `vdd/specs/mcp-quality-and-registry/` |
| 7 Implement | `mcp-server/src/{platform,bootstrap,version}.ts` |
| 8 Validate | `vdd/impact-report.generated.md`, `vdd/gates/G1–G7.md` |

### Registry distribution
| Registry | Status |
|----------|--------|
| npm | ✅ `@simonmak-ascent/opencode-workbench@1.1.2` |
| Vercel (hosted connector) | ✅ live at `https://opencode-workbench.simonmak.com/mcp` |
| Official MCP Registry | manifest ready (`server.json`) + OIDC workflow |
| Glama | ✅ claim file live |
| Smithery / PulseMCP / mcp.so | prepared (`docs/publishing/registry-listing.md`) |

## Infrastructure Status

| Component | Status |
|-----------|--------|
| Docker (pg-memory, browserless) | Running (build box) |
| MCP servers | 35 configured, 33 enabled (2 disabled: `google-search`, `google-workspace`) |
| Vercel project | `opencode-workbench` (AP Team) — production live |
| npm package | `@simonmak-ascent/opencode-workbench@1.1.2` |

## Instructions

### On Session Start
1. Read this file FIRST.
2. Check phase/tracks above.
3. For repo facts, treat `opencode.json` and `package.json` as source of truth.

### On Change
Update the relevant track and `docs/CHANGELOG_WORKBENCH.md`.
