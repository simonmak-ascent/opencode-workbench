# Documentation Gaps

> Updated: 2026-10-03
> Tracks the delta between required documentation and current state.

## Gap Severity

| Level | Meaning |
|-------|---------|
| **Critical** | Blocks workflow progression |
| **High** | Needed before next phase |
| **Medium** | Resolve within current phase |
| **Low** | Nice to have; can defer |

## Current State

All Phase #0–#3 documentation gaps are **resolved**; the register is maintained
for drift going forward.

### Resolved

| # | Item | Status |
|---|------|--------|
| 1–4 | `docs/audit/*` inventory / checklist / review-log / gaps | ✅ present |
| 5 | `docs/audit/DOCS_QUALITY_APPROVED.flag` | ✅ present |
| 6–10 | `docs/research/*` (best-practices, tooling) | ✅ present |
| 11–31 | `docs/architecture/*`, `docs/config/*`, `docs/design/*` | ✅ present |
| 32 | `docs/tools/*` | ✅ present |
| 33 | `WORKFLOW_STATE.md` | ✅ refreshed 2026-10-03 |
| 35–37 | Duplicate/stale runtime docs | ✅ consolidated: `docs/architecture/opencode-runtime-config.md` is canonical; `docs/opencode-runtime-config.md` left only as needed |
| — | VDD chain (`constitution.md`, `vdd/**`) | ✅ added 2026-10-03 |
| — | `docs/publishing/registry-listing.md`, `server.json` | ✅ added 2026-10-03 |

### Open (Low)

| # | Item | Severity | Status |
|---|------|----------|--------|
| 34 | `.opencode/SYSTEM_PROMPT.md` | Low | Deferred — covered by `AGENTS.md` + `docs/prompts/system-prompt.md`; no separate file required unless the workflow demands it |
| 36 | `docs/security-audit-report.md` freshness | Low | Refresh on the next security sprint |
| 41 | `docs/architecture/mcp-inventory.md` is generated (may lag edits) | Low | Regenerate via `scripts/inventory/inventory-mcp.sh` when `opencode.json` changes |

## Summary

- **Critical gaps:** 0 · **High:** 0 · **Medium:** 0
- **Low (open):** 3 (non-blocking)
- **Status:** documentation is complete for the current release; CI enforces
  required-doc presence and config/doc count parity.
