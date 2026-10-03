# Acquire Keys

**Purpose:** Take a freshly-cloned workbench from "boots, degraded" to "fully enabled" by acquiring the credentials it needs, best-effort — from instructions to automation.

**When To Use:** After `apply_clone`, when opencode reports `degraded` capabilities, or when a dependent MCP is disabled for a missing env var.

---

## Procedure

1. **See what's missing** (value-blind):
   ```
   list_required_credentials { target }
   ```
   Returns each var: present/missing, label, purpose, provider URL, method
   (`paste` | `oauth` | `cli` | `instruction`) and the exact `command`.

2. **Automate where possible** (OAuth / CLI):
   ```
   run_auth_flow { target, var: "OPENCODE_API_KEY" }   # -> opencode auth login
   run_auth_flow { target, var: "VERCEL_ACCESS_TOKEN" } # -> opencode mcp auth vercel
   run_auth_flow { target, var: "SIMONMAK_ASCENT_PAT" } # -> gh auth login
   ```
   Run the returned command. Interactive flows are run by the user/agent, never
   by the MCP (which stays value-blind).

3. **Paste the rest**: DeepSeek, Brave, Perplexity, Sentry, Firecrawl, Exa →
   open the returned URL, then append `NAME=value` to `~/.env.workbench` and
   `chmod 600 ~/.env.workbench`. Never echo the value.

4. **Verify**: re-run `list_required_credentials`; the var should now show
   `present: true`. Restart opencode so `{env:VAR}` resolves.

## Floor

`OPENCODE_API_KEY` alone is enough — opencode runs on the OpenCode Zen free
model and every keyless MCP works. Everything else is optional uplift.
