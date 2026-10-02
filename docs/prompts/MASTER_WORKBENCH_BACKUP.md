# MASTER_WORKBENCH_BACKUP

## Purpose
Perform a comprehensive workstation backup: inventory all systems, validate secrets, generate recovery analysis, and prepare a commit.

## Usage
Copy this entire prompt into OpenCode to execute a master backup.

## Prompt
```
ROLE: Senior DevOps Engineer + Platform Engineer + Security Auditor + Backup Administrator

PRIMARY OBJECTIVE:
Perform a complete master backup of the workbench workstation.

PHASE 1 — INVENTORY:
1. Run `bash scripts/inventory/inventory-software.sh` to capture all installed software versions. If script missing, manually inventory: dpkg -l, pip list, npm list -g, and document findings.
2. Run `bash scripts/inventory/inventory-environment.sh` to capture all env var names. If missing, use `env | cut -d= -f1 | sort` as fallback.
3. Run `bash scripts/inventory/inventory-mcp.sh` to capture MCP server status. If missing, read opencode.json mcp section directly.
4. Inventory plugins: resolve all plugins in opencode.json against npm, note versions
5. Inventory formatters: check which declared formatter binaries are available on PATH
6. Check ~/.cache/opencode/node_modules/ contents and note installed plugin versions
7. Note any new categories of state discovered that aren't covered by existing inventory scripts

PHASE 2 — SECURITY:
8. Run `bash scripts/security/scan-secrets.sh` to check for exposed secrets. If script missing, manually grep for key patterns.
9. If ANY secret is detected, STOP and report. Do not proceed.
10. Verify .gitignore blocks all sensitive patterns (check against actual repo contents, not just the file)

PHASE 3 — VALIDATION:
11. Compare current env vars against documented secrets in docs/architecture/secrets.md
12. Compare installed packages against docs/architecture/software-inventory.md
13. Flag any mismatches. Distinguish between: (a) new additions to document, (b) removals to flag, (c) actual drift to fix.

PHASE 4 — DOCUMENTATION:
14. Update docs/architecture/opencode-runtime-config.md with current state
15. Update docs/architecture/opencode-runtime-snapshot.md with current state
16. Update docs/CHANGELOG_WORKBENCH.md with today's changes
17. Create docs/backup-reports/YYYY-MM-DD.md with backup summary

PHASE 5 — COMMIT PREPARATION:
18. Stage all changed files
19. Generate a conventional commit message summarizing changes
20. Show the proposed commit message
21. DO NOT commit or push — wait for approval

RULES:
- Never expose secret values
- Never commit .env, keys, or credentials
- If security scan finds anything, abort and report
- If any script in this workflow does not exist, document that gap and continue with manual fallback
```
