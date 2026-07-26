# Codespaces Secrets Inventory

> Generated: 2026-07-26 | Updated: 2026-07-26 (post-audit)
> Purpose: Track all GitHub Codespaces Secrets required for workstation operation.
> CRITICAL: This file documents secret NAMES and USAGE only. Never record values.

## Required Secrets (Active)

| Secret | Purpose | Used By | Recovery |
|--------|---------|---------|----------|
| `DEEPSEEK_API_KEY` | DeepSeek LLM API (primary model) | OpenCode provider (deepseek/deepseek-v4-pro) | https://platform.deepseek.com/api_keys |
| `SIMONPLMAK_CLOUD_PAT` | GitHub classic PAT (repo scope) | github MCP, shadcn MCP | https://github.com/settings/tokens |
| `PERPLEXITY_API_KEY` | Perplexity Agent API | perplexity-agent-mcp | https://perplexity.ai/settings/api (*) |
| `BRAVE_API_KEY` | Brave Search API | brave-search MCP | https://brave.com/search/api/ |
| `BROWSERLESS_TOKEN` | Browserless auth token | browserless MCP + Docker container | https://browserless.io/account |
| `FIGMA_ACCESS_TOKEN` | Figma Developer API | figma-developer-mcp | https://www.figma.com/settings (Personal Access Tokens) |
| `SENTRY_ACCESS_TOKEN` | Sentry API auth token | @sentry/mcp-server | https://sentry.io/settings/account/api/auth-tokens/ |
| `N8N_MCP_ACCESS_TOKEN` | n8n MCP server auth | n8n MCP (Bearer header) | n8n → Settings → API |
| `KIMI_API_KEY` | Kimi K3 API (previous model, fallback) | OpenCode (alternate provider) | https://platform.moonshot.cn |

(*) Perplexity key must start with `pplx-` prefix. Current key has wrong format — regenerate.

## Optional / Legacy Secrets

| Secret | Purpose | Used By | Notes |
|--------|---------|---------|-------|
| `WCAGC_MCP_KEY` | WCAGC accessibility MCP | @wcagc/mcp (disabled) | Not enabled in opencode.json |
| `CONVERTICA_API_KEY` | Convertica conversion MCP | convertica-mcp (disabled) | Not enabled in opencode.json |
| `SURREAL_ENDPOINT` | SurrealDB endpoint | surrealdb-mcp-server (disabled) | Not enabled in opencode.json |
| `SURREAL_USERNAME` | SurrealDB username | surrealdb-mcp-server (disabled) | Not enabled in opencode.json |
| `SURREAL_PASSWORD` | SurrealDB password | surrealdb-mcp-server (disabled) | Not enabled in opencode.json |
| `SURREAL_NAMESPACE` | SurrealDB namespace | surrealdb-mcp-server (disabled) | Not enabled in opencode.json |
| `SURREAL_DATABASE` | SurrealDB database | surrealdb-mcp-server (disabled) | Not enabled in opencode.json |
| `OPENROUTER_API_KEY` | OpenRouter API | Not configured | Available in env |
| `GOOGLE_API_KEY` | Google AI API | Not configured | Available in env |
| `VERCEL_ACCESS_TOKEN` | Vercel API token | Not configured (Vercel MCP uses OAuth) | Available in env |

## Non-Secret Env Vars (set in devcontainer.json)

| Variable | Value | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | `postgres://opencode:opencode@localhost:5432/memory` | Postgres connection |
| `BROWSERLESS_HOST` | `localhost` | Browserless host |
| `BROWSERLESS_PORT` | `3000` | Browserless port |
| `BROWSERLESS_PROTOCOL` | `http` | Browserless protocol |
| `DB_PATH` | `/workspaces/codespace-workbench/.saga/.tracker.db` | Saga tracker database |

## Setup Instructions

Configure at: https://github.com/settings/codespaces/secrets

1. Navigate to Settings → Codespaces → Secrets
2. Add each "Required" secret from the table above
3. Scope to `simonplmak-cloud/codespace-workbench` repository
4. Secrets injected as environment variables on codespace start

## Recovery Verification

```bash
# After codespace rebuild, verify secrets are present:
env | grep -E '^(DEEPSEEK_|SIMONPLMAK_|PERPLEXITY_|BRAVE_|BROWSERLESS_|FIGMA_|SENTRY_|N8N_)'
```

## Security

- Secrets NEVER stored in repository files
- All references use `{env:SECRET_NAME}` syntax in opencode.json
- `.gitignore` blocks `.env*`, `credentials*`, `secrets*`
- Security scan (2026-07-26): No secrets detected in repo files
