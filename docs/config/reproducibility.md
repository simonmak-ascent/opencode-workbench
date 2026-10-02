# Reproducibility

> Phase: #2 | Created: 2026-07-27
> How to reconstruct every workflow-critical capability from repo files alone.

## Principle

"No important knowledge exists only in human memory." Everything needed to rebuild the workflow must be versioned in this repository.

## What Survives

| Asset | Storage | Recreation |
|-------|---------|-----------|
| Source code | GitHub repo | `git clone` |
| Configs | `opencode.json`, `devcontainer.json` | Repo files |
| Docs | `docs/` | Repo files |
| Prompts | `docs/prompts/`, `.opencode/SYSTEM_PROMPT.md` | Repo files |
| Skills | `.opencode/skills/` | Repo files |
| Scripts | `scripts/` | Repo files |
| CI | `.github/workflows/` | Repo files |
| Workflow state | `WORKFLOW_STATE.md` | Repo file |
| Secrets | the build box Secrets | Must be re-created from docs |
| Docker containers | Setup scripts | `bash .devcontainer/setup.sh` |
| npm packages | Setup scripts | `bash .devcontainer/setup.sh` |
| pip packages | Bootstrap script | `bash scripts/bootstrap-tools.sh` |
| Agent state (SurrealDB) | Reconstructible | Re-run agents (idempotent) |
| Build artifacts (Vercel) | Vercel platform | Re-deploy from code |
| Deployments (Vercel) | Vercel platform | `vercel promote` |

## Reconstruction Procedure

```bash
# 1. Clone repo
git clone https://github.com/simonplmak-cloud/opencode-workbench

# 2. Create the build box with secrets configured
gh SWAS create --repo simonplmak-cloud/opencode-workbench --machine basicLinux32gb

# 3. Wait for postCreate (3-5 min)
#    - setup.sh runs automatically
#    - Installs: opencode CLI, npm MCPs, Docker containers, external repos

# 4. Manual steps
npx playwright install chrome
opencode mcp auth vercel

# 5. Bootstrap data tools (optional)
bash scripts/bootstrap-tools.sh

# 6. Verify
bash scripts/recovery/validate-recovery.sh

# 7. Start working
opencode serve --port 4096 --hostname 0.0.0.0
```

## Drift Detection

```bash
# Compare runtime vs committed config
diff opencode.json ~/.config/opencode/opencode.json

# Verify Docker containers
docker ps | grep -E "pg-memory|browserless"

# Verify npm global packages
npm list -g --depth=0

# Run full inventory
bash scripts/inventory/inventory-environment.sh
bash scripts/inventory/inventory-mcp.sh
bash scripts/inventory/inventory-opencode.sh
bash scripts/inventory/inventory-software.sh
```

## What CANNOT Be Reproduced from Repo Alone

| Asset | Why | Mitigation |
|-------|-----|-----------|
| SurrealDB state | Docker volume, deleted with the build box | All agents are idempotent — re-run will regenerate state |
| Browserless sessions | Ephemeral | Re-run scraper jobs |
| Vercel preview URLs | Ephemeral, expire | Re-build from code |
| Playwright browser binaries | Installed at runtime | `npx playwright install chrome` |
| Research cache | In-memory/SurrealDB | Re-search from sources (cached where possible) |
