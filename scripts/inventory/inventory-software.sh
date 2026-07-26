#!/bin/bash
# inventory-software.sh — Generate software inventory
# Output: Markdown table of installed software with versions

echo "# Software Inventory"
echo ""
echo "> Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

echo "## Core Platform"
echo ""
echo "| Tool | Version | Purpose |"
echo "|------|---------|---------|"
echo "| Debian | $(cat /etc/debian_version 2>/dev/null || echo 'unknown') | OS |"
echo "| Node.js | $(node --version 2>/dev/null || echo 'N/A') | JS runtime |"
echo "| npm | $(npm --version 2>/dev/null || echo 'N/A') | Package manager |"
echo "| Docker | $(docker --version 2>/dev/null | awk '{print $3}' | sed 's/,//' || echo 'N/A') | Container runtime |"
echo "| Git | $(git --version 2>/dev/null | awk '{print $3}' || echo 'N/A') | Version control |"
echo "| GitHub CLI | $(gh --version 2>/dev/null | head -1 | awk '{print $3}' || echo 'N/A') | GitHub automation |"
echo ""

echo "## OpenCode"
echo ""
echo "| Tool | Version | Purpose |"
echo "|------|---------|---------|"
echo "| OpenCode CLI | $(opencode --version 2>/dev/null || echo 'N/A') | AI coding assistant |"
echo ""

echo "## npm Global Packages"
echo ""
echo "| Package | Version |"
echo "|---------|---------|"
npm list -g --depth=0 2>/dev/null | grep -v '^/' | grep '@' | while read -r line; do
    pkg=$(echo "$line" | awk '{print $2}' | sed 's/@$//')
    ver=$(echo "$line" | awk '{print $NF}')
    echo "| $pkg | $ver |"
done
echo ""

echo "## Docker Containers"
echo ""
echo "| Container | Image | Status | Ports |"
echo "|-----------|-------|--------|-------|"
docker ps --format '| {{.Names}} | {{.Image}} | {{.Status}} | {{.Ports}} |' 2>/dev/null || echo "| N/A | N/A | Docker not accessible | N/A |"
echo ""

echo "## CLI Tools"
echo ""
echo "| Tool | Version | Purpose |"
echo "|------|---------|---------|"
echo "| jq | $(jq --version 2>/dev/null || echo 'N/A') | JSON processing |"
echo "| pandoc | $(pandoc --version 2>/dev/null | head -1 | awk '{print $2}' || echo 'N/A') | Document conversion |"
echo "| curl | $(curl --version 2>/dev/null | head -1 | awk '{print $2}' || echo 'N/A') | HTTP client |"
echo "| sqlite3 | $(sqlite3 --version 2>/dev/null | awk '{print $1}' || echo 'N/A') | Embedded database |"
echo "| chromium | $(google-chrome --version 2>/dev/null || echo 'N/A') | Browser automation |"
echo ""
