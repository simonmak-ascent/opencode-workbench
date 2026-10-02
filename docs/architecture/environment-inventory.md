# Environment Variable Inventory

> Generated: 2026-07-26 | Updated: 2026-07-26 (post-audit) | Host: workbench
> Purpose: Track every environment variable that affects development behaviour.
> CRITICAL: This file documents names and purposes ONLY. Never record values.

## OpenCode — Active Provider

| Variable | Purpose | Source | Required |
|----------|---------|--------|----------|
| `DEEPSEEK_API_KEY` | DeepSeek LLM provider (primary model: deepseek-v4-pro) | SWAS Secret | Yes |
| `OPENCODE_API_KEY` | OpenCode Zen managed model service | SWAS Secret | No (alternate) |
| `OPENCODE` | Set by opencode runtime | Runtime | Runtime |
| `OPENCODE_PID` | opencode server PID | Runtime | Runtime |

## MCP Servers — Active

| Variable | Purpose | Source | Required |
|----------|---------|--------|----------|
| `SIMONPLMAK_CLOUD_PAT` | GitHub PAT (github MCP, shadcn MCP) | SWAS Secret | Yes |
| `PERPLEXITY_API_KEY` | Perplexity API (perplexity-agent-mcp) | SWAS Secret | Yes (*) |
| `BRAVE_API_KEY` | Brave Search API (brave-search MCP) | SWAS Secret | Yes |
| `BROWSERLESS_TOKEN` | Browserless auth token | SWAS Secret | Yes |
| `BROWSERLESS_HOST` | Browserless hostname | devcontainer.json | Yes |
| `BROWSERLESS_PORT` | Browserless port | devcontainer.json | Yes |
| `BROWSERLESS_PROTOCOL` | Browserless protocol | devcontainer.json | Yes |
| `FIGMA_TOKEN` | Figma API (figma-developer-mcp) | SWAS Secret | Yes |
| `SENTRY_AUTH_TOKEN` | Sentry API (@sentry/mcp-server) | SWAS Secret | Yes |
| `DATABASE_URL` | Postgres connection (postgres MCP) | devcontainer.json | Yes |
| `DB_PATH` | Saga tracker SQLite database path | devcontainer.json | Yes |

(*) Perplexity key regenerated 2026-07-26 with `pplx-` prefix — requires SWAS rebuild.

## MCP Servers — Disabled / Unused

| Variable | Purpose | Source | Required |
|----------|---------|--------|----------|
| `WCAGC_MCP_KEY` | WCAGC accessibility MCP | SWAS Secret | No (disabled) |
| `CONVERTICA_API_KEY` | Convertica MCP | SWAS Secret | No (disabled) |
| `SURREAL_PASSWORD` | SurrealDB auth | SWAS Secret | No (disabled) |
| `SURREALDB_URL` | SurrealDB endpoint | SWAS Secret | No (disabled) |
| `SURREALDB_USER` | SurrealDB username | SWAS Secret | No (disabled) |
| `SURREALDB_PASS` | SurrealDB password | SWAS Secret | No (disabled) |
| `SURREALDB_NS` | SurrealDB namespace | SWAS Secret | No (disabled) |
| `SURREALDB_DB` | SurrealDB database | SWAS Secret | No (disabled) |

## GitHub / SWAS (injected by platform)

| Variable | Purpose | Source |
|----------|---------|--------|
| `GH_TOKEN` | GitHub CLI auth | SWAS |
| `GITHUB_TOKEN` | GitHub API token | SWAS |
| `GITHUB_CODESPACE_TOKEN` | GitHub Codespaces API token (unset on SWAS) | GitHub |
| `GITHUB_API_URL` | GitHub API URL | SWAS |
| `GITHUB_GRAPHQL_URL` | GitHub GraphQL URL | SWAS |
| `GITHUB_SERVER_URL` | GitHub server URL | SWAS |
| `GITHUB_REPOSITORY` | Current repository | SWAS |
| `GITHUB_USER` | Current user | SWAS |
| `CODESPACES` | GitHub Codespaces indicator (unset on SWAS) | GitHub |
| `CODESPACE_NAME` | GitHub Codespaces name (unset on SWAS) | GitHub |
| `GIT_COMMITTER_NAME` | Git identity | SWAS |
| `GIT_COMMITTER_EMAIL` | Git identity | SWAS |
| `CLOUDENV_ENVIRONMENT_ID` | Cloud environment ID | SWAS |
| `INTERNAL_VSCS_TARGET_URL` | VS Code target URL | SWAS |

## LLM / AI Providers (detected, varying levels of use)

| Variable | Purpose | Source | Active? |
|----------|---------|--------|---------|
| `DEEPSEEK_API_KEY` | DeepSeek API (active provider) | SWAS Secret | Yes |
| `KIMI_API_KEY` | Kimi K3 API (previous provider) | SWAS Secret | No (legacy) |
| `OPENROUTER_API_KEY` | OpenRouter API | SWAS Secret | No |
| `GOOGLE_API_KEY` | Google AI API | SWAS Secret | No |
| `VERCEL_ACCESS_TOKEN` | Vercel API token | SWAS Secret | No |
| `VERCEL_OIDC_TOKEN` | Vercel OIDC token | Runtime | No |

## Shell & Environment

| Variable | Purpose |
|----------|---------|
| `SHELL` | Default shell (/bin/bash) |
| `HOME` | Home directory (/home/node) |
| `PATH` | Executable search path |
| `NODE_VERSION` | Node.js version |
| `NVM_DIR` | nvm directory |
| `YARN_VERSION` | Yarn version |
| `TERM` | Terminal type |
| `SSH_TTY` | SSH session indicator |
| `DOCKER_BUILDKIT` | Docker BuildKit enable |
| `SURREAL_PASSWORD` | SurrealDB password (in env but db disabled) |

## Notes

- All API keys and tokens are injected via the SWAS box Secrets
- `devcontainer.json` `remoteEnv` now explicitly declares all required secrets
- Active model changed from `kimi-for-coding/k3` to `deepseek/deepseek-v4-pro` as of 2026-07-26
- No secret values are stored in this repository
