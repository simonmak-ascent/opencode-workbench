#!/bin/bash
# inventory-mcp.sh — Generate MCP server inventory
# Output: Markdown table of MCP servers, types, auth methods, and npm versions

echo "# MCP Server Inventory"
echo ""
echo "> Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

echo "## Remote MCPs"
echo ""
echo "| Server | URL | Auth |"
echo "|--------|-----|------|"
echo "| context7 | https://mcp.context7.com/mcp | None |"
echo "| gh_grep | https://mcp.grep.app | None |"
echo "| n8n | https://simonmak.app.n8n.cloud/mcp-server/http | Bearer Token |"
echo "| clerk | https://mcp.clerk.com/mcp | None |"
echo "| vercel | https://mcp.vercel.com | OAuth |"
echo ""

echo "## Local MCPs (npm global)"
echo ""
echo "| Server | Package | Version |"
echo "|--------|---------|---------|"

npm_packages=(
    "@modelcontextprotocol/server-brave-search"
    "@modelcontextprotocol/server-postgres"
    "@playwright/mcp"
    "@jpisnice/shadcn-ui-mcp-server"
    "mcp-echarts"
    "mcp-mermaid"
    "saga-mcp"
    "swagger-testcase-mcp"
    "mcp-design-system-extractor"
    "figma-developer-mcp"
    "@sentry/mcp-server"
)

for pkg in "${npm_packages[@]}"; do
    ver=$(npm list -g "$pkg" --depth=0 2>/dev/null | grep "$pkg" | awk '{print $NF}' | sed 's/@$//')
    if [ -z "$ver" ]; then
        ver="NOT INSTALLED"
    fi
    short_name=$(echo "$pkg" | sed 's/@.*\///' | sed 's/@modelcontextprotocol\/server-//')
    echo "| $short_name | $pkg | $ver |"
done
echo ""

echo "## Local MCPs (vendored)"
echo ""
echo "| Server | Location |"
echo "|--------|----------|"
echo "| github-mcp-server | ~/.local/bin/github-mcp-server |"
echo "| perplexity-agent-mcp | ~/.local/bin/perplexity-agent-mcp/ |"
echo "| browserless-mcp | ~/.local/bin/browserless-mcp/ |"
echo ""

echo "## Infrastructure"
echo ""
echo "| Service | Container | Port | Status |"
echo "|---------|-----------|------|--------|"
echo "| PostgreSQL | pg-memory | 5432 | $(docker ps --filter name=pg-memory --format '{{.Status}}' 2>/dev/null | head -c 20 || echo 'NOT RUNNING') |"
echo "| Browserless | browserless | 3000 | $(docker ps --filter name=browserless --format '{{.Status}}' 2>/dev/null | head -c 20 || echo 'NOT RUNNING') |"
echo ""
