#!/usr/bin/env bash
# Workbench self-test wrapper — runs the Node harness.
#
# Usage:
#   bash scripts/selftest/run-selftest.sh                 # all scopes
#   bash scripts/selftest/run-selftest.sh --scope remote  # one class
#   bash scripts/selftest/run-selftest.sh --json          # machine-readable
#
# Exit code is non-zero when any check FAILs (SKIP/WARN do not fail).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
exec node "$ROOT/scripts/selftest/run-selftest.mjs" "$@"
