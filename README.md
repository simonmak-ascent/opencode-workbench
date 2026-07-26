# Codespace Workbench

A pre-configured GitHub Codespaces workstation for AI-assisted development
with OpenCode and MCP servers. The workbench provisions a Node.js environment
with OpenCode, Vercel CLI, SurrealDB CLI, and a full suite of MCP servers
installed globally — ready the moment your Codespace boots.

## Purpose

This repository is the **single source of truth** for a fully reproducible
cloud development workstation. Everything needed to rebuild from scratch is
versioned here.

- Eliminate manual setup on every new Codespace.
- Keep toolchain and MCP server versions in one place under version control.

## Architecture

```
codespace-workbench/
├── .devcontainer/          # Codespace definition & bootstrap
│   ├── devcontainer.json   # Container image, features, ports
│   ├── setup.sh            # Post-create: installs opencode, MCPs, infra
│   └── start-browserless.sh
├── vendor/                 # Custom vendored MCP servers
│   ├── perplexity-agent-mcp/
│   └── browserless-mcp/
├── configs/                # Reference configurations
│   ├── opencode/           # OpenCode settings
│   └── mcp/                # MCP server inventory & architecture
├── docs/                   # Documentation
│   ├── prompts/            # Preserved operational prompts
│   ├── backup-reports/     # Dated backup snapshots
│   ├── software-inventory.md
│   ├── workstation-inventory.md
│   ├── home-directory-audit.md
│   └── CHANGELOG_WORKBENCH.md
├── scripts/                # Automation scripts
│   └── bootstrap-tools.sh
├── opencode.json           # OpenCode configuration (copied global by setup)
└── README.md
```

## One-time setup

1. **Create the Codespace**:

   ```bash
   gh codespace create --repo simonplmak-cloud/codespace-workbench --machine basicLinux32gb
   ```

   Recommended machine: 4-core (`basicLinux32gb`).

2. **Wait for postCreate** (~3-5 min first time — installs opencode, MCP
   servers, playwright chromium, starts Postgres + Browserless containers).

3. **Secrets** — configure via GitHub Codespaces Secrets (Settings → Codespaces → Secrets):

   | Secret | Used by |
   |---|---|
   | `SIMONPLMAK_CLOUD_PAT` | github MCP, shadcn MCP |
   | `PERPLEXITY_API_KEY` | perplexity MCP |
   | `BRAVE_API_KEY` | brave-search MCP |
   | `BROWSERLESS_TOKEN` | browserless MCP + container |
   | `KIMI_API_KEY` | LLM (Kimi K3) |
   | `N8N_MCP_ACCESS_TOKEN` | n8n MCP (access token, replaces OAuth) |
   | `FIGMA_ACCESS_TOKEN` | figma MCP |
   | `SENTRY_ACCESS_TOKEN` | sentry MCP |
   | `CONVERTICA_API_KEY` | convertica MCP (optional) |
   | `WCAGC_MCP_KEY` | wcagc MCP (optional) |
   | `SURREAL_ENDPOINT` / `SURREAL_USERNAME` / `SURREAL_PASSWORD` / `SURREAL_NAMESPACE` / `SURREAL_DATABASE` | surrealdb MCP (optional) |

## What's inside

- opencode CLI (Kimi K3 default model)
- 22 MCP servers (19 active, 3 disabled opt-in)
- Postgres 16 (Docker, db `memory`) + Browserless chromium (Docker)
- Data processing toolkit: pandoc, miller, csvkit, duckdb, polars, datasette, jq, SQLite
- CLI tools: Vercel CLI, SurrealDB CLI, GitHub CLI

## Daily use

**Attach the desktop app:**

```bash
opencode serve --port 4096 --hostname 0.0.0.0
```

Then: Settings → Server → `https://<codespace-name>-4096.app.github.dev`

**Or use the TUI:**

```bash
opencode
```

## Recovery

If this Codespace is permanently deleted:

1. Create a new Codespace from this repo:
   ```bash
   gh codespace create --repo simonplmak-cloud/codespace-workbench --machine basicLinux32gb
   ```
2. Ensure GitHub Codespaces Secrets are configured (see table above)
3. Wait for postCreate (~3-5 min)
4. The environment is fully restored — no manual steps needed

## Backup

All reproducible state is versioned in this repo:
- `.devcontainer/` — infrastructure as code
- `vendor/` — custom MCP source
- `configs/` — reference configurations
- `docs/` — documentation and prompts
- `opencode.json` — OpenCode settings

Secrets are stored in GitHub Codespaces Secrets, **never in this repo**.

## Security Model

- `opencode.json` references secrets via `{env:VARIABLE}` syntax — no values stored
- `.gitignore` blocks `.env*`, credentials, keys, and certificates
- Secrets are injected by GitHub Codespaces as environment variables
- See `.devcontainer/setup.sh` for the runtime bootstrap flow

## Prompt Management

Operational prompts are preserved in `docs/prompts/`:
- `prompt-index.md` — catalog of all preserved prompts
- Each prompt file includes: purpose, usage, author, modification date

Prompt updates are tracked in `docs/CHANGELOG_WORKBENCH.md`.

## MCP Architecture

See `configs/mcp/`:
- `README.md` — server categories, secrets mapping, adding new servers
- `mcp-inventory.json` — machine-readable server inventory

## Adding Repositories

```bash
gh repo clone <owner>/<repo>
cd <repo> && opencode
```

The global `~/.config/opencode/opencode.json` applies everywhere; project configs override.
