# QUICK_BACKUP

## Purpose
Rapid backup of critical state without full inventory generation.

## Usage
Use when you need to quickly preserve state before a risky operation.

## Prompt
```
Perform a quick backup of this workstation now.

1. Run bash scripts/security/scan-secrets.sh — if clean, continue. If missing, manually grep for secrets.
2. Sync opencode config: discover all opencode.json locations (repo root, ~/.config/opencode/) and ensure they match. Also check for any .opencode/ directory configs.
3. Verify plugin config: check all plugins declared in opencode.json resolve on npm
4. Verify formatter binaries exist for declared formatters (e.g. prettier, ruff, gofmt)
5. Check ~/.cache/opencode/node_modules/ for plugin install state
6. Capture current git diff: git diff > /tmp/quick-backup-$(date +%Y%m%d-%H%M%S).diff
7. Run git status and note any uncommitted changes
8. Note any local plugins in .opencode/plugins/ or ~/.config/opencode/plugins/
9. Tell me what's changed and what needs committing

Do not commit or push.
```
