#!/usr/bin/env bash
# Workbench setup: installs opencode + MCP stack inside the build box.
# Runs as postCreateCommand (user: node, home: /home/node).
set -uo pipefail

WORKSPACE="${WORKSPACE:-/workspaces/workbench}"

# --- Ensure .env.workbench is sourced on login ---
if [ ! -f "$HOME/.env.workbench" ]; then
  cp "$WORKSPACE/.env.workbench.example" "$HOME/.env.workbench" 2>/dev/null || true
  echo "# add your secrets" > "$HOME/.env.workbench"
  chmod 600 "$HOME/.env.workbench"
fi

[ -f "$HOME/.env.workbench" ] && set -a; . "$HOME/.env.workbench"; set +a

grep -q 'env.workbench' "$HOME/.bashrc" 2>/dev/null || \
  echo '[ -f ~/.env.workbench ] && . ~/.env.workbench' >> "$HOME/.bashrc"

step() { echo ""; echo "=== [setup] $1 ==="; }

step "opencode CLI"
# v2 channel: https://opencode.ai/install is the OpenCode 1 installer and
# refuses 2.x, so it would install the wrong major on a fresh box. Upgrade an
# existing v1 install too — presence alone is not "current".
export PATH="$HOME/.opencode/bin:$PATH"
oc_major="$(opencode --version 2>/dev/null | awk 'NR==1{print $NF}' | sed 's/^v//' | cut -d. -f1)"
if [ "$oc_major" != "2" ]; then
  curl -fsSL https://opencode.ai/v2/install | bash
fi
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
  @anthropic-ai/mcp-server-perplexity || echo "some MCP servers failed to install (non-fatal)"

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
echo "  3. opencode mcp auth vercel (Vercel OAuth)"
echo "  4. opencode mcp auth v0 (v0 by Vercel OAuth)"
echo "============================================"
