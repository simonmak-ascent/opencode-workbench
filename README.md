# Codespace Workbench

A fully reproducible, self-documenting, and recoverable development workstation operating system for GitHub Codespaces and OpenCode.

## Purpose

This repository is the **single source of truth** for a complete cloud development workstation. Everything needed to rebuild from scratch is versioned here:

- Workstation configuration and automation
- OpenCode configuration (model, providers, MCP servers)
- Agent skills (28 reusable AI instructions)
- Operational prompts (disaster recovery, backup, security)
- Recovery procedures (playbook, checklist, gap analysis)
- Security governance (secret management, threat model)

**No important knowledge exists only in human memory.**

## Quick Start

```bash
# Create a new codespace
gh codespace create --repo simonplmak-cloud/codespace-workbench --machine basicLinux32gb

# Wait for postCreate (3-5 min) — installs everything automatically
# Then start coding:
opencode
```

## Architecture

```
codespace-workbench/
├── .devcontainer/                  # Codespace definition & bootstrap
│   ├── devcontainer.json           # Container image, features, ports, remoteEnv
│   ├── setup.sh                    # Post-create: installs opencode, MCPs, Docker infra
│   └── aliases.sh                  # Shell aliases sourced at runtime
├── .opencode/
│   └── skills/                     # 28 custom agent skills (10 research, 10 dev, 8 publishing)
├── vendor/                         # Vendored MCP source code
│   ├── perplexity-agent-mcp/
│   └── browserless-mcp/
├── configs/                        # Reference configurations
│   ├── mcp/                        # MCP server inventory & architecture
│   ├── opencode/                   # OpenCode settings documentation
│   ├── shell/                      # Shell configuration
│   ├── git/                        # Git configuration & hooks
│   └── providers/                  # AI provider configuration
├── docs/                           # Complete documentation system
│   ├── WORKBENCH_CHARTER.md        # Governance: mission, principles, requirements
│   ├── security-model.md           # Security architecture & threat model
│   ├── IMPROVEMENT_BACKLOG.md      # Tracked improvements and fixes
│   ├── CHANGELOG_WORKBENCH.md      # Append-only change history
│   ├── architecture/               # System documentation (10 docs)
│   ├── recovery/                   # Recovery procedures (4 docs)
│   ├── prompts/                    # Operational prompt library (9 prompts)
│   └── backup-reports/             # Dated backup snapshots
├── scripts/                        # Automation scripts
│   ├── backup/                     # Master backup script
│   ├── inventory/                  # Auto-generate inventories (software, env, MCP, OpenCode)
│   ├── security/                   # Secret pattern scanner
│   ├── recovery/                   # Recovery validation
│   └── maintenance/                # Config sync, routine tasks
├── .github/workflows/              # CI validation (docs, inventory, config)
├── opencode.json                   # OpenCode configuration (19 MCP servers)
├── AGENTS.md                       # OpenCode agent instructions
└── README.md                       # This file
```

## What's Inside

| Category | Details |
|----------|---------|
| **OpenCode** | CLI v1.18.5, DeepSeek V4 Pro model, LSP enabled |
| **MCP Servers** | 19 configured (5 remote, 14 local), all enabled |
| **Agent Skills** | 28 reusable skills in `.opencode/skills/` |
| **Infrastructure** | PostgreSQL 16 (Docker), Browserless Chromium (Docker) |
| **Tools** | pandoc, jq, miller, sqlite3, GitHub CLI, Playwright Chromium |
| **Prompts** | 9 operational prompts in `docs/prompts/` |

## Workstation Governance

This workstation operates under a formal charter. Key principles:

- **Single Source of Truth**: Runtime must match repository. Drift is a bug.
- **Secrets Never Touch Disk**: All secrets flow through GitHub Codespaces Secrets.
- **Immutable History**: Changelog is append-only. Every change is traceable.
- **Documentation Lives With Code**: Docs describe the system as it is, not as imagined.

Read the full charter: [`docs/WORKBENCH_CHARTER.md`](docs/WORKBENCH_CHARTER.md)

