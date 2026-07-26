# Codespaces Secrets Inventory

> Generated: 2026-07-26
> Purpose: Track all GitHub Codespaces Secrets required for workstation operation.
> CRITICAL: This file documents secret NAMES and USAGE only. Never record values.

## Required Secrets

| Secret | Purpose | Used By | Required | Recovery |
|--------|---------|---------|----------|----------|
| `KIMI_API_KEY` | Kimi K3 LLM authentication | OpenCode (model: kimi-for-coding/k3) | Yes | GitHub Codespaces Secrets → Settings → Codespaces → Secrets |
| `SIMONPLMAK_CLOUD_PAT` | GitHub personal access token (classic, full repo scope) | github MCP (GITHUB_PERSONAL_ACCESS_TOKEN), shadcn MCP (GITHUB_TOKEN) | Yes | GitHub → Settings → Developer settings → Personal access tokens |
| `PERPLEXITY_API_KEY` | Perplexity Agent API | perplexity-agent-mcp MCP | Yes | perplexity.ai → API settings |
| `BRAVE_API_KEY` | Brave Search API | brave-search MCP | Yes | brave.com → Search API |
| `BROWSERLESS_TOKEN` | Browserless.io API token | browserless MCP + browserless Docker container | Yes | browserless.io → Account → API Tokens |
| `FIGMA_ACCESS_TOKEN` | Figma Developer API | figma-developer-mcp MCP | Yes | Figma → Settings → Personal Access Tokens |
| `SENTRY_ACCESS_TOKEN` | Sentry API | @sentry/mcp-server MCP | Yes | Sentry → Settings → User Auth Tokens |
| `N8N_MCP_ACCESS_TOKEN` | n8n MCP server auth | n8n MCP (headers) | Yes | n8n → Settings → API Tokens |

## Optional Secrets

| Secret | Purpose | Used By | Required | Recovery |
|--------|---------|---------|----------|----------|
| `WCAGC_MCP_KEY` | WCAGC accessibility MCP | @wcagc/mcp (disabled by default) | No | wcagc.com API settings |
| `CONVERTICA_API_KEY` | Convertica conversion MCP | convertica-mcp (disabled by default) | No | Convertica API settings |
| `SURREAL_ENDPOINT` | SurrealDB server endpoint | surrealdb-mcp-server (disabled by default) | No | Self-hosted / SurrealDB Cloud |
| `SURREAL_USERNAME` | SurrealDB login | surrealdb-mcp-server (disabled by default) | No | SurrealDB credentials |
| `SURREAL_PASSWORD` | SurrealDB password | surrealdb-mcp-server (disabled by default) | No | SurrealDB credentials |
| `SURREAL_NAMESPACE` | SurrealDB namespace | surrealdb-mcp-server (disabled by default) | No | SurrealDB config |
| `SURREAL_DATABASE` | SurrealDB database | surrealdb-mcp-server (disabled by default) | No | SurrealDB config |
| `DEEPSEEK_API_KEY` | DeepSeek LLM API | Future/alternate OpenCode model | No | DeepSeek API settings |
| `OPENROUTER_API_KEY` | OpenRouter API | Future/alternate OpenCode model | No | openrouter.ai API settings |
| `GOOGLE_API_KEY` | Google AI API | Future/alternate model | No | Google AI Studio |

## Secrets Not Required by Config (Available in Env)

| Secret | Purpose | Notes |
|--------|---------|-------|
| `VERCEL_ACCESS_TOKEN` | Vercel CLI auth | Available but opencode uses OAuth |
| `DATABASE_URL` | Postgres connection | Set in devcontainer.json, not a secret |

## Setup Instructions

All secrets must be configured at:
https://github.com/settings/codespaces/secrets

1. Navigate to Settings → Codespaces → Secrets
2. Add each required secret from the table above
3. Select the `simonplmak-cloud/codespace-workbench` repository
4. Secrets are injected as environment variables on codespace start

## Recovery Flow

1. Create new Codespace from repository
2. Wait for postCreate (~3-5 min)
3. Verify all required secrets are present:
   ```bash
   env | grep -E '^KIMI_|^SIMONPLMAK_|^PERPLEXITY_|^BRAVE_|^BROWSERLESS_|^FIGMA_|^SENTRY_|^N8N_'
   ```
4. Start OpenCode: `opencode serve --port 4096 --hostname 0.0.0.0`
5. Authenticate remote MCPs if needed: `opencode mcp auth vercel`

## Security Notes

- Secrets are NEVER stored in the repository
- All secret references use `{env:SECRET_NAME}` syntax in opencode.json
- The `.gitignore` blocks `.env*`, `credentials*`, `secrets*` files
- GitHub Codespaces injects secrets securely at container runtime
