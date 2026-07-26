# Codespace Workbench

**This is a devcontainer/codespace workstation configuration — not an application.**
There is no root `package.json`, no build system, no test framework, no linter, no CI.

## Repo structure

- `.devcontainer/setup.sh` — **single source of truth** for workstation automation. Runs on `postCreateCommand`. Installs opencode CLI, npm-global MCP servers, vendored MCPs (perplexity, browserless), Docker containers (Postgres 16, Browserless), and clones external repos (`esg-hub`, `project_human`).
- `opencode.json` — copied to `~/.config/opencode/opencode.json` by setup.sh. Configures 18 MCP servers (all enabled). All secrets use `{env:VAR}` syntax; never hardcode tokens.
- `vendor/` — vendored MCP servers copied to `~/.local/bin/` at setup.
- `configs/` — reference docs for opencode and MCP architecture.
- `docs/` — comprehensive inventories, secrets map, recovery analysis, changelog.

## Key env vars

| Variable | Source | Used by |
|---|---|---|
| `N8N_MCP_ACCESS_TOKEN` | Codespaces secret → `devcontainer.json` | n8n MCP |
| `SIMONPLMAK_CLOUD_PAT` | `~/.env.workbench` | GitHub MCP, shadcn MCP |
| `PERPLEXITY_API_KEY` | `~/.env.workbench` | Perplexity MCP |
| `BRAVE_API_KEY` | `~/.env.workbench` | Brave Search MCP |
| `OPENAI_API_KEY` | `~/.env.workbench` | (OpenCode model fallback) |
| `DATABASE_URL` | Set in `devcontainer.json` | Postgres MCP (`postgres://opencode:opencode@localhost:5432/memory`) |
| `SENTRY_ACCESS_TOKEN` | `~/.env.workbench` | Sentry MCP |
| `FIGMA_ACCESS_TOKEN` | `~/.env.workbench` | Figma MCP |
| `DEEPSEEK_API_KEY` | `~/.env.workbench` | DeepSeek provider (model: `deepseek/deepseek-v4-pro`) |

Secrets live in `~/.env.workbench`, sourced by `~/.bashrc`. Codespaces secrets propagate via `devcontainer.json` `remoteEnv`.

## Docker containers (always running)

- `pg-memory` — PostgreSQL 16 on port 5432 (`opencode:opencode@localhost:5432/memory`)
- `browserless` — Headless Chromium on port 3000

## OpenCode

- Model: `deepseek/deepseek-v4-pro` (primary), `deepseek/deepseek-v4-pro` (small)
- LSP: enabled (built-in)
- Config at `opencode.json` (project) and `~/.config/opencode/opencode.json` (global) — must stay in sync
- Vendored MCP entry points: `~/.local/bin/perplexity-agent-mcp/index.js`, `~/.local/bin/browserless-mcp/dist/index.js`
- Vendored `browserless-mcp` build: `(cd vendor/browserless-mcp && npm run build)` (TypeScript → dist/)
- No `.opencode/` dir, no custom agents/commands/skills defined

## No CI/CD, no tests, no pre-commit hooks

Do not attempt to run build/test/lint/format at repo root — none exist.

## External repos cloned to `~/`

- `~/esg-hub` — has `mcp-server/` subdirectory with its own build
- `~/project_human` — dist committed, no build needed at clone

## Recovery

Full recovery requires: this repo + Codespaces secrets. See `docs/codespaces-secrets.md` and `docs/recovery-gap-analysis.md`.
