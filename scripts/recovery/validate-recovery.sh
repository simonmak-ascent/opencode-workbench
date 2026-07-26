#!/bin/bash
# validate-recovery.sh — Validate workstation recovery readiness
# Checks infrastructure, packages, env vars, config, and docs

echo "=== Recovery Validation ==="
echo ""

PASS=0
FAIL=0
WORKSPACE="/workspaces/codespace-workbench"

check() {
    local desc="$1"
    local cmd="$2"
    if eval "$cmd" > /dev/null 2>&1; then
        echo "  ✅ $desc"
        PASS=$((PASS + 1))
    else
        echo "  ❌ $desc"
        FAIL=$((FAIL + 1))
    fi
}

echo "--- Infrastructure ---"
check "Docker daemon running" "docker info"
check "PostgreSQL container running" "docker ps --filter name=pg-memory | grep -q pg-memory"
check "Browserless container running" "docker ps --filter name=browserless | grep -q browserless"

echo ""
echo "--- Software ---"
check "Node.js installed" "node --version"
check "OpenCode CLI installed" "which opencode"
check "GitHub CLI installed" "which gh"

echo ""
echo "--- npm Global Packages ---"
for pkg in @modelcontextprotocol/server-brave-search @modelcontextprotocol/server-postgres @playwright/mcp @jpisnice/shadcn-ui-mcp-server mcp-echarts mcp-mermaid saga-mcp swagger-testcase-mcp mcp-design-system-extractor figma-developer-mcp @sentry/mcp-server; do
    check "npm: $pkg" "npm list -g $pkg --depth=0"
done

echo ""
echo "--- Environment Variables ---"
for VAR in DEEPSEEK_API_KEY SIMONPLMAK_CLOUD_PAT PERPLEXITY_API_KEY BRAVE_API_KEY BROWSERLESS_TOKEN FIGMA_ACCESS_TOKEN SENTRY_ACCESS_TOKEN N8N_MCP_ACCESS_TOKEN DATABASE_URL DB_PATH; do
    check "env: $VAR" "[ -n \"\${$VAR:-}\" ]"
done

echo ""
echo "--- Configuration ---"
check "opencode.json in repo" "[ -f $WORKSPACE/opencode.json ]"
check "runtime config exists" "[ -f $HOME/.config/opencode/opencode.json ]"
check "devcontainer.json complete" "grep -q 'DEEPSEEK_API_KEY' $WORKSPACE/.devcontainer/devcontainer.json"
check "AGENTS.md exists" "[ -f $WORKSPACE/AGENTS.md ]"

echo ""
echo "--- Skills ---"
check "28 skills present" "[ \$(find $WORKSPACE/.opencode/skills -name SKILL.md 2>/dev/null | wc -l) -eq 28 ]"

echo ""
echo "--- Documentation ---"
for doc in WORKBENCH_CHARTER.md security-model.md IMPROVEMENT_BACKLOG.md CHANGELOG_WORKBENCH.md; do
    check "doc: $doc" "[ -f $WORKSPACE/docs/$doc ]"
done

echo ""
echo "=========================================="
echo "  RESULTS: $PASS passed, $FAIL failed"
echo "=========================================="

TOTAL=$((PASS + FAIL))
SCORE=$((PASS * 100 / TOTAL))
echo "Score: $SCORE/100"

if [ $FAIL -gt 0 ]; then
    exit 1
fi
exit 0
