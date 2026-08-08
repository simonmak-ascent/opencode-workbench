# Codespace Workbench

**This is a devcontainer/codespace workstation configuration — not an application.**
There is no root `package.json`, no build system, no test framework, no linter.
Do not run `npm install`, `npm test`, `npm run build`, or similar at repo root — they don't exist.

## Repo structure

- `.devcontainer/setup.sh` — **single source of truth** for workstation automation. Runs on `postCreateCommand`. Installs opencode CLI, npm-global MCP servers, vendored MCPs, Docker containers (Postgres 16, Browserless), and clones `~/esg-hub` and `~/project_human`.
- `opencode.json` — copied to `~/.config/opencode/opencode.json` by setup.sh. 19 MCP servers (18 enabled), all secrets use `{env:VAR}` syntax. If you edit the repo copy, you must manually sync to `~/.config/opencode/` or restart the codespace.
- `vendor/` — vendored MCP servers copied to `~/.local/bin/` at setup.
- `configs/` — reference docs for MCP architecture and shell/git config.
- `docs/` — inventories, secrets map, recovery docs, changelog, operational prompts.
- `.opencode/*` — **gitignored except `skills/`**. Do not create config files there expecting them to be tracked.

## Critical gitignore knowledge

`.opencode/*` is entirely gitignored except `.opencode/skills/`. Agent skills are the only thing tracked under `.opencode/`.

## Common commands (cheatsheet)

```bash
opencode serve --port 4096 --hostname 0.0.0.0   # start the dev server
opencode mcp auth vercel                          # manual Vercel OAuth (required post-setup)
npx playwright install chrome                     # manual step after first codespace creation
bash scripts/backup/run-master-backup.sh          # full backup before risky changes
bash scripts/recovery/validate-recovery.sh        # verify workstation is in good state
```

## Manual post-setup steps

After a fresh codespace, two manual steps are needed:
1. `npx playwright install chrome`
2. `opencode mcp auth vercel` (browser-based OAuth; may fail in non-interactive setup)

Figma MCP requires its HTTP server running: `bash scripts/services/figma-mcp.sh start`

## Key env vars

All secrets originate from Codespaces secrets → `devcontainer.json` `remoteEnv`. `~/.bashrc` also sources `~/.env.workbench` if present (legacy fallback for secrets bootstrap).

| Variable | Value/Note |
|---|---|
| `DATABASE_URL` | `postgres://opencode:opencode@localhost:5432/memory` |
| `BROWSERLESS_HOST/PORT/PROTOCOL` | `localhost:3000/http` |
| `DB_PATH` | `/workspaces/codespace-workbench/.saga/.tracker.db` |
| `DEEPSEEK_API_KEY` | primary model: `deepseek/deepseek-v4-pro` |
| `OPENCODE_API_KEY` | OpenCode Zen + Console Go providers |
| `SIMONPLMAK_CLOUD_PAT` | GitHub MCP (binary) + shadcn MCP |
| `VERCEL_ACCESS_TOKEN`, `OPENROUTER_API_KEY`, `N8N_MCP_ACCESS_TOKEN`, `PERPLEXITY_API_KEY`, `BRAVE_API_KEY`, `FIGMA_TOKEN`, `SENTRY_AUTH_TOKEN`, `KIMI_API_KEY` | respective MCP servers/providers |

## Docker containers (always running)

- `pg-memory` — PostgreSQL 16 on port 5432 (`opencode:opencode@localhost:5432/memory`)
- `browserless` — Headless Chromium on port 3000

If a container is down, recreate it:
```bash
docker rm -f pg-memory && docker run -d --name pg-memory --restart unless-stopped -e POSTGRES_USER=opencode -e POSTGRES_PASSWORD=opencode -e POSTGRES_DB=memory -p 5432:5432 postgres:16-alpine
bash .devcontainer/start-browserless.sh
```

## Available CLI tools

In addition to standard devcontainer tooling, the workstation has:
- **Data**: `pandoc`, `miller` (mlr), `jq`, `csvkit` (csvcut/csvgrep/etc), `sqlite3`, `csvtojson`, `json2csv`
- **Python**: `duckdb`, `polars`, `datasette`, `pyarrow`, `openpyxl`, `xlrd`, `xlsxwriter`, `lxml`, `sqlalchemy`, `tabulate`
- **CLI**: `vercel`, `surreal` (SurrealDB)
- **OpenCode**: `opencode` (aliased as `op`), `opencode serve`

## OpenCode

- Config: `opencode.json` (repo) and `~/.config/opencode/opencode.json` (runtime) — must stay in sync
- Vendored MCP entry points: `~/.local/bin/perplexity-agent-mcp/index.js`, `~/.local/bin/browserless-mcp/dist/index.js`
- Vendored `browserless-mcp` build: `(cd vendor/browserless-mcp && npm run build)` (TypeScript → dist/)
- 28 agent skills in `.opencode/skills/` (see `docs/prompts/prompt-index.md` for usage prompts)
- LSP: enabled (built-in)

## CI

`.github/workflows/validate-docs.yml` and `validate-inventory.yml` validate doc presence and inventory completeness only. No app-level CI — this repo has no application code.

## External repos

- `~/esg-hub` — `mcp-server/` subdirectory with its own build
- `~/project_human` — dist committed, no build needed at clone

## Recovery

Full recovery requires: this repo + Codespaces secrets. See `docs/codespaces-secrets.md` and `docs/recovery-gap-analysis.md`.
