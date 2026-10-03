# OpenCode Workbench (opencode-workbench)

**This is the workstation configuration plus the `opencode-workbench` clone tool.**
It is the source of truth for the AliCloud SWAS build box — the tested platform; any Linux box works (host name is
operator-specific and lives outside this repo), and it doubles as an MCP server
that clones this configuration onto other Linux machines (see `mcp-server/`).

The root `package.json` exists **only** for `opencode-workbench` (thin launcher:
`bin` → `mcp-server/dist/index.js`, `files`, `prepare` build). It is not an
application: there is no app code outside `mcp-server/`. Builds and tests are
offloaded to a compute box (`cs run "pnpm test"`) or CI — do not run them locally.

## Repo structure

- `mcp-server/` — the `opencode-workbench` MCP server + connector (TypeScript).
  Tools: `describe_workbench`, `inspect_target`, `plan_clone`, `apply_clone`,
  `verify_clone`, `install_component`, `remove_component`, `update_component`,
  `list_required_credentials`, `run_auth_flow`, `provision_host`.
  Local + SSH transports.
  See `mcp-server/README.md` and `docs/architecture/clone-mcp.md`.
- `connector.json` — connector manifest / registration snippet.
- `plugins/` — the `memory.ts` + `doc-tools.ts` OpenCode plugins (portable,
  `$HOME`-relative) referenced by `opencode.json`.
- `.devcontainer/setup.sh` — the devcontainer/build box automation (legacy path).
  The build box is provisioned by the equivalent manual steps documented here
  (opencode CLI, npm-global MCP servers, vendored MCPs, Docker containers,
  toolchain) — see `docs/architecture/workstation-playbook.md`.
- `opencode.json` — the canonical workbench config: 35 MCP servers (33 enabled,
  2 disabled: `google-search`, `google-workspace`), all secrets
  use `{env:VAR}` syntax. Copied to both `/workspaces/workbench/`
  (project config) and `~/.config/opencode/opencode.json` (global) on the build box.
  If you edit the repo copy, re-sync both.
- `vendor/` — vendored MCP source (perplexity-agent-mcp, browserless-mcp).
- `configs/` — reference docs for MCP architecture and shell/git config.
- `docs/` — inventories, secrets map, recovery docs, changelog, operational prompts.
- `.opencode/*` — **gitignored except `skills/`**. Agent skills are the only
  thing tracked under `.opencode/`.

## Common commands (cheatsheet)

```bash
# Local thin client → build box
cs host                                          # set the active box once
cs run "pnpm typecheck && pnpm test"             # sync + run on the build box (no `check` script)
cs provision                                     # sync + install deps on the build box
cs ssh "<cmd>"                                   # raw command on the build box

# MCP server (opencode-workbench) — verify on a compute box, never locally
cs run "pnpm install && pnpm typecheck && pnpm test && pnpm build"

# On the build box itself
opencode serve --port 4096 --hostname 0.0.0.0    # start the dev server
bash scripts/backup/run-master-backup.sh          # full backup before risky changes
bash scripts/recovery/validate-recovery.sh        # verify workstation is in good state
```

## Key env vars (build box `~/.env.workbench`)

| Variable | Value/Note |
|---|---|
| `DATABASE_URL` | `postgres://opencode:opencode@localhost:5432/memory` |
| `BROWSERLESS_HOST/PORT/PROTOCOL` | `localhost:3000/http` |
| `DB_PATH` | `/workspaces/opencode-workbench/.saga/.tracker.db` |
| `DEEPSEEK_API_KEY` | primary model: `deepseek/deepseek-v4-pro` |
| `OPENCODE_API_KEY` | OpenCode Zen + Console Go providers |
| `SIMONMAK_ASCENT_PAT` | GitHub MCP (binary) + shadcn MCP + `gh` auth |
| `NPM_TOKEN` | GitHub Packages (`@simonmak-ascent`) — same PAT |
| `VERCEL_ACCESS_TOKEN`, `PERPLEXITY_API_KEY`, `BRAVE_API_KEY`, `SENTRY_AUTH_TOKEN`, `MOONSHOT_API_KEY`, `SURREAL_*`, `ALIBABA_CLOUD_*`, `AZURE_*`, `STRIPE_SECRET_KEY` | respective MCP servers/providers |

## Docker containers (always running on the build box)

- `pg-memory` — PostgreSQL 16 on port 5432 (`opencode:opencode@localhost:5432/memory`)
- `browserless` — Headless Chromium on port 3000

If a container is down, recreate it:
```bash
docker rm -f pg-memory && docker run -d --name pg-memory --restart unless-stopped -e POSTGRES_USER=opencode -e POSTGRES_PASSWORD=opencode -e POSTGRES_DB=memory -p 5432:5432 postgres:16-alpine
bash .devcontainer/start-browserless.sh
```

## Available CLI tools (build box)

- **Toolchain**: `node` 22, `corepack`/`pnpm`, `uv` + Python 3.11, `rsync`, `gcc-c++`
- **CLI**: `gh`, `vercel`, `opencode` (aliased as `op`), `opencode serve`
- **Playwright**: chromium (headless shell) + RHEL system libs
- **Sandbox**: `opencode-sandbox` (bubblewrap) — run OpenCode with a read-only system, a writable workspace, and no access to `~/.ssh` or `~/.env.workbench`; installed by the optional `sandbox` component (`scripts/sandbox/opencode-sandbox.sh`)

## OpenCode

- Config: `opencode.json` (repo, canonical) and `~/.config/opencode/opencode.json`
  (runtime) — must stay in sync.
- Vendored MCP entry points: `~/.local/bin/perplexity-agent-mcp/index.js`,
  `~/.local/bin/browserless-mcp/dist/index.js` (on the build box: `/home/node/.local/bin/`).
- Model `deepseek/deepseek-v4-pro` (small: `deepseek/deepseek-v4-flash`);
  `default_agent` is `vdd` (the only subagent defined in `opencode.json`).
- 45 repo skills in `.opencode/skills/`; global skills live under
  `~/.config/opencode/skills/` (not this repo).
- Plugins: `./plugins/memory.ts` + `./plugins/doc-tools.ts` (plus npm
  `opencode-env-protect`, `opencode-sentry-monitor`).
- LSP: enabled (built-in).

## CI

`.github/workflows/validate-docs.yml` and `validate-inventory.yml` validate doc
presence and inventory completeness. `secret-scan.yml` (gitleaks) gates every
push/PR. `mcp-server.yml` builds, typechecks and tests the MCP server. There is
no other app-level CI.

## External repos

- `~/esg-hub` / `~/project_human` — synced to the build box at `/workspaces/<name>` via
  `cs sync` (or pre-cloned); `esg-hub/mcp-server/` and
  `project_human/mcp-servers/` have their own builds.

## Recovery

Full recovery requires: this repo + the build box + secrets in `~/.env.workbench`.
See `docs/recovery/` and `docs/recovery-gap-analysis.md`.
