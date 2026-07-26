# MASTER_WORKBENCH_BACKUP

## Purpose
Perform a comprehensive workstation backup: inventory all systems, validate secrets, generate recovery analysis, and prepare a commit.

## Usage
Copy this entire prompt into OpenCode to execute a master backup.

## Prompt
```
ROLE: Senior DevOps Engineer + Platform Engineer + Security Auditor + Backup Administrator

PRIMARY OBJECTIVE:
Perform a complete master backup of the codespace-workbench workstation.

PHASE 1 — INVENTORY:
1. Run `bash scripts/inventory/inventory-software.sh` to capture all installed software versions
2. Run `bash scripts/inventory/inventory-environment.sh` to capture all env var names
3. Run `bash scripts/inventory/inventory-mcp.sh` to capture MCP server status
4. Verify all scripts complete without errors

PHASE 2 — SECURITY:
5. Run `bash scripts/security/scan-secrets.sh` to check for exposed secrets
6. If ANY secret is detected, STOP and report. Do not proceed.
7. Verify .gitignore blocks all sensitive patterns

PHASE 3 — VALIDATION:
8. Compare current env vars against documented secrets in docs/architecture/codespaces-secrets.md
9. Compare installed packages against docs/architecture/software-inventory.md
10. Flag any mismatches

PHASE 4 — DOCUMENTATION:
11. Update docs/architecture/opencode-runtime-config.md with current state
12. Update docs/architecture/opencode-runtime-snapshot.md with current state
13. Update docs/CHANGELOG_WORKBENCH.md with today's changes
14. Create docs/backup-reports/YYYY-MM-DD.md with backup summary

PHASE 5 — COMMIT PREPARATION:
15. Stage all changed files
16. Generate a conventional commit message summarizing changes
17. Show the proposed commit message
18. DO NOT commit or push — wait for approval

RULES:
- Never expose secret values
- Never commit .env, keys, or credentials
- If security scan finds anything, abort and report
```
