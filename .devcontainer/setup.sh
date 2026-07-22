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

step() { echo ""; echo "=== [setup] $1 ==="; }

step "opencode CLI"
if ! command -v opencode >/dev/null 2>&1; then
  curl -fsSL https://opencode.ai/install | bash
fi
opencode --version || echo "opencode install failed (non-fatal for setup)"

step "global npm MCP servers"
npm install -g --silent \
  @modelcontextprotocol/server-brave-search \
  @modelcontextprotocol/server-postgres \
  @playwright/mcp || echo "npm global MCP install had errors"

step "playwright chromium"
npx -y playwright install --with-deps chromium >/dev/null 2>&1 || \
  sudo npx -y playwright install-deps chromium >/dev/null 2>&1 || \
  echo "playwright deps install had errors (non-fatal)"

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
if docker info >/dev/null 2>&1 && [ -n "${BROWSERLESS_TOKEN:-}" ]; then
  docker rm -f browserless >/dev/null 2>&1 || true
  docker run -d --name browserless --restart unless-stopped \
    -e "TOKEN=${BROWSERLESS_TOKEN}" \
    -p 3000:3000 ghcr.io/browserless/chromium >/dev/null || echo "browserless container failed"
else
  echo "skipped (docker unavailable or BROWSERLESS_TOKEN unset)"
fi

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

step "global opencode config"
cp "$WORKSPACE/opencode.json" "$HOME/.config/opencode/opencode.json"

step "done"
echo ""
echo "Next steps:"
echo "  1. Verify secrets are set (Codespaces user secrets): SIMONPLMAK_CLOUD_PAT,"
echo "     PERPLEXITY_API_KEY, BRAVE_API_KEY, BROWSERLESS_TOKEN, KIMI_API_KEY, SURREAL_*"
echo "  2. Start the server:  opencode serve --port 4096 --hostname 0.0.0.0"
echo "  3. Attach your desktop app to the forwarded 4096 URL"
echo "     (or just run 'opencode' for the TUI right here)"
