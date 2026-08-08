#!/bin/bash
# inventory-environment.sh — Generate environment variable inventory (names only)
# Output: Markdown table of env vars by category

echo "# Environment Variable Inventory"
echo ""
echo "> Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "> CRITICAL: Names only. Never record values."
echo ""

echo "## OpenCode / AI"
echo ""
echo "| Variable | Value |"
echo "|----------|-------|"
for VAR in DEEPSEEK_API_KEY OPENROUTER_API_KEY GOOGLE_API_KEY MOONSHOT_API_KEY OPENCODE OPENCODE_PID; do
    if [ -n "${!VAR:-}" ]; then
        echo "| $VAR | **present** |"
    else
        echo "| $VAR | missing |"
    fi
done
echo ""

echo "## MCP Secrets"
echo ""
echo "| Variable | Value |"
echo "|----------|-------|"
for VAR in SIMONPLMAK_CLOUD_PAT PERPLEXITY_API_KEY BRAVE_API_KEY BROWSERLESS_TOKEN FIGMA_TOKEN SENTRY_AUTH_TOKEN N8N_MCP_ACCESS_TOKEN; do
    if [ -n "${!VAR:-}" ]; then
        echo "| $VAR | **present** |"
    else
        echo "| $VAR | missing |"
    fi
done
echo ""

echo "## MCP Configuration"
echo ""
echo "| Variable | Value |"
echo "|----------|-------|"
for VAR in DATABASE_URL DB_PATH BROWSERLESS_HOST BROWSERLESS_PORT BROWSERLESS_PROTOCOL; do
    if [ -n "${!VAR:-}" ]; then
        echo "| $VAR | **present** |"
    else
        echo "| $VAR | missing |"
    fi
done
echo ""

echo "## GitHub / Codespaces"
echo ""
echo "| Variable | Value |"
echo "|----------|-------|"
for VAR in GITHUB_TOKEN GITHUB_REPOSITORY GITHUB_USER CODESPACES CODESPACE_NAME GH_TOKEN GITHUB_CODESPACE_TOKEN; do
    if [ -n "${!VAR:-}" ]; then
        echo "| $VAR | **present** |"
    else
        echo "| $VAR | missing |"
    fi
done
echo ""

echo "## Disabled / Legacy"
echo ""
echo "| Variable | Value |"
echo "|----------|-------|"
for VAR in WCAGC_MCP_KEY CONVERTICA_API_KEY SURREAL_PASSWORD VERCEL_ACCESS_TOKEN VERCEL_OIDC_TOKEN; do
    if [ -n "${!VAR:-}" ]; then
        echo "| $VAR | **present** |"
    else
        echo "| $VAR | missing |"
    fi
done
echo ""
