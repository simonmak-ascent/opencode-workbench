# Environment Variable Inventory

> Generated: 2026-07-26 | Host: codespace-workbench
> Purpose: Track every environment variable that affects development behaviour.
> CRITICAL: This file documents names and purposes ONLY. Never record values.

## OpenCode

| Variable | Purpose | Source | Required |
|----------|---------|--------|----------|
| `KIMI_API_KEY` | LLM provider auth (kimi-for-coding/k3) | Codespaces Secret | Yes |
| `OPENCODE` | Set by opencode runtime | Runtime | Runtime |
| `OPENCODE_PID` | opencode server PID | Runtime | Runtime |

## MCP Servers

| Variable | Purpose | Source | Required |
|----------|---------|--------|----------|
| `SIMONPLMAK_CLOUD_PAT` | GitHub personal access token (github MCP, shadcn MCP) | Codespaces Secret | Yes |
| `PERPLEXITY_API_KEY` | Perplexity API (perplexity-agent-mcp) | Codespaces Secret | Yes |
| `BRAVE_API_KEY` | Brave Search API (brave-search MCP) | Codespaces Secret | Yes |
| `BROWSERLESS_TOKEN` | Browserless.io auth token | Codespaces Secret | Yes |
| `BROWSERLESS_HOST` | Browserless hostname | devcontainer.json | Yes |
| `BROWSERLESS_PORT` | Browserless port | devcontainer.json | Yes |
| `BROWSERLESS_PROTOCOL` | Browserless protocol (http/https) | devcontainer.json | Yes |
| `FIGMA_ACCESS_TOKEN` | Figma API (figma-developer-mcp) | Codespaces Secret | Yes |
| `SENTRY_ACCESS_TOKEN` | Sentry API (@sentry/mcp-server) | Codespaces Secret | Yes |
| `DATABASE_URL` | Postgres connection string (postgres MCP) | devcontainer.json | Yes |
| `N8N_MCP_ACCESS_TOKEN` | n8n MCP access token | Codespaces Secret | Yes |

## MCP Servers (Optional)

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
| `CODESPACES` | Codespace indicator (true) | Codespaces |
| `CODESPACE_NAME` | Codespace name | Codespaces |
| `GIT_COMMITTER_NAME` | Git identity | Codespaces |
| `GIT_COMMITTER_EMAIL` | Git identity | Codespaces |

## Other LLM / AI (available but not used by current config)

| Variable | Purpose | Source |
|----------|---------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API | Codespaces Secret |
| `OPENROUTER_API_KEY` | OpenRouter API | Codespaces Secret |
| `GOOGLE_API_KEY` | Google AI API | Codespaces Secret |
| `VERCEL_ACCESS_TOKEN` | Vercel API | Codespaces Secret |
| `VERCEL_OIDC_TOKEN` | Vercel OIDC | Runtime |

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

## Notes

- All API keys and tokens are injected via GitHub Codespaces Secrets
- `devcontainer.json` defines platform-level env vars (DATABASE_URL, BROWSERLESS_*)
- The `~/.env.workbench` file is sourced at shell login if present
- No secret values are stored in this repository
