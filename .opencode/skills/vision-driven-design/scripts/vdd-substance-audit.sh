#!/usr/bin/env bash
# VDD Substance Audit — Scans artifacts and flags low-substance patterns.
# Usage: ./scripts/vdd-substance-audit.sh [vdd/]

set -euo pipefail
DIR="${1:-vdd}"
issues=0

echo "=== VDD Substance Audit ==="
echo ""

# G1: Strategy pillars must cite research
echo "[G1] Strategy pillar research citations:"
if [ -f "$DIR/strategy.md" ]; then
  pillars=$(grep -c "^### Pillar" "$DIR/strategy.md" 2>/dev/null || echo 0)
  cited=$(grep -c "Research Finding\*\*:" "$DIR/strategy.md" 2>/dev/null || echo 0)
  echo "  Pillars: $pillars, With citations: $cited"
  if [ "$pillars" -gt "$cited" ]; then
    echo "  ⚠ SUBSTANCE FAIL: $((pillars - cited)) pillar(s) without research citation"
    issues=$((issues+1))
  else
    echo "  ✅ PASS"
  fi
fi

# G3: Specs must have ≥1 MUST AC
echo ""
echo "[G3] Spec MUST AC coverage:"
for spec in $(find "$DIR/specs" -name spec.md 2>/dev/null); do
  must_count=$(grep -c "\[MUST\]" "$spec" 2>/dev/null || echo 0)
  echo "  $spec: $must_count MUST AC(s)"
  if [ "$must_count" -eq 0 ]; then
    echo "  ⚠ SUBSTANCE FAIL: Spec has zero MUST acceptance criteria"
    issues=$((issues+1))
  fi
done
if [ -z "$(find "$DIR/specs" -name spec.md 2>/dev/null)" ]; then
  echo "  (no spec files found — skip)"
fi

# G2: Tactical action items must be concrete
echo ""
echo "[G2] Tactical action item concreteness:"
if [ -f "$DIR/tactics.md" ]; then
  vague=$(grep -c 'Improve\|Enhance\|Better\|Optimize\|Clean up\|Fix\|Refactor' "$DIR/tactics.md" 2>/dev/null || echo 0)
  echo "  Vague action items found: $vague"
  if [ "$vague" -gt 0 ]; then
    echo "  ⚠ SUBSTANCE WARN: $vague action item(s) use vague verbs (Improve, Enhance, etc.)"
  else
    echo "  ✅ PASS"
  fi
fi

# G6: Recent commits must change behavior
echo ""
echo "[G6] Commit substance (last 10 commits):"
git log --oneline -10 2>/dev/null | while read -r line; do
  echo "  $line"
done
comment_only=$(git log --oneline -10 2>/dev/null | grep -ciE '^(chore|style|docs).*(comment|format|whitespace|typo|cleanup)' 2>/dev/null || echo 0)
if [ "$comment_only" -gt 3 ]; then
  echo "  ⚠ SUBSTANCE WARN: $comment_only of last 10 commits may be cosmetic-only"
fi

echo ""
echo "=== Audit Complete: $issues substance failure(s) ==="
if [ "$issues" -gt 0 ]; then
  echo "SUBSTANCE GATE: FAIL ($issues issue(s))"
  exit 1
else
  echo "SUBSTANCE GATE: PASS"
fi
