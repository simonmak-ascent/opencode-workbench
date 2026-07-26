# QUICK_BACKUP

## Purpose
Rapid backup of critical state without full inventory generation.

## Usage
Use when you need to quickly preserve state before a risky operation.

## Prompt
```
Perform a quick backup of this workstation now.

1. Run bash scripts/security/scan-secrets.sh — if clean, continue
2. Sync opencode.json: cp opencode.json ~/.config/opencode/opencode.json
3. Capture current git diff: git diff > /tmp/quick-backup-$(date +%Y%m%d-%H%M%S).diff
4. Run git status and note any uncommitted changes
5. Tell me what's changed and what needs committing

Do not commit or push.
```
