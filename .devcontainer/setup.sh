#!/usr/bin/env bash
# Workbench setup: installs opencode + MCP stack inside the Codespace.
# Runs as postCreateCommand (user: node, home: /home/node).
set -uo pipefail

WORKSPACE="$(cd "$(dirname "$0")/.." && pwd)"
HOME_BIN="$HOME/.local/bin"
NPM_GLOBAL="$HOME/.npm-global"
mkdir -p "$HOME_BIN" "$HOME/.config/opencode"
export PATH="$HOME_BIN:$NPM_GLOBAL/bin:$PATH"
npm config set prefix "$NPM_GLOBAL"

# Secrets bootstrap: values are injected post-creation into ~/.env.workbench
# (user-level Codespaces secrets need the codespaces:secrets token scope).
if [ -f "$HOME/.env.workbench" ]; then
  set -a; . "$HOME/.env.workbench"; set +a
fi
grep -q 'env.workbench' "$HOME/.bashrc" 2>/dev/null || \
  echo '[ -f ~/.env.workbench ] && . ~/.env.workbench' >> "$HOME/.bashrc"

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
  figma-developer-mcp \
  @sentry/mcp-server \
  mcp-mermaid \
  saga-mcp \
  mcp-echarts \
  @jpisnice/shadcn-ui-mcp-server \
  swagger-testcase-mcp \
  mcp-design-system-extractor || echo "npm global MCP install had errors"

step "playwright chromium"
npx -y playwright install chromium >/dev/null 2>&1 || echo "playwright browser install failed"
sudo env DEBIAN_FRONTEND=noninteractive npx -y playwright install-deps chromium >/dev/null 2>&1 || \
  echo "playwright system deps had errors (non-fatal)"

step "github-mcp-server binary"
GHMCP_VER=$(curl -sf https://api.github.com/repos/github/github-mcp-server/releases/latest | grep -o '"tag_name": *"[^"]*"' | cut -d'"' -f4 || true)
if [ -n "$GHMCP_VER" ]; then
  curl -sfL "https://github.com/github/github-mcp-server/releases/download/${GHMCP_VER}/github-mcp-server_Linux_x86_64.tar.gz" \
    | tar -xz -C "$HOME_BIN" github-mcp-server 2>/dev/null && chmod +x "$HOME_BIN/github-mcp-server" \
    || echo "github-mcp-server download failed"
else
  echo "could not resolve github-mcp-server version"
fi

step "vendored MCPs (perplexity, browserless)"
cp -r "$WORKSPACE/vendor/perplexity-agent-mcp" "$HOME_BIN/" 2>/dev/null || true
cp -r "$WORKSPACE/vendor/browserless-mcp" "$HOME_BIN/" 2>/dev/null || true
(cd "$HOME_BIN/perplexity-agent-mcp" && npm install --omit=dev --silent) || echo "perplexity deps failed"
(cd "$HOME_BIN/browserless-mcp" && npm install --omit=dev --silent) || echo "browserless deps failed"

step "postgres (memory store) via docker"
if docker info >/dev/null 2>&1; then
  docker rm -f pg-memory >/dev/null 2>&1 || true
  docker run -d --name pg-memory --restart unless-stopped \
    -e POSTGRES_USER=opencode -e POSTGRES_PASSWORD=opencode -e POSTGRES_DB=memory \
    -p 5432:5432 postgres:16-alpine >/dev/null || echo "postgres container failed"
else
  echo "docker not available"
fi

step "browserless via docker"
bash "$WORKSPACE/.devcontainer/start-browserless.sh" || echo "browserless start failed"

step "esg-hub MCP (clone + build)"
if [ ! -d "$HOME/esg-hub" ]; then
  git clone --depth 1 https://github.com/simonplmak-cloud/esg-hub "$HOME/esg-hub" 2>/dev/null || echo "esg-hub clone failed"
fi
if [ -d "$HOME/esg-hub/mcp-server" ]; then
  (cd "$HOME/esg-hub/mcp-server" && npm install --silent && npm run build --if-present >/dev/null 2>&1) \
    || echo "esg-hub build failed (check repo layout)"
fi

step "humanity4ai MCP (clone; dist committed)"
if [ ! -d "$HOME/project_human" ]; then
  git clone --depth 1 https://github.com/humanity4ai/project_human "$HOME/project_human" 2>/dev/null || echo "project_human clone failed"
fi

step "bootstrap data tooling"
if [ -f "$WORKSPACE/scripts/bootstrap-tools.sh" ]; then
  bash "$WORKSPACE/scripts/bootstrap-tools.sh" || echo "bootstrap-tools had errors (non-fatal)"
fi

step "global opencode config"
cp "$WORKSPACE/opencode.json" "$HOME/.config/opencode/opencode.json"

step "MCP OAuth (vercel only)"
echo "Attempting non-interactive MCP OAuth for vercel — may require manual follow-up for 2FA."
timeout 30 opencode mcp auth vercel </dev/null >/tmp/mcp-auth-vercel.log 2>&1 &
sleep 5
echo "Vercel OAuth started in background (check /tmp/mcp-auth-vercel.log)."
echo "n8n uses token auth — no OAuth needed."
echo "If vercel auth fails, run manually: opencode mcp auth vercel"

step "done"
echo ""
echo "Next steps:"
echo "  1. Check Vercel OAuth status: grep 'Done\|Error' /tmp/mcp-auth-vercel.log"
echo "  2. If Vercel OAuth failed (expected without browser), run: opencode mcp auth vercel"
echo "  3. n8n uses access token (N8N_MCP_ACCESS_TOKEN) — auto-authenticated"
echo "  4. Restart codespace for FIGMA/SENTRY secrets to propagate"
echo "  5. Start the server:  opencode serve --port 4096 --hostname 0.0.0.0"
