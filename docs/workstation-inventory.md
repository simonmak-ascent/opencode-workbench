# Workstation Inventory

> Generated: 2026-07-26 | Host: codespace-workbench (Debian 13)

## Repository Structure

```
codespace-workbench/
├── .devcontainer/              # Codespace definition & bootstrap
│   ├── devcontainer.json        # Image, features, ports, env
│   ├── setup.sh                 # Post-create: opencode + MCP + infra
│   └── start-browserless.sh     # Browserless docker launcher
├── .playwright-mcp/            # Runtime artifacts (gitignored)
├── vendor/                     # Custom vendored MCP servers
│   ├── perplexity-agent-mcp/   # Perplexity agent MCP
│   └── browserless-mcp/        # Browserless.io MCP
├── configs/                    # Reference configurations
│   ├── opencode/README.md      # OpenCode settings docs
│   └── mcp/                    # MCP architecture & inventory
├── docs/                       # Documentation
│   ├── prompts/                # Preserved operational prompts
│   ├── backup-reports/         # Dated backup snapshots
│   ├── software-inventory.md   # Installed software catalog
│   ├── CHANGELOG_WORKBENCH.md  # Change history
│   ├── workstation-inventory.md # This file
│   └── home-directory-audit.md # Home directory audit
├── scripts/                    # Automation scripts
│   └── bootstrap-tools.sh      # Data processing tooling
├── backup/                     # Backup directory (empty)
├── opencode.json               # OpenCode config (22 MCP servers)
├── .gitignore                  # Secret & artifact exclusion
└── README.md                   # Architecture & recovery guide
```

## Shell Configuration

| File | Purpose | Key Content |
|------|---------|-------------|
| ~/.bashrc | Bash config | Sources ~/.env.workbench, adds ~/.opencode/bin to PATH |
| ~/.profile | Login profile | Sources ~/.bashrc, adds ~/bin, ~/.local/bin to PATH |
| ~/.zshrc | Zsh config | Oh My Zsh, devcontainers theme, git plugin |
| ~/.zprofile | Zsh login | Sources ~/.profile |
| ~/.npmrc | npm config | prefix=/home/node/.npm-global |
| ~/.gitignore | Global gitignore | node_modules, .DS_Store, .vscode, etc. |

## Installed Software

See `docs/software-inventory.md` for the full catalog.

### Core
- Debian 13, Node.js 22.23.1, Python 3.13.5
- Docker 29.6.2, Git 2.55.0
- OpenCode 1.18.5, Claude Code 2.1.220

### CLI Tools
- Vercel CLI 57.0.0, SurrealDB CLI 3.2.3, GitHub CLI 2.96.0

### Data Processing
- Pandoc 3.1.11.1, jq 1.7.1, Miller 6.13.0
- csvkit 2.2.0, DuckDB 1.5.5, Polars 1.43.0
- Datasette 0.65.2, SQLAlchemy 2.0.51

### MCP Servers
- 22 total: 5 remote, 1 local binary, 11 npm global, 2 vendored, 4 disabled
- See `configs/mcp/README.md` for full architecture

## Home Directory Projects

| Directory | Type | Repository |
|-----------|------|-----------|
| ~/esg-hub/ | Git repo | github.com/simonplmak-cloud/esg-hub |
| ~/project_human/ | Git repo | github.com/humanity4ai/project_human |

## Infrastructure (Docker)

| Container | Image | Port | Purpose |
|-----------|-------|------|---------|
| pg-memory | postgres:16-alpine | 5432 | OpenCode local memory store |
| browserless | ghcr.io/browserless/chromium | 3000 | Headless browser automation |

## Secrets Map

> All secrets stored in GitHub Codespaces Secrets, NOT in this repo.

| Secret | Consumers |
|--------|-----------|
| SIMONPLMAK_CLOUD_PAT | github MCP, shadcn MCP |
| PERPLEXITY_API_KEY | perplexity MCP |
| BRAVE_API_KEY | brave-search MCP |
| BROWSERLESS_TOKEN | browserless MCP + docker |
| KIMI_API_KEY | OpenCode LLM (kimi-for-coding/k3) |
| FIGMA_ACCESS_TOKEN | figma MCP |
| SENTRY_ACCESS_TOKEN | sentry MCP |
| DATABASE_URL | postgres MCP |
| SURREAL_* | surrealdb MCP (optional) |
| WCAGC_MCP_KEY | wcagc MCP (optional) |
| CONVERTICA_API_KEY | convertica MCP (optional) |
