#!/usr/bin/env bash
set -euo pipefail

# OpenCode Health Check
# Validates provider, secret, plugin, MCP, and startup readiness.
# Exit codes: 0 = all pass, 1 = one or more checks failed.

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAILS=0
WARNS=0
PASSES=0

pass()  { echo -e "  ${GREEN}PASS${NC}  $1"; PASSES=$((PASSES + 1)); }
warn()  { echo -e "  ${YELLOW}WARN${NC}  $1"; WARNS=$((WARNS + 1)); }
fail()  { echo -e "  ${RED}FAIL${NC}  $1"; FAILS=$((FAILS + 1)); }

CONFIG_PROJECT="${CONFIG_PROJECT:-/workspaces/codespace-workbench/opencode.json}"
CONFIG_GLOBAL="${CONFIG_GLOBAL:-$HOME/.config/opencode/opencode.json}"
AUTH_FILE="$HOME/.local/share/opencode/auth.json"
MCP_AUTH_FILE="$HOME/.local/share/opencode/mcp-auth.json"
CONFIG_FILE="$CONFIG_PROJECT"

echo "======================================"
echo " OpenCode Health Check"
echo "======================================"
echo ""

# ──────────────────────────────────────
# 1. CONFIG FILE PRESENCE
# ──────────────────────────────────────
echo "── Config Files ──"

if [ -f "$CONFIG_GLOBAL" ]; then
  pass "global config present: $CONFIG_GLOBAL"
else
  fail "global config missing: $CONFIG_GLOBAL"
fi

if [ -f "$CONFIG_PROJECT" ]; then
  pass "project config present: $CONFIG_PROJECT"
else
  fail "project config missing: $CONFIG_PROJECT"
fi

if [ -f "$CONFIG_GLOBAL" ] && [ -f "$CONFIG_PROJECT" ]; then
  if diff -q "$CONFIG_GLOBAL" "$CONFIG_PROJECT" >/dev/null 2>&1; then
    pass "global and project configs are in sync"
  else
    warn "global and project configs differ"
  fi
fi

echo ""

# ──────────────────────────────────────
# 2. PROVIDER CONFIGURATION
# ──────────────────────────────────────
echo "── Provider Configuration ──"

PROVIDER_COUNT=$(python3 -c "import json; d=json.load(open('$CONFIG_FILE')); print(len(d.get('provider',{})))" 2>/dev/null || echo "0")

if [ "$PROVIDER_COUNT" -gt 0 ]; then
  pass "providers declared: $PROVIDER_COUNT"
else
  fail "no providers declared"
fi

for provider in $(python3 -c "import json; d=json.load(open('$CONFIG_FILE')); print(' '.join(d.get('provider',{}).keys()))" 2>/dev/null); do
  echo "  Provider: $provider"

  API=$(python3 -c "import json; d=json.load(open('$CONFIG_FILE')); print(d['provider']['$provider'].get('api','UNSET'))" 2>/dev/null)
  echo "    endpoint: $API"

  MODEL_COUNT=$(python3 -c "import json; d=json.load(open('$CONFIG_FILE')); print(len(d['provider']['$provider'].get('models',{})))" 2>/dev/null)
  echo "    models: $MODEL_COUNT"

  ENV_VARS=$(python3 -c "import json; d=json.load(open('$CONFIG_FILE')); print(' '.join(d['provider']['$provider'].get('env',[])))" 2>/dev/null)
  for ev in $ENV_VARS; do
    if [ -n "${!ev:-}" ]; then
      pass "env var $ev is set"
    else
      fail "env var $ev is NOT set (required by $provider)"
    fi
  done
done

echo ""

# ──────────────────────────────────────
# 3. MODEL VALIDATION
# ──────────────────────────────────────
echo "── Model Validation ──"

PRIMARY_MODEL=$(python3 -c "import json; d=json.load(open('$CONFIG_FILE')); print(d.get('model','UNSET'))" 2>/dev/null)
SMALL_MODEL=$(python3 -c "import json; d=json.load(open('$CONFIG_FILE')); print(d.get('small_model','UNSET'))" 2>/dev/null)

