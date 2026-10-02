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

cd /workspaces/workbench

for pattern in "${PATTERNS[@]}"; do
    # Scan working tree (not HEAD) — this is a pre-commit/pre-push scan
    matches=$(grep -rn -E "$pattern" "$WORKSPACE" --include='*.json' --include='*.sh' --include='*.md' --include='*.yaml' --include='*.yml' --include='*.ts' --include='*.js' --include='*.py' --exclude-dir='.git' --exclude-dir='node_modules' --exclude-dir='.saga' --exclude-dir='.opencode' 2>/dev/null || true)
    if [ -n "$matches" ]; then
        # Filter out documentation that mentions patterns as examples or redacted keys
        filtered=$(echo "$matches" | grep -v "Secret patterns.*None detected" | grep -v "secret patterns" | grep -v "secret.*pattern" | grep -vi "REDACTED" | grep -vi "redacted" | grep -v '\.\.\.' || true)
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
CRED_FILES=$(find "$WORKSPACE" -maxdepth 5 -type f \( -name '.env' -o -name '.env.*' -o -name '*.pem' -o -name '*.key' -o -name 'id_rsa' -o -name 'id_ed25519' -o -name 'credentials.json' -o -name 'credentials.yaml' -o -name 'secrets.yaml' -o -name 'secrets.env' \) -not -path '*/.git/*' -not -path '*/node_modules/*' -not -path '*.env.example' 2>/dev/null || true)
if [ -n "$CRED_FILES" ]; then
    echo "⚠️  CREDENTIAL FILES FOUND:"
    echo "$CRED_FILES"
    echo ""
    FOUND=$((FOUND + 1))
fi

echo "---"
if [ $FOUND -eq 0 ]; then
    echo "✅ Working tree scan clean."
else
    echo "❌ WORKING TREE SCAN FAILED — $FOUND potential secret(s) detected."
fi

# Git history scan (checks for keys that were redacted but persist in history)
echo ""
echo "=== Git History Scan ==="
HIST_FOUND=0
for pattern in "${PATTERNS[@]}"; do
    hist_matches=$(git log --all -p --format="" 2>/dev/null | grep -oE "$pattern" | sort -u || true)
    if [ -n "$hist_matches" ]; then
        echo "⚠️  PATTERN IN GIT HISTORY: $pattern"
        echo "$hist_matches"
        echo ""
        HIST_FOUND=$((HIST_FOUND + 1))
    fi
done

if [ $HIST_FOUND -eq 0 ]; then
    echo "✅ Git history scan clean."
else
    echo "❌ GIT HISTORY SCAN FAILED — $HIST_FOUND pattern(s) found in history."
    echo "Keys in history persist even after redaction. Rotate them and consider git filter-branch."
fi

echo ""
echo "---"
if [ $FOUND -eq 0 ] && [ $HIST_FOUND -eq 0 ]; then
    echo "✅ OVERALL SECURITY SCAN CLEAN"
    exit 0
else
    echo "❌ OVERALL SECURITY SCAN FAILED"
    exit 1
fi
