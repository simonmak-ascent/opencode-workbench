# SWAS Workbench (SWAS)

**This is the workstation configuration plus the `workbench-mcp` clone tool.**
It is the source of truth for the AliCloud SWAS build box (host name is
operator-specific and lives outside this repo), and it doubles as an MCP server
that clones this configuration onto other Linux machines (see `mcp-server/`).

The root `package.json` exists **only** for `workbench-mcp` (thin launcher:
`bin` → `mcp-server/dist/index.js`, `files`, `prepare` build). It is not an
application: there is no app code outside `mcp-server/`. Builds and tests are
offloaded to a compute box (`cs run "pnpm test"`) or CI — do not run them locally.

## Repo structure

- `mcp-server/` — the `workbench-mcp` MCP server + connector (TypeScript).
  Tools: `inspect_target`, `plan_clone`, `apply_clone`, `verify_clone`,
  `install_component`, `workbench_info`. Local + SSH transports.
  See `mcp-server/README.md` and `docs/architecture/clone-mcp.md`.
- `connector.json` — connector manifest / registration snippet.
- `plugins/` — the `memory.ts` + `doc-tools.ts` OpenCode plugins (portable,
  `$HOME`-relative) referenced by `opencode.json`.
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

# MCP server (workbench-mcp) — verify on a compute box, never locally
cs run "pnpm install && pnpm typecheck && pnpm test && pnpm build"

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
presence and inventory completeness. `secret-scan.yml` (gitleaks) gates every
push/PR. `mcp-server.yml` builds, typechecks and tests the MCP server. There is
no other app-level CI.

## External repos

- `~/esg-hub` / `~/project_human` — synced to SWAS at `/workspaces/<name>` via
  `cs sync` (or pre-cloned); `esg-hub/mcp-server/` and
  `project_human/mcp-servers/` have their own builds.

## Recovery

Full recovery requires: this repo + the SWAS box + secrets in `~/.env.workbench`.
See `docs/recovery/` and `docs/recovery-gap-analysis.md`.
