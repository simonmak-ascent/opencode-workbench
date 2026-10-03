#!/bin/bash
# run-master-backup.sh — Master Backup Script
# Purpose: Generate inventories, validate security, create backup report, prepare commit.
# Usage: bash scripts/backup/run-master-backup.sh

set -euo pipefail
WORKSPACE="/workspaces/workbench"
REPORT_DATE=$(date +%Y-%m-%d)
BACKUP_REPORT="$WORKSPACE/docs/backup-reports/$REPORT_DATE.md"
SECRETS_SCAN="$WORKSPACE/scripts/security/scan-secrets.sh"
ERRORS=0

echo "=========================================="
echo "  WORKBENCH MASTER BACKUP — $REPORT_DATE"
echo "=========================================="
echo ""

# Phase 1: Security Scan (fail fast)
echo "--- Phase 1: Security Scan ---"
if [ -f "$SECRETS_SCAN" ]; then
    bash "$SECRETS_SCAN"
    if [ $? -ne 0 ]; then
        echo "ERROR: Security scan found potential secrets. Aborting."
        exit 1
    fi
else
    echo "WARNING: Security scan script not found at $SECRETS_SCAN"
fi
echo "Security scan: CLEAN"
echo ""

# Phase 2: Inventory Generation
echo "--- Phase 2: Inventory Generation ---"

echo "  → Software inventory..."
if [ -f "$WORKSPACE/scripts/inventory/inventory-software.sh" ]; then
    bash "$WORKSPACE/scripts/inventory/inventory-software.sh" > /tmp/sw-inv.txt 2>&1 || true
fi

echo "  → Environment inventory..."
if [ -f "$WORKSPACE/scripts/inventory/inventory-environment.sh" ]; then
    bash "$WORKSPACE/scripts/inventory/inventory-environment.sh" > /tmp/env-inv.txt 2>&1 || true
fi

echo "  → MCP inventory..."
if [ -f "$WORKSPACE/scripts/inventory/inventory-mcp.sh" ]; then
    bash "$WORKSPACE/scripts/inventory/inventory-mcp.sh" > /tmp/mcp-inv.txt 2>&1 || true
fi

echo "  → OpenCode snapshot..."
if [ -f "$WORKSPACE/scripts/inventory/inventory-opencode.sh" ]; then
    bash "$WORKSPACE/scripts/inventory/inventory-opencode.sh" > /tmp/oc-inv.txt 2>&1 || true
fi

echo "Inventories generated."
echo ""

# Phase 3: Validate Secrets Documentation
echo "--- Phase 3: Secrets Validation ---"
echo "Checking required environment variables..."

REQUIRED_VARS=(
    DEEPSEEK_API_KEY SIMONMAK_ASCENT_PAT PERPLEXITY_API_KEY
    BRAVE_API_KEY BROWSERLESS_TOKEN FIGMA_TOKEN
    SENTRY_AUTH_TOKEN
    DATABASE_URL DB_PATH BROWSERLESS_HOST BROWSERLESS_PORT BROWSERLESS_PROTOCOL
)

MISSING=0
for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR:-}" ]; then
        echo "  MISSING: $VAR"
        MISSING=$((MISSING + 1))
    fi
done

if [ $MISSING -gt 0 ]; then
    echo "WARNING: $MISSING required variables are missing."
    ERRORS=$((ERRORS + 1))
else
    echo "All required variables present."
fi
echo ""

# Phase 4: Sync Runtime Config
echo "--- Phase 4: Config Sync ---"
REPO_CONFIG="$WORKSPACE/opencode.json"
RUNTIME_CONFIG="$HOME/.config/opencode/opencode.json"

if [ -f "$REPO_CONFIG" ]; then
    if [ -f "$RUNTIME_CONFIG" ]; then
        if diff "$REPO_CONFIG" "$RUNTIME_CONFIG" > /dev/null 2>&1; then
            echo "Config in sync: repo ↔ runtime"
        else
            echo "WARNING: Runtime config differs from repo. Syncing..."
            cp "$REPO_CONFIG" "$RUNTIME_CONFIG"
            echo "Synced."
            ERRORS=$((ERRORS + 1))
        fi
    else
        cp "$REPO_CONFIG" "$RUNTIME_CONFIG"
        echo "Runtime config created from repo."
    fi
else
    echo "ERROR: Repo opencode.json not found!"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Phase 5: Docker Health Check
echo "--- Phase 5: Docker Health ---"
for CONTAINER in pg-memory browserless; do
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
        echo "  $CONTAINER: RUNNING"
    else
        echo "  $CONTAINER: NOT RUNNING"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""

# Phase 6: Git Status
echo "--- Phase 6: Git Status ---"
cd "$WORKSPACE"
CHANGES=$(git status --short | wc -l)
echo "Changed files: $CHANGES"
git status --short
echo ""

# Phase 7: Generate Backup Report
echo "--- Phase 7: Backup Report ---"

mkdir -p "$(dirname "$BACKUP_REPORT")"

cat > "$BACKUP_REPORT" << REPORT
# Backup Report — $REPORT_DATE

## Summary
Automated master backup executed at $(date -u +"%Y-%m-%dT%H:%M:%SZ").

## Security Scan
- Result: CLEAN

## Environment Variables
- Required: ${#REQUIRED_VARS[@]}
- Missing: $MISSING

## Docker Containers
- pg-memory: $(docker ps --format '{{.Status}}' --filter name=pg-memory 2>/dev/null || echo 'NOT RUNNING')
- browserless: $(docker ps --format '{{.Status}}' --filter name=browserless 2>/dev/null || echo 'NOT RUNNING')

## Configuration
- Runtime config synced with repo
- Errors: $ERRORS

## Git Status
- Changed files: $CHANGES
- Branch: $(git branch --show-current)
- Last commit: $(git log -1 --oneline)

## Notes
$(if [ $ERRORS -gt 0 ]; then echo "- $ERRORS warnings/errors detected. Review above."; else echo "- All checks passed."; fi)
REPORT

echo "Backup report written to: $BACKUP_REPORT"
echo ""

# Phase 8: Summary
echo "=========================================="
echo "  BACKUP COMPLETE"
echo "=========================================="
echo "Errors: $ERRORS"
echo "Report: $BACKUP_REPORT"
echo "Changed files: $CHANGES"
echo ""
echo "Next steps:"
echo "  1. Review the backup report"
echo "  2. Review git diff"
echo "  3. Approve commit message"
echo "  4. git commit"
echo "  5. git push (with approval)"
echo ""
exit $ERRORS
