# Workstation Inventory

> Generated: 2026-07-26 | Host: codespace-workbench (Debian 13)

## Repository Structure

```
codespace-workbench/
├── .devcontainer/              # Codespace definition & bootstrap
│   ├── devcontainer.json        # Image, features, ports, env
│   ├── setup.sh                 # Post-create: opencode + MCP + infra
│   ├── setup-workbench.sh       # Legacy (superseded by setup.sh)
│   ├── aliases.sh               # Shell aliases
│   └── start-browserless.sh     # Browserless docker launcher
├── .gitattributes              # Git line-ending & binary config
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
│   ├── workstation-inventory.md # This file
│   ├── home-directory-audit.md # Home directory audit
│   ├── environment-inventory.md # Environment variable map
│   ├── codespaces-secrets.md   # Secrets management
│   ├── recovery-gap-analysis.md # Disaster recovery gaps
│   └── CHANGELOG_WORKBENCH.md  # Change history
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

## Aliases (devcontainer/aliases.sh)

| Alias | Command |
|-------|---------|
| ll | ls -lah |
| gs | git status |
| op | opencode |
| workspaces | cd /workspaces |

## Installed Software

See `docs/software-inventory.md` for the full catalog with exact versions.

### Core
- Debian 13, Node.js 22.23.1, Python 3.13.5
- Docker 29.6.2, Git 2.55.0
- OpenCode 1.18.5

### MCP Servers
- 22 total: 5 remote, 1 local binary, 11 npm global, 2 vendored, 3 disabled
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
> See `docs/codespaces-secrets.md` for full details.

| Secret | Consumers |
|--------|-----------|
| SIMONPLMAK_CLOUD_PAT | github MCP, shadcn MCP |
| PERPLEXITY_API_KEY | perplexity MCP |
| BRAVE_API_KEY | brave-search MCP |
| BROWSERLESS_TOKEN | browserless MCP + docker |
| KIMI_API_KEY | OpenCode LLM (kimi-for-coding/k3) |
| FIGMA_ACCESS_TOKEN | figma MCP |
| SENTRY_ACCESS_TOKEN | sentry MCP |
| N8N_MCP_ACCESS_TOKEN | n8n MCP |
| DATABASE_URL | postgres MCP |
| SURREAL_* | surrealdb MCP (optional) |
| WCAGC_MCP_KEY | wcagc MCP (optional) |
| CONVERTICA_API_KEY | convertica MCP (optional) |
