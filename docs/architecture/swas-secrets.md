# SWAS Secrets Inventory

> Generated: 2026-07-26 | Updated: 2026-07-26 (post-audit)
> Purpose: Track all the SWAS box Secrets required for workstation operation.
> CRITICAL: This file documents secret NAMES and USAGE only. Never record values.

## Required Secrets (Active)

| Secret | Purpose | Used By | Recovery |
|--------|---------|---------|----------|
| `DEEPSEEK_API_KEY` | DeepSeek LLM API (primary model) | OpenCode provider (deepseek/deepseek-v4-pro) | https://platform.deepseek.com/api_keys |
| `SIMONPLMAK_CLOUD_PAT` | GitHub classic PAT (repo scope) | github MCP, shadcn MCP | https://github.com/settings/tokens |
| `PERPLEXITY_API_KEY` | Perplexity Agent API | perplexity-agent-mcp | https://perplexity.ai/settings/api (*) |
| `BRAVE_API_KEY` | Brave Search API | brave-search MCP | https://brave.com/search/api/ |
| `BROWSERLESS_TOKEN` | Browserless auth token | browserless MCP + Docker container | https://browserless.io/account |
| `FIGMA_TOKEN` | Figma Developer API | figma-developer-mcp | https://www.figma.com/settings (Personal Access Tokens) |
| `SENTRY_AUTH_TOKEN` | Sentry API auth token | @sentry/mcp-server | https://sentry.io/settings/account/api/auth-tokens/ |

(*) Perplexity key must start with `pplx-` prefix. Current key has wrong format — regenerate.

## Optional / Alternate Provider Secrets

| Secret | Purpose | Used By | Notes |
|--------|---------|---------|-------|
| `KIMI_API_KEY` | Kimi K3 API (previous primary, now fallback) | OpenCode (alternate provider) | https://platform.moonshot.cn |
| `OPENCODE_API_KEY` | OpenCode Zen managed model service | OpenCode (Zen provider) | https://opencode.ai/auth |

## Optional / Legacy Secrets

| Secret | Purpose | Used By | Notes |
|--------|---------|---------|-------|
| `WCAGC_MCP_KEY` | WCAGC accessibility MCP | @wcagc/mcp (disabled) | Not enabled in opencode.json |
| `CONVERTICA_API_KEY` | Convertica conversion MCP | convertica-mcp (disabled) | Not enabled in opencode.json |
| `SURREAL_URL` | SurrealDB endpoint | surrealdb-mcp-server (disabled) | Not enabled in opencode.json |
| `SURREAL_USERNAME` | SurrealDB username | surrealdb-mcp-server (disabled) | Not enabled in opencode.json |
| `SURREAL_PASSWORD` | SurrealDB password | surrealdb-mcp-server (disabled) | Not enabled in opencode.json |
| `SURREAL_NAMESPACE` | SurrealDB namespace | surrealdb-mcp-server (disabled) | Not enabled in opencode.json |
| `SURREAL_DATABASE` | SurrealDB database | surrealdb-mcp-server (disabled) | Not enabled in opencode.json |
| `OPENROUTER_API_KEY` | OpenRouter API | Not configured | Available in env |
| `GOOGLE_API_KEY` | Google AI API | Not configured | Available in env |
| `VERCEL_ACCESS_TOKEN` | Vercel API token | Not configured (Vercel MCP uses OAuth) | Available in env |

## Non-Secret Env Vars (set in `~/.env.workbench` on SWAS)

| Variable | Value | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | `postgres://opencode:opencode@localhost:5432/memory` | Postgres connection |
| `BROWSERLESS_HOST` | `localhost` | Browserless host |
| `BROWSERLESS_PORT` | `3000` | Browserless port |
| `BROWSERLESS_PROTOCOL` | `http` | Browserless protocol |
| `DB_PATH` | `/workspaces/workbench/.saga/.tracker.db` | Saga tracker database |

## Setup Instructions

Secrets live in `~/.env.workbench` on the SWAS box (sourced by `.bashrc`), never
in the repository:

1. SSH to the SWAS box (`cs ssh` / `ssh workbench`)
2. Populate `~/.env.workbench` with each "Required" secret from the table above
   (`VAR="value"` lines, `chmod 600`)
3. The local `~/.env.opencode` is the source for values — transfer with
   `cs cp <file> remote:/root/.env.workbench` (never commit them)
4. opencode.json references secrets via `{env:VAR}` syntax

## Recovery Verification

```bash
# After SWAS rebuild, verify secrets are present:
env | grep -E '^(DEEPSEEK_|SIMONPLMAK_|PERPLEXITY_|BRAVE_|BROWSERLESS_|SENTRY_|SURREAL_|NPM_)'
```

## Security

- Secrets NEVER stored in repository files
- All references use `{env:SECRET_NAME}` syntax in opencode.json
- `.gitignore` blocks `.env*`, `credentials*`, `secrets*`
- Security scan (2026-07-26): No secrets detected in repo files
