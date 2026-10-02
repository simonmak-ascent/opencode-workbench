# SWAS Workbench (SWAS)

**This is the workstation configuration — not an application.** It is the
source of truth for the AliCloud SWAS build box (host name is operator-specific
and lives outside this repo), which replaced the SWAS box as the cloud dev environment. There is no root `package.json`,
no build system, no test framework, no linter. Do not run `npm install`,
`npm test`, `npm run build`, or similar at repo root — they don't exist.

## Repo structure

- `.devcontainer/setup.sh` — the devcontainer/SWAS automation (legacy path).
  The SWAS box is provisioned by the equivalent manual steps documented here
  (opencode CLI, npm-global MCP servers, vendored MCPs, Docker containers,
  toolchain) — see `docs/architecture/workstation-playbook.md`.
- `opencode.json` — the canonical workbench config: 30 MCP servers, all secrets
  use `{env:VAR}` syntax. Copied to both `/workspaces/workbench/`
  (project config) and `~/.config/opencode/opencode.json` (global) on SWAS.
  If you edit the repo copy, re-sync both.
- `vendor/` — vendored MCP source (perplexity-agent-mcp, browserless-mcp).
- `configs/` — reference docs for MCP architecture and shell/git config.
- `docs/` — inventories, secrets map, recovery docs, changelog, operational prompts.
- `.opencode/*` — **gitignored except `skills/`**. Agent skills are the only
  thing tracked under `.opencode/`.

## Common commands (cheatsheet)

```bash
# Local thin client → SWAS
cs host                                          # workbench (set once)
cs run "pnpm check && pnpm test"                 # sync + run on SWAS
cs provision                                     # sync + install deps on SWAS
cs ssh "<cmd>"                                   # raw command on SWAS

# On the SWAS box itself
opencode serve --port 4096 --hostname 0.0.0.0    # start the dev server
bash scripts/backup/run-master-backup.sh          # full backup before risky changes
bash scripts/recovery/validate-recovery.sh        # verify workstation is in good state
```

## Key env vars (SWAS `~/.env.workbench`)

| Variable | Value/Note |
|---|---|
| `DATABASE_URL` | `postgres://opencode:opencode@localhost:5432/memory` |
| `BROWSERLESS_HOST/PORT/PROTOCOL` | `localhost:3000/http` |
| `DB_PATH` | `/workspaces/workbench/.saga/.tracker.db` |
| `DEEPSEEK_API_KEY` | primary model: `deepseek/deepseek-v4-pro` |
| `OPENCODE_API_KEY` | OpenCode Zen + Console Go providers |
| `SIMONPLMAK_CLOUD_PAT` | GitHub MCP (binary) + shadcn MCP + `gh` auth |
| `NPM_TOKEN` | GitHub Packages (`@simonplmak-cloud`) — same PAT |
| `VERCEL_ACCESS_TOKEN`, `PERPLEXITY_API_KEY`, `BRAVE_API_KEY`, `SENTRY_AUTH_TOKEN`, `MOONSHOT_API_KEY`, `SURREAL_*`, `ALIBABA_CLOUD_*`, `AZURE_*`, `STRIPE_SECRET_KEY` | respective MCP servers/providers |

## Docker containers (always running on SWAS)

- `pg-memory` — PostgreSQL 16 on port 5432 (`opencode:opencode@localhost:5432/memory`)
- `browserless` — Headless Chromium on port 3000

If a container is down, recreate it:
```bash
docker rm -f pg-memory && docker run -d --name pg-memory --restart unless-stopped -e POSTGRES_USER=opencode -e POSTGRES_PASSWORD=opencode -e POSTGRES_DB=memory -p 5432:5432 postgres:16-alpine
bash .devcontainer/start-browserless.sh
```

## Available CLI tools (SWAS)

- **Toolchain**: `node` 22, `corepack`/`pnpm`, `uv` + Python 3.11, `rsync`, `gcc-c++`
- **CLI**: `gh`, `vercel`, `opencode` (aliased as `op`), `opencode serve`
- **Playwright**: chromium (headless shell) + RHEL system libs

## OpenCode

- Config: `opencode.json` (repo, canonical) and `~/.config/opencode/opencode.json`
  (runtime) — must stay in sync.
- Vendored MCP entry points: `~/.local/bin/perplexity-agent-mcp/index.js`,
  `~/.local/bin/browserless-mcp/dist/index.js` (on SWAS: `/home/node/.local/bin/`).
- 48 global skills (`~/.config/opencode/skills/`) + repo skills in
  `.opencode/skills/`; 4 subagents; plugins `memory.ts` + `doc-tools.ts`.
- LSP: enabled (built-in).

## CI

`.github/workflows/validate-docs.yml` and `validate-inventory.yml` validate doc
presence and inventory completeness only. No app-level CI — this repo has no
application code.

## External repos

- `~/esg-hub` / `~/project_human` — synced to SWAS at `/workspaces/<name>` via
  `cs sync` (or pre-cloned); `esg-hub/mcp-server/` and
  `project_human/mcp-servers/` have their own builds.

## Recovery

Full recovery requires: this repo + the SWAS box + secrets in `~/.env.workbench`.
See `docs/recovery/` and `docs/recovery-gap-analysis.md`.