echo "  primary model: $PRIMARY_MODEL"
echo "  small model:   $SMALL_MODEL"

# Validate primary model exists in provider models
PRIMARY_OK=$(python3 -c "
import json
d=json.load(open('$CONFIG_FILE'))
model_full = d.get('model','')
if '/' in model_full:
    provider, model = model_full.split('/',1)
    prov = d.get('provider',{}).get(provider,{})
    models = prov.get('models',{})
    print('ok' if model in models else 'missing')
else:
    print('invalid_format')
" 2>/dev/null)

if [ "$PRIMARY_OK" = "ok" ]; then
  pass "primary model $PRIMARY_MODEL is declared in provider"
else
  fail "primary model $PRIMARY_MODEL not found in provider models"
fi

SMALL_OK=$(python3 -c "
import json
d=json.load(open('$CONFIG_FILE'))
model_full = d.get('small_model','')
if '/' in model_full:
    provider, model = model_full.split('/',1)
    prov = d.get('provider',{}).get(provider,{})
    models = prov.get('models',{})
    print('ok' if model in models else 'missing')
else:
    print('invalid_format')
" 2>/dev/null)

if [ "$SMALL_OK" = "ok" ]; then
  pass "small model $SMALL_MODEL is declared in provider"
else
  fail "small model $SMALL_MODEL not found in provider models"
fi

echo ""

# ──────────────────────────────────────
# 4. SECRET DEPENDENCIES
# ──────────────────────────────────────
echo "── Secret Dependencies ──"

SECRET_CHECKS=(
  "DEEPSEEK_API_KEY:deepseek provider"
  "OPENCODE_API_KEY:opencode-go provider"
  "N8N_MCP_ACCESS_TOKEN:n8n MCP"
  "SIMONPLMAK_CLOUD_PAT:github + shadcn MCP"
  "PERPLEXITY_API_KEY:perplexity MCP"
  "BRAVE_API_KEY:brave-search MCP"
  "DATABASE_URL:postgres MCP"
  "SENTRY_AUTH_TOKEN:sentry MCP"
  "FIGMA_TOKEN:figma MCP"
  "BROWSERLESS_TOKEN:browserless MCP"
  "VERCEL_ACCESS_TOKEN:vercel MCP"
)

for entry in "${SECRET_CHECKS[@]}"; do
  var="${entry%%:*}"
  label="${entry#*:}"
  if [ -n "${!var:-}" ]; then
    pass "$var is set ($label)"
  else
    fail "$var is NOT set ($label)"
  fi
done

echo ""

# ──────────────────────────────────────
# 5. AUTH FILE SECURITY
# ──────────────────────────────────────
echo "── Auth File Security ──"

if [ -f "$AUTH_FILE" ]; then
  AUTH_SIZE=$(stat -c%s "$AUTH_FILE" 2>/dev/null || echo "0")
  if [ "$AUTH_SIZE" -lt 10 ]; then
    pass "auth.json is clean (no hardcoded secrets)"
  else
    AUTH_KEYS=$(python3 -c "import json; d=json.load(open('$AUTH_FILE')); print(len(d))" 2>/dev/null || echo "?")
    warn "auth.json contains $AUTH_KEYS entries — review for hardcoded keys"
  fi
else
  pass "no auth.json file (no stale secrets)"
fi

if [ -f "$MCP_AUTH_FILE" ]; then
  MCP_AUTH_SIZE=$(stat -c%s "$MCP_AUTH_FILE" 2>/dev/null || echo "0")
  if [ "$MCP_AUTH_SIZE" -lt 10 ]; then
    pass "mcp-auth.json is clean"
  else
    MCP_AUTH_KEYS=$(python3 -c "import json; d=json.load(open('$MCP_AUTH_FILE')); print(len(d))" 2>/dev/null || echo "?")
    warn "mcp-auth.json contains $MCP_AUTH_KEYS OAuth entries"
  fi
fi

echo ""

# ──────────────────────────────────────
# 6. PLUGIN HEALTH
# ──────────────────────────────────────
echo "── Plugin Health ──"

PLUGIN_COUNT=$(python3 -c "import json; d=json.load(open('$CONFIG_FILE')); print(len(d.get('plugin',[])))" 2>/dev/null || echo "0")
echo "  plugins declared: $PLUGIN_COUNT"

PLUGIN_DIR="$HOME/.config/opencode/node_modules"
INSTALLED=0
MISSING=0

if [ "$PLUGIN_COUNT" -gt 0 ]; then
  for plugin in $(python3 -c "import json; d=json.load(open('$CONFIG_FILE')); print(' '.join(d.get('plugin',[])))" 2>/dev/null); do
    if [ -d "$PLUGIN_DIR/$plugin" ]; then
      INSTALLED=$((INSTALLED + 1))
    else
      echo "    missing: $plugin"
      MISSING=$((MISSING + 1))
    fi
  done
fi

if [ "$PLUGIN_COUNT" -eq 0 ]; then
  pass "no external plugins declared (minimal, stable config)"
elif [ "$MISSING" -eq 0 ]; then
  pass "all $INSTALLED plugins installed"
else
  fail "$MISSING of $PLUGIN_COUNT plugins are not installed"
fi

echo ""

# ──────────────────────────────────────
# 7. MCP SERVER HEALTH
# ──────────────────────────────────────
echo "── MCP Server Health ──"

MCP_ENABLED=0
MCP_DISABLED=0
MCP_TIMEOUT_PROBLEMS=0

MCP_KEYS=$(python3 -c "
import json, shlex
d=json.load(open('$CONFIG_FILE'))
mcp = d.get('mcp',{})
for name, cfg in mcp.items():
    enabled = cfg.get('enabled', True)
    mtype = cfg.get('type','unknown')
    timeout = cfg.get('timeout','none')
    if mtype == 'local':
        cmd = cfg.get('command',[])
        # Find the actual script path — first arg that starts with / or ends with .js
        script = ''
        for arg in cmd:
            if arg.startswith('/') or arg.endswith('.js'):
                script = arg
                break
        entry = script
    else:
        entry = cfg.get('url','')
    print(f'{name}|{enabled}|{mtype}|{timeout}|{entry}')
" 2>/dev/null)

MCP_COUNT=0
while IFS='|' read -r name enabled mtype timeout entry; do
  [ -z "$name" ] && continue
  MCP_COUNT=$((MCP_COUNT + 1))

  if [ "$enabled" != "True" ]; then
    MCP_DISABLED=$((MCP_DISABLED + 1))
    continue
  fi

  MCP_ENABLED=$((MCP_ENABLED + 1))

  if [ "$mtype" = "local" ]; then
    if [ -n "$entry" ] && [ -e "$entry" ]; then
      :
    else
      fail "MCP '$name': entry point missing: ${entry:-no script found}"
    fi

    if [ "$timeout" = "none" ]; then
      MCP_TIMEOUT_PROBLEMS=$((MCP_TIMEOUT_PROBLEMS + 1))
      warn "MCP '$name': no timeout configured (could hang startup)"
    fi
  elif [ "$mtype" = "remote" ]; then
    REMOTE_HOST=$(echo "$entry" | sed 's|https\?://||' | cut -d/ -f1)
    # Try bearer token if VERCEL_ACCESS_TOKEN is set and this is the vercel MCP
    AUTH_HEADER=""
    if [ "$name" = "vercel" ] && [ -n "${VERCEL_ACCESS_TOKEN:-}" ]; then
      AUTH_HEADER="-H 'Authorization: Bearer $VERCEL_ACCESS_TOKEN'"
    fi
    if eval curl -s -o /dev/null -w \"%{http_code}\" --connect-timeout 3 --max-time 8 $AUTH_HEADER \"$entry\" >/dev/null 2>&1; then
      :
    else
      warn "MCP '$name': remote unreachable: $REMOTE_HOST"
    fi
  fi
done <<< "$MCP_KEYS"

echo "  total MCP servers: $MCP_COUNT"
echo "  enabled:  $MCP_ENABLED"
echo "  disabled: $MCP_DISABLED"

if [ "$MCP_TIMEOUT_PROBLEMS" -eq 0 ]; then
  pass "all enabled local MCPs have timeouts configured"
else
  :
fi

echo ""

# ──────────────────────────────────────
# 8. DOCKER CONTAINERS
# ──────────────────────────────────────
echo "── Docker Containers ──"

if command -v docker >/dev/null 2>&1; then
  for container in pg-memory browserless; do
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -qx "$container"; then
      pass "container '$container' is running"
    else
      warn "container '$container' is NOT running"
    fi
  done
else
  warn "docker not available — skipping container checks"
fi

echo ""

# ──────────────────────────────────────
# 9. DATABASE HEALTH
# ──────────────────────────────────────
echo "── Database Health ──"

DB_PATH="$HOME/.local/share/opencode/opencode.db"
if [ -f "$DB_PATH" ]; then
  DB_SIZE=$(stat -c%s "$DB_PATH" 2>/dev/null || echo "0")
  DB_SIZE_MB=$((DB_SIZE / 1024 / 1024))
  echo "  size: ${DB_SIZE_MB}MB"

  if sqlite3 "$DB_PATH" "PRAGMA integrity_check;" >/dev/null 2>&1; then
    pass "database integrity OK (${DB_SIZE_MB}MB)"
  else
    fail "database integrity check FAILED"
  fi
else
  warn "no database at $DB_PATH (will be created on first run)"
fi

echo ""

# ──────────────────────────────────────
# 10. FIGMA MCP SERVICE
# ──────────────────────────────────────
echo "── Figma MCP Service ──"

FIGMA_SERVICE_PORT="${FIGMA_MCP_PORT:-3333}"
if curl -s -o /dev/null "http://127.0.0.1:${FIGMA_SERVICE_PORT}/mcp" 2>/dev/null; then
  pass "figma MCP HTTP server running on port $FIGMA_SERVICE_PORT"
else
  warn "figma MCP HTTP server not running on port $FIGMA_SERVICE_PORT — start with: bash scripts/services/figma-mcp.sh start"
fi

echo ""

# ──────────────────────────────────────
# 11. STARTUP READINESS SUMMARY
# ──────────────────────────────────────
echo "── Startup Readiness ──"

if command -v opencode >/dev/null 2>&1; then
  OC_VERSION=$(opencode --version 2>/dev/null || echo "unknown")
  pass "opencode CLI found: $OC_VERSION"
else
  fail "opencode CLI not found in PATH"
fi

OPENCODE_BIN="${OPENCODE_BIN:-$HOME/.opencode/bin/opencode}"
if [ -f "$OPENCODE_BIN" ]; then
  pass "opencode binary exists: $OPENCODE_BIN"
else
  fail "opencode binary not found: $OPENCODE_BIN"
fi

echo ""

# ──────────────────────────────────────
# FINAL SCORE
# ──────────────────────────────────────
TOTAL=$((PASSES + WARNS + FAILS))

echo "======================================"
echo " Summary"
echo "======================================"
echo -e "  ${GREEN}PASS${NC}: $PASSES"
echo -e "  ${YELLOW}WARN${NC}: $WARNS"
echo -e "  ${RED}FAIL${NC}: $FAILS"
echo "  total checks: $TOTAL"
echo ""

if [ "$FAILS" -gt 0 ]; then
  echo -e "${RED}STARTUP READINESS: FAIL${NC} ($FAILS failures)"
  exit 1
elif [ "$WARNS" -gt 0 ]; then
  echo -e "${YELLOW}STARTUP READINESS: WARN${NC} ($WARNS warnings)"
  exit 0
else
  echo -e "${GREEN}STARTUP READINESS: PASS${NC}"
  exit 0
fi
