# Environment Variable Inventory

> Generated: 2026-07-26 | Updated: 2026-07-26 (post-audit) | Host: codespace-workbench
> Purpose: Track every environment variable that affects development behaviour.
> CRITICAL: This file documents names and purposes ONLY. Never record values.

## OpenCode — Active Provider

| Variable | Purpose | Source | Required |
|----------|---------|--------|----------|
| `DEEPSEEK_API_KEY` | DeepSeek LLM provider (primary model: deepseek-v4-pro) | Codespaces Secret | Yes |
| `OPENCODE` | Set by opencode runtime | Runtime | Runtime |
| `OPENCODE_PID` | opencode server PID | Runtime | Runtime |

## MCP Servers — Active

| Variable | Purpose | Source | Required |
|----------|---------|--------|----------|
| `SIMONPLMAK_CLOUD_PAT` | GitHub PAT (github MCP, shadcn MCP) | Codespaces Secret | Yes |
| `PERPLEXITY_API_KEY` | Perplexity API (perplexity-agent-mcp) | Codespaces Secret | Yes (*) |
| `BRAVE_API_KEY` | Brave Search API (brave-search MCP) | Codespaces Secret | Yes |
| `BROWSERLESS_TOKEN` | Browserless auth token | Codespaces Secret | Yes |
| `BROWSERLESS_HOST` | Browserless hostname | devcontainer.json | Yes |
| `BROWSERLESS_PORT` | Browserless port | devcontainer.json | Yes |
| `BROWSERLESS_PROTOCOL` | Browserless protocol | devcontainer.json | Yes |
| `FIGMA_ACCESS_TOKEN` | Figma API (figma-developer-mcp) | Codespaces Secret | Yes |
| `SENTRY_ACCESS_TOKEN` | Sentry API (@sentry/mcp-server) | Codespaces Secret | Yes |
| `DATABASE_URL` | Postgres connection (postgres MCP) | devcontainer.json | Yes |
| `N8N_MCP_ACCESS_TOKEN` | n8n MCP auth token | Codespaces Secret | Yes |
| `DB_PATH` | Saga tracker SQLite database path | devcontainer.json | Yes |

(*) Perplexity key currently invalid — must be regenerated with `pplx-` prefix.

## MCP Servers — Disabled / Unused

| Variable | Purpose | Source | Required |
|----------|---------|--------|----------|
| `WCAGC_MCP_KEY` | WCAGC accessibility MCP | Codespaces Secret | No (disabled) |
| `CONVERTICA_API_KEY` | Convertica MCP | Codespaces Secret | No (disabled) |
| `SURREAL_PASSWORD` | SurrealDB auth | Codespaces Secret | No (disabled) |
| `SURREALDB_URL` | SurrealDB endpoint | Codespaces Secret | No (disabled) |
| `SURREALDB_USER` | SurrealDB username | Codespaces Secret | No (disabled) |
| `SURREALDB_PASS` | SurrealDB password | Codespaces Secret | No (disabled) |
| `SURREALDB_NS` | SurrealDB namespace | Codespaces Secret | No (disabled) |
| `SURREALDB_DB` | SurrealDB database | Codespaces Secret | No (disabled) |

## GitHub / Codespaces (injected by platform)

| Variable | Purpose | Source |
|----------|---------|--------|
| `GH_TOKEN` | GitHub CLI auth | Codespaces |
| `GITHUB_TOKEN` | GitHub API token | Codespaces |
| `GITHUB_CODESPACE_TOKEN` | Codespaces API token | Codespaces |
| `GITHUB_API_URL` | GitHub API URL | Codespaces |
| `GITHUB_GRAPHQL_URL` | GitHub GraphQL URL | Codespaces |
| `GITHUB_SERVER_URL` | GitHub server URL | Codespaces |
| `GITHUB_REPOSITORY` | Current repository | Codespaces |
| `GITHUB_USER` | Current user | Codespaces |
| `CODESPACES` | Codespace indicator | Codespaces |
| `CODESPACE_NAME` | Codespace name | Codespaces |
| `GIT_COMMITTER_NAME` | Git identity | Codespaces |
| `GIT_COMMITTER_EMAIL` | Git identity | Codespaces |
| `CLOUDENV_ENVIRONMENT_ID` | Cloud environment ID | Codespaces |
| `INTERNAL_VSCS_TARGET_URL` | VS Code target URL | Codespaces |

## LLM / AI Providers (detected, varying levels of use)

| Variable | Purpose | Source | Active? |
|----------|---------|--------|---------|
| `DEEPSEEK_API_KEY` | DeepSeek API (active provider) | Codespaces Secret | Yes |
| `KIMI_API_KEY` | Kimi K3 API (previous provider) | Codespaces Secret | No (legacy) |
| `OPENROUTER_API_KEY` | OpenRouter API | Codespaces Secret | No |
| `GOOGLE_API_KEY` | Google AI API | Codespaces Secret | No |
| `VERCEL_ACCESS_TOKEN` | Vercel API token | Codespaces Secret | No |
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

- All API keys and tokens are injected via GitHub Codespaces Secrets
- `devcontainer.json` `remoteEnv` now explicitly declares all required secrets
- Active model changed from `kimi-for-coding/k3` to `deepseek/deepseek-v4-pro` as of 2026-07-26
- No secret values are stored in this repository
