#!/bin/bash
# sync-runtime-config.sh — Sync repo opencode.json to runtime location
# Ensures the runtime config matches the repository source of truth.

REPO_CONFIG="/workspaces/workbench/opencode.json"
RUNTIME_CONFIG="$HOME/.config/opencode/opencode.json"

echo "=== Config Sync ==="

if [ ! -f "$REPO_CONFIG" ]; then
    echo "ERROR: Repo config not found at $REPO_CONFIG"
    exit 1
fi

if [ ! -f "$RUNTIME_CONFIG" ]; then
    echo "Runtime config missing. Copying from repo..."
    mkdir -p "$(dirname "$RUNTIME_CONFIG")"
    cp "$REPO_CONFIG" "$RUNTIME_CONFIG"
    echo "✅ Runtime config created."
    exit 0
fi

if diff "$REPO_CONFIG" "$RUNTIME_CONFIG" > /dev/null 2>&1; then
    echo "✅ Config in sync. No action needed."
else
    echo "⚠️  DRIFT DETECTED. Differences:"
    diff "$REPO_CONFIG" "$RUNTIME_CONFIG" || true
    echo ""
    echo "Syncing runtime from repo..."
    cp "$REPO_CONFIG" "$RUNTIME_CONFIG"
    echo "✅ Synced. Restart OpenCode to apply changes."
fi
