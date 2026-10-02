#!/bin/bash
# inventory-mcp.sh — Generate the MCP server inventory from the canonical opencode.json.
# Config-driven: no hardcoded server lists, so it cannot drift from the profile.
set -euo pipefail

REPO_ROOT="${WB_REPO:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
CONFIG="$REPO_ROOT/opencode.json"

echo "# MCP Server Inventory"
echo ""
echo "> Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "> Source: \`opencode.json\` (single source of truth)"
echo ""

python3 - "$CONFIG" <<'PY'
import json, sys

with open(sys.argv[1]) as f:
    cfg = json.load(f)

mcp = cfg.get("mcp", {})

def entry_of(v):
    if v.get("type") == "remote":
        return v.get("url", "")
    cmd = v.get("command", [])
    return " ".join(cmd) if isinstance(cmd, list) else str(cmd)

print("| Server | Type | Enabled | Auth env | Entry |")
print("|--------|------|---------|----------|-------|")
import re
for name, v in sorted(mcp.items()):
    auth = sorted(set(re.findall(r"\{env:([A-Z0-9_]+)\}", json.dumps(v))))
    enabled = "yes" if v.get("enabled", False) else "no"
    print(f"| {name} | {v.get('type','?')} | {enabled} | {', '.join(auth) or '—'} | `{entry_of(v)}` |")

enabled = sum(1 for v in mcp.values() if v.get("enabled", False))
print("")
print(f"Total: {len(mcp)} · enabled: {enabled}")
PY
