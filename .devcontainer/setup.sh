#!/bin/bash
set -euo pipefail

WORKSPACE="/workspaces/codespace-workbench"
HOME_NODE="/home/node"

# --- Ensure .env.workbench is sourced on login ---
if [ ! -f "$HOME_NODE/.env.workbench" ]; then
  cp "$WORKSPACE/.env.workbench.template" "$HOME_NODE/.env.workbench" 2>/dev/null || echo "# workbench env — add your secrets here" > "$HOME_NODE/.env.workbench"
  chmod 600 "$HOME_NODE/.env.workbench"
  echo "created ~/.env.workbench from template"
else
  set -a; . "$HOME_NODE/.env.workbench"; set +a
fi
grep -q 'env.workbench' "$HOME_NODE/.bashrc" 2>/dev/null || \
  echo '[ -f ~/.env.workbench ] && . ~/.env.workbench' >> "$HOME_NODE/.bashrc"

step() { echo ""; echo "=== [setup] $1 ==="; }

step "opencode CLI"
if ! command -v opencode >/dev/null 2>&1; then
  curl -fsSL https://opencode.ai/install | bash
fi
export PATH="$HOME/.opencode/bin:$PATH"
opencode --version || echo "opencode install failed (non-fatal for setup)"

step "global npm MCP servers"
npm install -g --silent \
  @modelcontextprotocol/server-brave-search \
  @modelcontextprotocol/server-postgres \
  @playwright/mcp \
  @sentry/mcp-server \
  mcp-mermaid \
  saga-mcp \
  mcp-echarts \
  @jpisnice/shadcn-ui-mcp-server \
  @anthropic-ai/mcp-server-perplexity

step "bun & talk-to-figma relay"
if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash
fi
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

if [ ! -d "$HOME/.local/share/talk-to-figma" ]; then
  mkdir -p "$HOME/.local/share"
  git clone https://github.com/arinspunk/cursor-talk-to-figma-mcp.git "$HOME/.local/share/talk-to-figma"
fi
cd "$HOME/.local/share/talk-to-figma"
bun install --silent

if [ -f "$WORKSPACE/scripts/services/figma-relay.sh" ]; then
  bash "$WORKSPACE/scripts/services/figma-relay.sh" install 2>/dev/null || echo "figma-relay install failed"
  bash "$WORKSPACE/scripts/services/figma-relay.sh" start 2>/dev/null || echo "figma-relay start failed"
fi

step "Playwright browsers"
npx playwright install chromium 2>/dev/null || echo "Playwright install failed — retry manually"

step "opencode MCP auth (non-fatal, user may need to re-auth)"
opencode mcp auth vercel 2>/dev/null || echo "Vercel OAuth not yet completed — run: opencode mcp auth vercel"
opencode mcp auth v0 2>/dev/null || echo "v0 OAuth not yet completed — run: opencode mcp auth v0"
opencode mcp auth github 2>/dev/null || echo "GitHub OAuth not yet completed"

echo ""
echo "============================================"
echo "  OpenCode workbench setup complete."
echo "  Manual steps (if not already done):"
echo "  1. Configure ~/.env.workbench with your secrets"
echo "  2. opencode mcp auth vercel (Vercel OAuth)"
echo "  3. opencode mcp auth v0 (v0 by Vercel OAuth)"
echo "  4. npx playwright install chromium (browser)"
echo "============================================"
