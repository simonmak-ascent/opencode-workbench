# mcp-quality-and-registry

Status: Clarified
Version: 1.0
Last updated: 2026-10-03

> Impact Chain: V-001 → S-002 → T-003 → SP-005 (amends SP-004)

## Tactical Origin

Implements: `vdd/tactics.md` → A-008 … A-011 (AMEND block), serving vision impacts
I-006 (TDQS quality) and I-007 (registry distribution).

## Clarified Requirement

> "ensure the mcp achieve 5/5, register the mcp in the top 5 free mcp registry"

**Resolved ambiguities** (via `vdd_clarify` + research):

- **"5/5" = TDQS 5.0** (Tool Definition Quality Score, per-tool 1–5, six weighted
  dimensions). The practical gate is **tier A (≥ 3.5)**; 5.0 is the aspirational
  ceiling. Deterministic `mcp-tdqs lint` needs no key; the full `score` needs an
  OpenAI-compatible endpoint or the TDQS hosted API key.
- **"top 5 free MCP registries"** = **Official MCP Registry**, **Glama**,
  **Smithery**, **PulseMCP**, **mcp.so**.

## Overview

Raise the server's tool-definition quality and publish it to the five free
registries so agents can discover and install it. Serves I-006 and I-007.

## User Stories

### Primary

As an agent-consumer, I want every `opencode-workbench` tool to declare clearly
what it does and when to use it (vs its siblings), and I want the server listed in
the registries my client reads, so I can discover and invoke it correctly.

## Boundaries

**Always do:**
- Keep every tool's `purpose`, `usage`, `behavior` and parameter semantics explicit.
- Keep `outputSchema` + `annotations` on every tool (lint requires them).
- Publish the manifest to the official registry before the aggregators re-ingest it.

**Ask first:**
- Submitting to any registry that requires an account or API key (Smithery,
  PulseMCP) or that publishes under the org identity.
- Changing tool names (breaks existing clients).

**Never do:**
- Invent quality scores; only report measured values.
- Commit registry API keys.

## Acceptance Criteria

### AC-1: TDQS lint clean [MUST]
Given the built server
When `npx mcp-tdqs lint --command 'node mcp-server/dist/index.js'` runs in CI
Then it reports **0 errors** (warnings tracked, not gating).

### AC-2: Tool descriptions disambiguate siblings [MUST]
Given every registered tool
When its description is read
Then it states its purpose **and** when to use it versus the neighbouring tools
(addresses TDQS dimensions Purpose Clarity + Usage Guidelines + Disambiguation).

### AC-3: TDQS score recorded [SHOULD]
Given a scorer credential (TDQS hosted `--hosted` or an OpenAI-compatible
`--base-url/--api-key/--model`)
When `mcp-tdqs score` runs against the built server
Then the tier and score are captured in the repo, with a floor of **tier A**.
*(Blocked: no scorer key held by the agent — see blockers.)*

### AC-4: Official registry manifest [MUST]
Given the repository root
Then `server.json` exists, validates against the official schema, and matches the
published npm name/version and the remote `https://opencode-workbench.simonmak.com/mcp`.

### AC-E4: Manifest drift [MUST]
Given `server.json` version ≠ `package.json` version
Then a check fails (drift guard).

### AC-5: Glama listing [MUST]
Given the live deployment
Then `/.well-known/glama.json` serves a claim and the connector is indexed by Glama.

### AC-6: smithery listing [SHOULD]
Given a `SMITHERY_API_KEY`
When `npx @smithery/cli publish` (or the registry API) runs
Then the server appears at smithery.ai. *(Blocked on key.)*

### AC-7: PulseMCP + mcp.so listing [SHOULD]
Given the server is in the official registry
Then it is submitted/claimed at PulseMCP and mcp.so per the runbook.
*(mcp.so auto-crawls GitHub; PulseMCP has a submission form.)*

## Out of Scope

- Paid registries/hosting.
- Rewriting tool behaviour purely to game a score.
- Non-MCP distribution (it is already on npm).

## Non-Functional Requirements

- Registry steps must be reproducible from `docs/publishing/registry-listing.md`.
- No secret values in `server.json` or the runbook.

## Impact Verification

- AC-1, AC-2, AC-3 → I-006.
- AC-4, AC-5, AC-6, AC-7 → I-007.

## Blockers (human-decision / credential)

| Blocker | Needed for | Owner |
|---------|-----------|-------|
| TDQS hosted API key **or** OpenAI-compatible key | AC-3 full score | user |
| `SMITHERY_API_KEY` | AC-6 | user |
| PulseMCP submission account | AC-7 | user |

## S&T Assumptions (Specs → Plan)

**Necessity:** the requirement adds a quality gate and a distribution channel, not
new code paths; the plan is mostly metadata + one description pass.

**Achievability:** lint runs free today (0 errors baseline captured); the manifest
and runbook are pure artifacts; scoring/listing need external credentials.

**Sufficiency:** AC-1/2/4/5 are fully deliverable now; AC-3/6/7 are prepared and
credential-gated.

**Warnings:** do not gate CI on the paid scorer without a key; registry ingestion
lags the manifest by hours-to-days.
