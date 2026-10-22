---
name: valuation-orchestrator
description: Orchestrate the split valuation estate — the apdb-etl data plane (cited inputs), the fair-value compute engine, and valuation-report-review (document audit). Use when a task needs market/company data resolved and a valuation calculated end-to-end, when wiring a "third agent" that spans both planes, or when asked to "get the inputs", "run the valuation", "audit the report", or connect apdb-etl to fair-value.
---

# Valuation orchestrator (data plane ⟂ fair-value ⟂ report review)

Three independent services; you are the orchestration layer. The data plane and
fair-value never call each other — you map one onto the other.

| Plane | Endpoint | Auth | Role |
|---|---|---|---|
| apdb-etl **data plane** | `https://apdb.ascent-partners.com/mcp` | Bearer key, scope `data.read` | Resolve cited inputs from the `valuation/main` read views |
| **fair-value** | `https://fair-value.ascent-partners.com/mcp` · `/v1/` | open / public | Deterministic valuation math over explicit inputs |
| **valuation-report-review** | MCP (`python -m mcp_server`) + CLI | none | Audit a report document vs IVS 2025 / IFRS / HKFRS |

The data-plane client key lives in the apdb-etl checkout at `.env.local`
(`APDB_DATA_PLANE_API_KEY`). fair-value needs no key.

## Steps

1. **Discover the method.** Read `fair-value://methods` (or GET
   `https://fair-value.ascent-partners.com/v1/health` for `surface_version` and
   tool count). The data plane bundles the same catalogue, so `methods` /
   `coverage` also work offline.
2. **Resolve inputs.** Call the data plane `get_inputs` with
   `{entity, methods: [...], as_of?}` and read the **input pack**:
   - `values` — cited values (safe to pass through);
   - `assumptionsRequired` / `assumptionsSuggested` — caller assumptions;
   - `unresolved` — required but not found: **treat as caller-supplied**;
   - `missingMethods` — typo guard; `outputHash` — pin it with the result.
3. **Call fair-value** `calculate_*` with `values` + the caller's
   `assumptionsRequired ∪ unresolved`. Distinguish `method` (the id) from the
   tool (`calculate_*`).
4. **Documents** (not math) go to `valuation-report-review`
   (`review_report` / `valuation-report-review review <file>`), not the engine.
5. **Never fabricate.** Anything unresolved stays unresolved — surface it to the
   caller. Keep `outputHash` for reproducibility.

## Rules

- Full runbook: `apdb-etl/docs/orchestration.md` (endpoints, JSON-RPC examples,
  field semantics, current coverage gaps).
- Data plane is read-only (VIEWER); the only writes are its private `vd_*` cache.
- fair-value is open/public (no token); only the data plane is key-gated.
- Compute/tests run on a compute box (`cs run`), never locally.
- Read `apdb-etl/AGENTS.md` and `docs/boundary.md` before changing the boundary.
