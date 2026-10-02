# OpenCode Runtime Snapshot

> Captured: 2026-10-03
> Purpose: behavioural configuration at this point in time. Counts derive from
> `opencode.json`; live per-server health is not asserted here.

## Active Profile

| Setting | Value |
|---------|-------|
| **Model** | `deepseek/deepseek-v4-pro` |
| **Small Model** | `deepseek/deepseek-v4-flash` |
| **Default agent** | `vdd` |
| **Reasoning** | Enabled (via model capability) |
| **LSP** | Enabled |
| **Formatters** | Not explicitly configured (default) |

## MCP Servers — Configuration Status

| Group | Count | Status |
|-------|-------|--------|
| Remote | 9 | enabled |
| Local | 26 | 24 enabled, 2 disabled |
| **Total** | **35** | **33 enabled** |

Disabled by default: `google-search`, `google-workspace`.

Notes:
- `vercel` authenticates with `VERCEL_ACCESS_TOKEN` (token auth — no OAuth step).
- `sentry`, `stripe`, `cloudflare`, `exa` are remote and gated by their API keys.
- `figma` removed (v0 supersedes it).
- Opt-in add-ons (esg-hub, humanity4ai, saga, surrealdb, ms-365, stripe,
  alibaba-cloud-ops, designlang, difflens, google-*) are dropped from a portable
  clone unless explicitly enabled.

## MCP Tool Surface

The server exposes **9 tools**: `get_workbench_info`, `inspect_target`, `plan_clone`,
`apply_clone`, `verify_clone`, `install_component`, `list_required_credentials`,
`run_auth_flow`, `bootstrap_host`.

## Agent Configuration

- **Default agent**: `vdd` (defined in `opencode.json`).
- **Skills**: 45 in `.opencode/skills/`.
- **Plugins**: `plugins/memory.ts`, `plugins/doc-tools.ts` (+ npm
  `opencode-env-protect`, `opencode-sentry-monitor`).

## Shell Environment (build box)

- **Shell**: bash
- **OpenCode binary**: `~/.opencode/bin/opencode`
- **Node**: 22 (devcontainer image)
- **npm global prefix**: `~/.npm-global`

## Deployment

| Target | Where |
|--------|-------|
| npm | `@simonmak-ascent/opencode-workbench@1.1.2` |
| Hosted (Streamable HTTP) | `https://opencode-workbench.simonmak.com/mcp` |
| Vercel project | `opencode-workbench` (team AP Team) |

## External Repos in Home

| Repo | Path | Purpose |
|------|------|---------|
| esg-hub | `~/esg-hub` | ESG data platform with MCP server |
| project_human | `~/project_human` | Project Human application |
