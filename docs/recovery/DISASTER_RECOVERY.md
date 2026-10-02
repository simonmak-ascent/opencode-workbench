# Disaster Recovery

> Purpose: Complete recovery procedure assuming total loss of the workstation.
> Scenario: SWAS deleted, VM deleted, all local state lost.
> Survivors: Git repository, GitHub account, the SWAS box Secrets.

## Pre-Flight: Verify Survivors

Before attempting recovery, verify these assets exist:

1. **Repository**: `https://github.com/simonplmak-cloud/workbench` exists
2. **Secrets**: At least 10 critical secrets configured at https://github.com/settings/SWAS/secrets
3. **PAT**: `SIMONPLMAK_CLOUD_PAT` is active (check: https://github.com/settings/tokens)
4. **Machine type**: Recommended `4-core` (`basicLinux32gb`) at minimum

## Recovery Procedure

### Step 1: Create New SWAS
```
https://github.com/simonplmak-cloud/workbench → Code → SWAS → Create
```

### Step 2: Wait for Automation
The `postCreateCommand` runs `.devcontainer/setup.sh` which:
- Installs OpenCode CLI
- Installs npm-global MCP server packages
- Copies vendored MCPs to ~/.local/bin
- Starts Docker containers (PostgreSQL, Browserless)
- Copies opencode.json to ~/.config/opencode/
- Clones external repos (~/esg-hub, ~/project_human)
- Sources .bashrc additions

**Estimated time**: 3-5 minutes

### Step 3: Post-Create Manual Steps

```bash
# 1. Install Chromium for Playwright (if setup.sh failed)
npx playwright install chrome

# 2. Verify everything
docker ps
npm list -g --depth=0
opencode --version

# 3. Start OpenCode
cd /workspaces/workbench
opencode

# 4. Bootstrap additional tools (optional)
bash scripts/bootstrap-tools.sh
```

### Step 4: Validate Recovery

Run the recovery validation script:
```bash
bash scripts/recovery/validate-recovery.sh
```

Or manually verify:
- [ ] 18 MCP servers connect (19 configured, saga disabled)
- [ ] 28 skills available
- [ ] PostgreSQL database accessible
- [ ] Browserless container responds
- [ ] OpenCode using deepseek/deepseek-v4-pro

## What Survives

| Asset | Survival | Notes |
|-------|----------|-------|
| Repository files | ✅ Full | Git-tracked files restored |
| OpenCode config | ✅ Full | opencode.json in repo |
| MCP config | ✅ Full | All in opencode.json |
| Agent skills | ✅ Full | 28 SKILL.md files in .opencode/skills/ |
| Devcontainer config | ✅ Full | devcontainer.json + remoteEnv |
| Docker config | ✅ Full | setup.sh starts containers |
| Documentation | ✅ Full | All docs in repo |
| Prompt library | ✅ Full | docs/prompts/ in repo |
| Shell aliases | ✅ Full | .devcontainer/aliases.sh |
| npm global packages | ✅ Auto | Installed by setup.sh |
| API keys | ✅ If secrets exist | SWAS Secrets |
| Saga tracker DB | ❌ Lost | Ephemeral — recreated on first use |
| PostgreSQL data | ❌ Lost | Ephemeral — dev database |
| Shell history | ❌ Lost | Local to SWAS |
| Playwright chromium | ⚠️ Manual | Must `npx playwright install chrome` (or auto via setup.sh) |
| Vercel token auth | ✅ Auto | Bearer {env:VERCEL_ACCESS_TOKEN} |

## What Is Lost (Acceptable)

| Item | Impact | Mitigation |
|------|--------|-----------|
| PostgreSQL data | Low | Dev environment — seed data from repo |
| Saga tracker data | Low | Reinitialize with `saga_tracker_init` |
| Shell history | None | Not persisted by design |
| Browser cache | Low | Recreated on first use |
| Playwright binary | Low | Reinstalled via `npx playwright install chrome` |

## Recovery Time Objective (RTO)

- **Automated portion**: ~5 minutes (postCreateCommand)
- **Manual portion**: ~1 minute (verify + optional playwright install)
- **Total RTO**: < 7 minutes

## Recovery Point Objective (RPO)

- **Configuration**: 0 data loss (fully in Git)
- **Secrets**: 0 data loss (in SWAS Secrets)
- **Application data**: Loss acceptable (dev environment)
