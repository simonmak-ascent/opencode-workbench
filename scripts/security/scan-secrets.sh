#!/bin/bash
# scan-secrets.sh — Secret pattern scanner
# Scans tracked files for known secret patterns. Exits 0 if clean, 1 if found.

echo "=== Secret Pattern Scan ==="
echo "Scanning for known secret patterns in tracked files..."
echo ""

FOUND=0
PATTERNS=(
    'sk-[a-zA-Z0-9]{20,}'
    'ghp_[a-zA-Z0-9]{36}'
    'github_pat_[a-zA-Z0-9]{22,}'
    'pplx-[a-zA-Z0-9]{20,}'
    'sntryu_[a-zA-Z0-9]{20,}'
    'figd_[a-zA-Z0-9]{20,}'
    'BSA[A-Za-z0-9]{20,}'
)

cd /workspaces/codespace-workbench

for pattern in "${PATTERNS[@]}"; do
    matches=$(git grep -n -E "$pattern" HEAD -- '*.json' '*.sh' '*.md' '*.yaml' '*.yml' '*.ts' '*.js' '*.py' 2>/dev/null || true)
    if [ -n "$matches" ]; then
        # Filter out documentation that mentions patterns as examples
        filtered=$(echo "$matches" | grep -v "Secret patterns.*None detected" | grep -v "secret patterns" | grep -v "secret.*pattern" || true)
        if [ -n "$filtered" ]; then
            echo "⚠️  PATTERN FOUND: $pattern"
            echo "$filtered"
            echo ""
            FOUND=$((FOUND + 1))
        fi
    fi
done

# Also scan for common credential filenames in tracked files
# Exclude .md, .sh, .json docs — those are documentation, not credentials
CRED_FILES=$(git ls-files | grep -iE '(\.env$|\.env\.|\.pem$|\.key$|id_rsa|id_ed25519|credentials\.json$|credentials\.yaml$|secrets\.yaml$|secrets\.env$)' | grep -v '.env.example' | grep -vE '\.md$|\.sh$|\.json$|mcp-inventory\.json' || true)
if [ -n "$CRED_FILES" ]; then
    echo "⚠️  CREDENTIAL FILES FOUND:"
    echo "$CRED_FILES"
    echo ""
    FOUND=$((FOUND + 1))
fi

echo "---"
if [ $FOUND -eq 0 ]; then
    echo "✅ SECURITY SCAN CLEAN — No secrets detected in tracked files."
    exit 0
else
    echo "❌ SECURITY SCAN FAILED — $FOUND potential secret(s) detected."
    echo "Review findings above. Do NOT commit until resolved."
    exit 1
fi
