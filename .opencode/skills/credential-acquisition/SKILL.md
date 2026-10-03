---
name: credential-acquisition
description: Guide and (where possible) automate obtaining the API keys a cloned workbench needs — from instruction-only provider pages to OAuth/CLI flows — without ever handling secret values. Use when opencode reports degraded capabilities, when a clone has an empty ~/.env.workbench, or when the user asks to "get the box working", "set up keys", or "why is MCP X disabled".
license: MIT
compatibility: opencode
metadata:
  domain: operations
  audience: operators
---

# Credential acquisition — instruction → automation

The clone is **value-blind**: it never reads, logs, or transmits secret values.
This skill drives the acquisition of the keys a target still needs, choosing the
most automated method available and degrading to instructions when none exists.

## Ladder (most automatic first)

1. **Already present** — `list_required_credentials` shows the var is present.
   Nothing to do; verify the dependent MCP is enabled.
2. **OAuth / device flow (automated)** — for `OPENCODE_API_KEY` (Zen floor),
   `VERCEL_ACCESS_TOKEN`, and other OAuth MCPs, run the exact command returned by
   `run_auth_flow`, e.g. `opencode auth login` or `opencode mcp auth vercel`.
   The browser/device flow keeps the secret out of the agent.
3. **CLI (automated)** — for GitHub, run `gh auth login` and set
   `SIMONMAK_ASCENT_PAT` (or reuse `gh auth token`).
4. **Assisted paste** — DeepSeek, Brave, Perplexity, Sentry, Firecrawl, Exa:
   open the provider URL returned by `run_auth_flow`, obtain the key, and write
   `NAME=value` into `~/.env.workbench` (mode 600). Never echo the value.
5. **Instruction only** — Azure (ms-365), Google OAuth (google-workspace),
   Stripe restricted keys, Cloudflare tokens, Alibaba RAM keys, PostgreSQL DSN:
   follow the returned steps; these need console/registration work.

## Rules

- **Never print a secret.** Write it straight to the 600-mode env file.
- **Minimum viable:**`OPENCODE_API_KEY` alone makes opencode run on the Zen free
  floor. DeepSeek is preferred but optional.
- After filling keys, re-run `inspect_target` / `list_required_credentials` to
  confirm the var now registers as present, then restart opencode.
- Optional vars (`FRED_API_KEY`, `COMPANIES_HOUSE_API_KEY`, `RESEARCH_CONTACT`)
  only unlock a subset of `primary-sources` tools; they never block the box.

## Tools

- `list_required_credentials` — what is missing and how to get it.
- `run_auth_flow` — the exact URL/command for one credential + presence check.
