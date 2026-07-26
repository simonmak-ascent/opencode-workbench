# Codespace Workbench

A pre-configured GitHub Codespaces workstation for AI-assisted development
with OpenCode and MCP servers. Fully reproducible, secure, documented,
and version-controlled.

## Purpose

This repository is the **single source of truth** for a fully reproducible
cloud development workstation. Everything needed to rebuild from scratch is
versioned here.

- Eliminate manual setup on every new Codespace.
- Keep toolchain and MCP server versions in one place under version control.
- Survive total Codespace deletion — recreate from repo + secrets alone.

## Architecture

```
codespace-workbench/
├── .devcontainer/              # Codespace definition & bootstrap
│   ├── devcontainer.json        # Container image, features, ports, env
│   ├── setup.sh                 # Post-create: installs opencode, MCPs, infra
│   ├── setup-workbench.sh       # Legacy (superseded by setup.sh)
│   ├── aliases.sh               # Shell aliases sourced at runtime
│   └── start-browserless.sh     # Browserless docker launcher
├── vendor/                     # Custom vendored MCP servers
│   ├── perplexity-agent-mcp/    # Perplexity Agent API wrapper
│   └── browserless-mcp/         # Browserless.io automation
├── configs/                    # Reference configurations
│   ├── opencode/README.md       # OpenCode settings docs
│   └── mcp/                     # MCP server inventory & architecture
├── docs/                       # Documentation
│   ├── prompts/                 # Preserved operational prompts
│   │   ├── prompt-index.md      # Catalog of all preserved prompts
│   │   ├── software-bootstrap.md
│   │   └── workstation-preservation.md
│   ├── backup-reports/          # Dated backup snapshots
│   ├── software-inventory.md    # Installed software with versions
│   ├── workstation-inventory.md # Machine state inventory
│   ├── home-directory-audit.md  # ~/ files classified by action
│   ├── environment-inventory.md # Environment variable map
│   ├── codespaces-secrets.md    # Secrets management & recovery
│   ├── recovery-gap-analysis.md # Disaster recovery gaps & scores
│   └── CHANGELOG_WORKBENCH.md   # Change history
├── scripts/                    # Automation scripts
│   └── bootstrap-tools.sh       # Data processing tooling
├── opencode.json               # OpenCode configuration (22 MCP servers)
├── .gitattributes              # Git line-ending & binary config
├── .gitignore                   # Secret & artifact exclusion
└── README.md                    # This file
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

- **OpenCode CLI** (v1.18.5, Kimi K3 default model)
- **22 MCP servers** (19 active, 3 disabled opt-in) — see `configs/mcp/`
- **Postgres 16** (Docker, db `memory`) + **Browserless chromium** (Docker)
- **Data processing**: pandoc, miller, csvkit, duckdb, polars, datasette, jq, SQLite
- **CLI tools**: GitHub CLI 2.96.0
- See `docs/software-inventory.md` for complete catalog with versions

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

## Disaster Recovery

**Assume the entire Codespace is deleted.** Only git repos and GitHub
Codespaces Secrets survive.

### Recovery Steps

1. **Create Codespace**:
   ```bash
   gh codespace create --repo simonplmak-cloud/codespace-workbench --machine basicLinux32gb
   ```

2. **Ensure secrets** are configured in GitHub Codespaces Secrets (see table above).

3. **Wait for postCreate** (~3-5 min) — everything installs automatically:
   - OpenCode CLI
   - 18 npm MCP server packages
   - 2 vendored MCP servers
   - github-mcp-server binary
   - Playwright Chromium
   - Postgres + Browserless Docker containers
   - Data processing tooling
   - OpenCode config copied to `~/.config/opencode/opencode.json`

4. **Verify**:
   ```bash
   opencode --version
   docker ps  # should show pg-memory and browserless
   ```

5. **Post-recovery (one-time)**:
   ```bash
   opencode mcp auth vercel   # Interactive OAuth for Vercel MCP
   ```

### Recovery Score: 89/100

See `docs/recovery-gap-analysis.md` for detailed gap analysis.

## Backup

All reproducible state is versioned in this repo:
- `.devcontainer/` — infrastructure as code
- `vendor/` — custom MCP source
- `configs/` — reference configurations
- `docs/` — documentation, prompts, backup snapshots
- `opencode.json` — OpenCode settings

Secrets are stored in GitHub Codespaces Secrets, **never in this repo**.

## Security Model

- `opencode.json` references secrets via `{env:VARIABLE}` syntax — no values stored
- `.gitignore` blocks `.env*`, `credentials*`, `secrets*`, keys, and certificates
- `.gitattributes` prevents line-ending and binary file issues
- Secrets are injected by GitHub Codespaces as environment variables
- Periodic repository security scans confirm no secrets leaked
- See `.devcontainer/setup.sh` for the runtime bootstrap flow

## Documentation Index

| Document | Content |
|----------|---------|
| `docs/software-inventory.md` | Complete installed software catalog with versions |
| `docs/workstation-inventory.md` | Machine state, shell config, dotfiles inventory |
| `docs/environment-inventory.md` | All env vars with purposes and sources |
| `docs/codespaces-secrets.md` | Secrets names, dependencies, recovery methods |
| `docs/home-directory-audit.md` | `~/` file classification (source control / secret / cache) |
| `docs/recovery-gap-analysis.md` | Disaster recovery gaps and scores |
| `docs/CHANGELOG_WORKBENCH.md` | Workstation change history |
| `configs/opencode/README.md` | OpenCode configuration details |
| `configs/mcp/README.md` | MCP server architecture, auth, categories |

## MCP Architecture

See `configs/mcp/`:
- `README.md` — server categories, secrets mapping, adding new servers
- `mcp-inventory.json` — machine-readable server inventory

**22 MCP servers:**
- 5 remote (context7, gh_grep, n8n, clerk, vercel)
- 1 local binary (github-mcp-server)
- 11 npm global (brave-search, postgres, playwright, shadcn, echarts, mermaid, saga, swagger-testcase, design-system, figma, sentry)
- 2 vendored (perplexity, browserless)
- 3 disabled (surrealdb, wcagc, convertica — need secrets)

## Adding Tools

1. **npm global package**: Add to `.devcontainer/setup.sh` npm install section
2. **Vendored MCP**: Add source to `vendor/`, copy to `~/.local/bin/` in setup.sh
3. **Binary**: Add download URL to `.devcontainer/setup.sh`
4. **apt package**: Add to `scripts/bootstrap-tools.sh`
5. **pip package**: Add to `scripts/bootstrap-tools.sh`

After adding:
- Update `docs/software-inventory.md` with version and purpose
- If auth required: update secrets tables in README and `docs/codespaces-secrets.md`
- Update `docs/CHANGELOG_WORKBENCH.md`

## Adding Repositories

```bash
gh repo clone <owner>/<repo>
cd <repo> && opencode
```

The global `~/.config/opencode/opencode.json` applies everywhere; project configs override.

## Prompt Management

Operational prompts are preserved in `docs/prompts/`:
- `prompt-index.md` — catalog of all preserved prompts
- Each prompt file includes: purpose, usage, author, modification date
- Prompt updates are tracked in `docs/CHANGELOG_WORKBENCH.md`
