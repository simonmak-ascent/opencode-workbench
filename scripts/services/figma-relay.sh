#!/usr/bin/env bash
# Talk-to-Figma WebSocket relay launcher (port 3055)
# Bridges the figma-write MCP server (bunx cursor-talk-to-figma-mcp) to the
# Figma Desktop plugin running on the user's local machine.
#
# Requires: bun (installed via bootstrap-tools.sh), repo cloned to $HOME/.local/share/talk-to-figma
#
# Usage:
#   bash scripts/services/figma-relay.sh start
#   bash scripts/services/figma-relay.sh stop
#   bash scripts/services/figma-relay.sh status

set -euo pipefail

PORT="${FIGMA_RELAY_PORT:-3055}"
PID_FILE="/tmp/figma-relay.pid"
LOG_FILE="/tmp/figma-relay.log"
SOCKET_SCRIPT="$HOME/.local/share/talk-to-figma/src/socket.ts"

start_relay() {
  if [ ! -f "$SOCKET_SCRIPT" ]; then
    echo "ERROR: talk-to-figma repo not found at $SOCKET_SCRIPT"
    echo "Install: git clone --depth 1 https://github.com/grab/cursor-talk-to-figma-mcp.git $HOME/.local/share/talk-to-figma"
    return 1
  fi

  if ! command -v bun >/dev/null 2>&1; then
    echo "ERROR: bun not installed. Run: curl -fsSL https://bun.sh/install | bash"
    return 1
  fi

  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Figma relay already running (PID $(cat "$PID_FILE")) on port $PORT"
    return 0
  fi
  rm -f "$PID_FILE"

  echo "Starting Figma relay on port $PORT ..."
  echo "--- $(date): starting figma relay ---" >> "$LOG_FILE"
  nohup bun "$SOCKET_SCRIPT" >> "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  sleep 2
  if kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Figma relay running (PID $(cat "$PID_FILE")) on port $PORT"
  else
    echo "ERROR: relay failed to start; see $LOG_FILE"
    return 1
  fi
}

stop_relay() {
  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    kill "$(cat "$PID_FILE")"
    rm -f "$PID_FILE"
    echo "Figma relay stopped"
  else
    echo "Figma relay not running"
  fi
}

status_relay() {
  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Figma relay running (PID $(cat "$PID_FILE")) on port $PORT"
  else
    echo "Figma relay not running"
  fi
}

case "${1:-}" in
  start)  start_relay ;;
  stop)   stop_relay ;;
  status) status_relay ;;
  *) echo "Usage: $0 {start|stop|status}"; exit 1 ;;
esac
