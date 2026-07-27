#!/usr/bin/env bash
# Figma MCP HTTP server launcher
# The figma-developer-mcp package runs as an HTTP server on port 3333,
# not as a stdio MCP. OpenCode connects to it as a remote MCP endpoint.
#
# Usage:
#   bash scripts/services/figma-mcp.sh start
#   bash scripts/services/figma-mcp.sh stop
#   bash scripts/services/figma-mcp.sh status
#
# Env: FIGMA_ACCESS_TOKEN (required)

set -euo pipefail

PORT="${FIGMA_MCP_PORT:-3333}"
HOST="${FIGMA_MCP_HOST:-127.0.0.1}"
PID_FILE="/tmp/figma-mcp.pid"
LOG_FILE="/tmp/figma-mcp.log"
SERVER_SCRIPT="/home/node/.npm-global/lib/node_modules/figma-developer-mcp/dist/bin.js"

start_figma() {
  if [ ! -f "$SERVER_SCRIPT" ]; then
    echo "ERROR: figma-developer-mcp not found at $SERVER_SCRIPT"
    return 1
  fi

  if [ -z "${FIGMA_ACCESS_TOKEN:-}" ]; then
    echo "ERROR: FIGMA_ACCESS_TOKEN is not set"
    return 1
  fi

  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Figma MCP already running (PID $(cat "$PID_FILE")) on http://${HOST}:${PORT}/mcp"
    return 0
  fi
  rm -f "$PID_FILE"

  echo "Starting Figma MCP server on http://${HOST}:${PORT}/mcp ..."
  echo "--- $(date): starting figma mcp ---" >> "$LOG_FILE"
  FIGMA_API_KEY="$FIGMA_ACCESS_TOKEN" \
  FRAMELINK_PORT="$PORT" \
  FRAMELINK_HOST="$HOST" \
    setsid node "$SERVER_SCRIPT" >> "$LOG_FILE" 2>> "$LOG_FILE" &
  local pid=$!
  echo "$pid" > "$PID_FILE"

  for i in $(seq 1 20); do
    if curl -s -o /dev/null "http://${HOST}:${PORT}/mcp" 2>/dev/null; then
      echo "Figma MCP ready (PID $pid)"
      return 0
    fi
    sleep 0.5
  done

  echo "WARNING: Figma MCP started but not responding after 10s. Check $LOG_FILE"
  return 1
}

stop_figma() {
  if [ -f "$PID_FILE" ]; then
    local pid=$(cat "$PID_FILE")
    if kill -0 "$pid" 2>/dev/null; then
      echo "Stopping Figma MCP (PID $pid)..."
      kill "$pid" 2>/dev/null || true
      rm -f "$PID_FILE"
      echo "Stopped."
    else
      echo "Figma MCP PID $pid not running — cleaning up stale PID file"
      rm -f "$PID_FILE"
    fi
  else
    # Fallback: kill by process name
    pkill -f "figma-developer-mcp" 2>/dev/null && echo "Stopped." || echo "No running Figma MCP found."
  fi
}

status_figma() {
  if curl -s -o /dev/null "http://${HOST}:${PORT}/mcp" 2>/dev/null; then
    if [ -f "$PID_FILE" ]; then
      echo "Figma MCP running (PID $(cat "$PID_FILE")) on http://${HOST}:${PORT}/mcp"
    else
      echo "Figma MCP running on http://${HOST}:${PORT}/mcp (no PID file)"
    fi
    return 0
  else
    echo "Figma MCP not running"
    return 1
  fi
}

case "${1:-}" in
  start)   start_figma ;;
  stop)    stop_figma ;;
  status)  status_figma ;;
  restart) stop_figma; sleep 1; start_figma ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}"
    exit 1
    ;;
esac
