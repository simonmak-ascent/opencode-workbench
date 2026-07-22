#!/usr/bin/env bash
# (Re)start the browserless container. Safe to run multiple times.
# Sources ~/.env.workbench for BROWSERLESS_TOKEN if present.
set -uo pipefail
[ -f "$HOME/.env.workbench" ] && { set -a; . "$HOME/.env.workbench"; set +a; }

if ! docker info >/dev/null 2>&1; then
  echo "docker not available"
  exit 0
fi
if [ -z "${BROWSERLESS_TOKEN:-}" ]; then
  echo "skipped: BROWSERLESS_TOKEN unset"
  exit 0
fi
docker rm -f browserless >/dev/null 2>&1 || true
docker run -d --name browserless --restart unless-stopped \
  -e "TOKEN=${BROWSERLESS_TOKEN}" \
  -p 3000:3000 ghcr.io/browserless/chromium >/dev/null \
  && echo "browserless running on :3000"
