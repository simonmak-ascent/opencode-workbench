#!/bin/bash
# inventory-opencode.sh — Generate OpenCode runtime configuration snapshot
# Output: Markdown with current model, provider, MCP assignments

echo "# OpenCode Runtime Snapshot"
echo ""
echo "> Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

REPO_CONFIG="/workspaces/codespace-workbench/opencode.json"
RUNTIME_CONFIG="$HOME/.config/opencode/opencode.json"

echo "## Configuration Source"
echo ""
if [ -f "$RUNTIME_CONFIG" ]; then
    if diff "$REPO_CONFIG" "$RUNTIME_CONFIG" > /dev/null 2>&1; then
        echo "Status: **IN SYNC** (repo ↔ runtime)"
    else
        echo "Status: **DRIFT DETECTED** (runtime differs from repo)"
    fi
else
    echo "Status: **MISSING** (no runtime config found)"
fi
echo ""

echo "## Model Configuration"
echo ""
if [ -f "$REPO_CONFIG" ]; then
    model=$(grep '"model"' "$REPO_CONFIG" | head -1 | sed 's/.*"model": *"//' | sed 's/".*//')
    small=$(grep '"small_model"' "$REPO_CONFIG" | head -1 | sed 's/.*"small_model": *"//' | sed 's/".*//')
    lsp=$(grep '"lsp"' "$REPO_CONFIG" | head -1 | sed 's/.*"lsp": *//' | sed 's/,.*//')
    echo "| Setting | Value |"
    echo "|---------|-------|"
    echo "| Primary Model | $model |"
    echo "| Small Model | $small |"
    echo "| LSP | $lsp |"
else
    echo "ERROR: opencode.json not found"
fi
echo ""

echo "## Provider"
echo ""
if [ -f "$REPO_CONFIG" ]; then
    echo "| Provider | API Endpoint | Auth Env |"
    echo "|----------|-------------|----------|"
    grep -A5 '"deepseek"' "$REPO_CONFIG" | head -6 > /dev/null 2>&1 && echo "| DeepSeek | https://api.deepseek.com/v1 | DEEPSEEK_API_KEY |"
fi
echo ""

echo "## MCP Servers"
echo ""
if [ -f "$REPO_CONFIG" ]; then
    echo "| Server | Type | Enabled |"
    echo "|--------|------|---------|"
    python3 -c "
import json
with open('$REPO_CONFIG') as f:
    config = json.load(f)
for name, server in config.get('mcp', {}).items():
    stype = server.get('type', 'unknown')
    enabled = server.get('enabled', False)
    print(f'| {name} | {stype} | {\"✅\" if enabled else \"❌\"} |')
" 2>/dev/null || echo "| (parse error) | | |"
fi
echo ""

echo "## Skills"
echo ""
SKILL_COUNT=$(find /workspaces/codespace-workbench/.opencode/skills -name "SKILL.md" 2>/dev/null | wc -l)
echo "| Category | Count |"
echo "|----------|-------|"
echo "| Total skills | $SKILL_COUNT |"
echo ""
