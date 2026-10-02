#!/bin/bash
set -e

PACKAGES=(
  opencode-ai
  pnpm
  vercel
  @anthropic-ai/sdk
  @playwright/mcp
  @modelcontextprotocol/server-filesystem
  @modelcontextprotocol/server-github
  @modelcontextprotocol/server-memory
  @modelcontextprotocol/server-postgres
  @modelcontextprotocol/server-puppeteer
  @modelcontextprotocol/server-sequential-thinking
  @notionhq/notion-mcp-server
  @perplexity-ai/mcp-server
  chrome-devtools-mcp
  exa-mcp-server
  figma-mcp
  surrealdb-mcp-server
  vercel-mcp
)

echo "=== Installing global npm packages ==="
for pkg in "${PACKAGES[@]}"; do
  if npm ls -g "$pkg" --depth=0 &>/dev/null 2>&1; then
    echo "[SKIP] Already installed: $pkg"
  else
    echo "[INSTALL] Installing: $pkg"
    npm install -g "$pkg"
  fi
done

echo ""
echo "=== Verifying OpenCode ==="
if command -v opencode &>/dev/null; then
  echo "OpenCode found at: $(which opencode)"
  opencode --version 2>&1 || echo "(version flag not available — binary confirmed)"
else
  echo "ERROR: opencode not found in PATH after install"
  exit 1
fi

echo ""
echo "=== Configuring shell aliases ==="
ALIASES_LINE='source /workspaces/workbench/.devcontainer/aliases.sh'

if [ -f ~/.bashrc ] && grep -qF "$ALIASES_LINE" ~/.bashrc; then
  echo "[SKIP] Aliases already sourced in ~/.bashrc"
elif [ -f ~/.bashrc ]; then
  echo "" >> ~/.bashrc
  echo "$ALIASES_LINE" >> ~/.bashrc
  echo "[DONE] Aliases added to ~/.bashrc"
else
  echo "$ALIASES_LINE" > ~/.bashrc
  echo "[DONE] Created ~/.bashrc with aliases"
fi

echo ""
echo "=== Workbench setup complete ==="