## Backup Workflow

```bash
# Master backup — full inventory, security scan, commit prep
bash scripts/backup/run-master-backup.sh

# Quick backup — save state before risky operations
bash scripts/maintenance/sync-runtime-config.sh && \
  git diff > /tmp/quick-backup-$(date +%Y%m%d).diff
```

Or use OpenCode prompts:
- `docs/prompts/RUN_MASTER_BACKUP.md` — execute backup via AI
- `docs/prompts/QUICK_BACKUP.md` — rapid state preservation

## Recovery Workflow

Assume the Codespace is deleted. Only Git repo + Codespaces Secrets survive.

```bash
# 1. Create new codespace
gh codespace create --repo simonplmak-cloud/codespace-workbench --machine basicLinux32gb

# 2. Wait for automation (3-5 min)

# 3. Two manual steps:
npx playwright install chrome
opencode mcp auth vercel     # only if Vercel MCP needed

# 4. Validate recovery
bash scripts/recovery/validate-recovery.sh
```

Full details: [`docs/recovery/RECOVERY_PLAYBOOK.md`](docs/recovery/RECOVERY_PLAYBOOK.md)

## MCP Architecture

| Type | Count | Servers |
|------|-------|---------|
| Remote | 5 | context7, gh_grep, n8n (Bearer auth), clerk, vercel (OAuth) |
| Local (npm) | 11 | brave-search, postgres, playwright, shadcn, echarts, mermaid, saga, swagger-testcase, design-system, figma, sentry |
| Local (vendored) | 2 | perplexity-agent-mcp, browserless-mcp |
| Local (binary) | 1 | github-mcp-server |

See: [`docs/architecture/mcp-inventory.md`](docs/architecture/mcp-inventory.md)

## Secrets Management

All secrets stored in GitHub Codespaces Secrets. Never in repository files.

| # | Secret | Used By |
|---|--------|---------|
| 1 | `DEEPSEEK_API_KEY` | OpenCode (primary model) |
| 2 | `SIMONPLMAK_CLOUD_PAT` | GitHub MCP, shadcn MCP |
| 3 | `PERPLEXITY_API_KEY` | Perplexity MCP |
| 4 | `BRAVE_API_KEY` | Brave Search MCP |
| 5 | `BROWSERLESS_TOKEN` | Browserless MCP + container |
| 6 | `FIGMA_ACCESS_TOKEN` | Figma MCP |
| 7 | `SENTRY_ACCESS_TOKEN` | Sentry MCP |
| 8 | `N8N_MCP_ACCESS_TOKEN` | n8n MCP |
| 9 | `KIMI_API_KEY` | Alternate provider (legacy) |

See: [`docs/architecture/codespaces-secrets.md`](docs/architecture/codespaces-secrets.md)

## Documentation Index

| Document | Purpose |
|----------|---------|
| `docs/WORKBENCH_CHARTER.md` | Mission, principles, governance |
| `docs/security-model.md` | Security architecture, threat model, incident response |
| `docs/IMPROVEMENT_BACKLOG.md` | Tracked improvements and technical debt |
| `docs/CHANGELOG_WORKBENCH.md` | Complete change history |
| `docs/architecture/` | System documentation (10 inventory docs) |
| `docs/recovery/` | Recovery playbook, disaster recovery, checklist, gap analysis |
| `docs/prompts/` | 9 operational prompts with index |
| `docs/backup-reports/` | Dated backup snapshots |

## Adding to the Workbench

1. **MCP Server**: Add npm package to `.devcontainer/setup.sh`, add to `opencode.json`, document in `docs/architecture/mcp-inventory.md`
2. **Agent Skill**: Create `.opencode/skills/<name>/SKILL.md`, follow naming convention
3. **Tool**: Add to `scripts/bootstrap-tools.sh`
4. **Prompt**: Create in `docs/prompts/`, update `prompt-index.md`
5. After any change: Update `CHANGELOG_WORKBENCH.md`, run master backup

## Recovery Score: 92/100

Validated disaster recovery within < 10 minutes using repository + Codespaces Secrets alone.
