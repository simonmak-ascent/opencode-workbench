# OpenCode Runtime Configuration

**Generated:** 2026-07-27
**OpenCode Version:** 1.18.5

---

## Config Loading Order

From log analysis, OpenCode loads configs in this order:
1. `/home/node/.config/opencode/config.json` — not found (logged but doesn't exist)
2. `/home/node/.config/opencode/opencode.json` — **global config (primary)**
3. `/home/node/.config/opencode/opencode.jsonc` — not found
4. `/workspaces/workbench/opencode.json` — **project config (identical to global)**
5. `/workspaces/workbench/.opencode/opencode.json` — not found
6. `/workspaces/workbench/.opencode/opencode.jsonc` — not found
7. `/home/node/.opencode/opencode.json` — not found
8. `/home/node/.opencode/opencode.jsonc` — not found

**Note:** The project config and global config are byte-identical. The project config at `/workspaces/workbench/opencode.json` is the effective config. The global config at `~/.config/opencode/opencode.json` is a copy.

---

## Provider Configuration

### DeepSeek (primary)

```json
{
  "name": "DeepSeek",
  "api": "https://api.deepseek.com/v1",
  "env": ["DEEPSEEK_API_KEY"],
  "options": {
    "apiKey": "{env:DEEPSEEK_API_KEY}"
  }
}
```

**Status:** `DEEPSEEK_API_KEY` is set (16 chars, valid format `sk-...`).

### Models

| Model ID | Role | Reasoning | Context Limit | Output Limit | Input Cost | Output Cost |
|---|---|---|---|---|---|---|
| `deepseek-v4-pro` | primary, small | Yes | 1,048,576 | 393,216 | $0.000435 | $0.00087 |
| `deepseek-v4-flash` | — | Yes | 1,048,576 | 393,216 | $0.00014 | $0.00028 |

**Model wiring:**
- `model`: `deepseek/deepseek-v4-pro`
- `small_model`: `deepseek/deepseek-v4-pro` (same as primary)
- LLM runtime: `ai-sdk`

### Hidden Provider: opencode-go

Found in `auth.json` but NOT declared in config. This provider was used in prior sessions and its API key is hardcoded:
```json
{
  "opencode-go": {
    "type": "api",
    "key": "sk-REDACTED"
  }
}
```
Log evidence of usage: `Error from provider (Console Go): Upstream request failed` (2026-07-26T18:03:16). Cleaned in commit f682d5f — `auth.json` is now empty.

---

## Plugin Configuration

**Plugin array:** `[]` — no plugins declared (17 removed in commit `f682d5f`).

**Only installed package:** `@opencode-ai/plugin@1.18.5`
**Plugin directory:** `~/.config/opencode/node_modules/`
**Skills directory:** `/workspaces/workbench/.opencode/skills/` (28 skills)

---

## LSP Configuration

`lsp: true` — 37 LSP servers enabled:
zls, yaml-ls, vue, typescript, tinymist, texlab, terraform, svelte, sourcekit-lsp, rust, ruby-lsp, razor, pyright, prisma, php intelephense, oxlint, ocaml-lsp, nixd, lua-ls, kotlin-ls, julials, jdtls, haskell-language-server, gopls, gleam, fsharp, elixir-ls, eslint, dockerfile, deno, dart, clojure-lsp, clangd, csharp, biome, bash, astro

---

## Other Settings

| Setting | Value |
|---|---|
| `formatter` | true |
| `lsp` | true |
| File watcher | inotify (Linux) |
| Shell for tools | `/bin/bash` |
| Project snapshot | Git-based |
| DB cleanup | 7-day prune |
| `--pure` flag | Skips external plugins |

---

## Environment Variables

| Variable | Set? | Used By |
|---|---|---|
| `DEEPSEEK_API_KEY` | Yes | DeepSeek provider |
| `SIMONPLMAK_CLOUD_PAT` | Yes | GitHub MCP, shadcn MCP |
| `PERPLEXITY_API_KEY` | Yes | Perplexity MCP |
| `BRAVE_API_KEY` | Yes | Brave Search MCP |
| `DATABASE_URL` | Yes | Postgres MCP |
| `SENTRY_AUTH_TOKEN` | Yes | Sentry MCP |
| `FIGMA_TOKEN` | Yes | Figma MCP |
| `BROWSERLESS_HOST` | Yes | Browserless MCP |
| `BROWSERLESS_PORT` | Yes | Browserless MCP |
| `BROWSERLESS_TOKEN` | Yes | Browserless MCP |
| `BROWSERLESS_PROTOCOL` | Yes | Browserless MCP |
| `DB_PATH` | **YES** | saga MCP |
| `WAKATIME_API_KEY` | **NO** | opencode-wakatime plugin |

---

## Data Stores

| Path | Size | Status |
|---|---|---|
| `~/.local/share/opencode/opencode.db` | 61MB | Integrity OK |
| `~/.local/share/opencode/opencode.db-wal` | 4.3MB | Active WAL |
| `~/.local/share/opencode/opencode.db-shm` | 32KB | Shared memory |
| `~/.local/share/opencode/log/opencode.log` | 853KB | Logging normally |
| `~/.local/share/opencode/auth.json` | 126B | Contains hardcoded key |
| `~/.local/share/opencode/mcp-auth.json` | 299B | Vercel OAuth state |

---

## Docker Containers

| Container | Status | Ports |
|---|---|---|
| `pg-memory` | Running | 5432 (Postgres 16) |
| `browserless` | Running | 3000 (Headless Chromium) |
