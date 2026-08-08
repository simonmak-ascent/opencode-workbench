# Environment Variables

> Phase: #2 | Created: 2026-07-27
> Every environment variable required by the workflow.

## Required (Critical — workflow fails without)

| Variable | Purpose | Set By |
|----------|---------|--------|
| `DEEPSEEK_API_KEY` | Primary AI model | Codespaces Secret |
| `DATABASE_URL` | PostgreSQL connection | `devcontainer.json` |
| `OPENCODE_API_KEY` | OpenCode Zen + Console Go | Codespaces Secret |
| `SIMONPLMAK_CLOUD_PAT` | GitHub + shadcn MCP auth | Codespaces Secret |

## Required (Operational — MCP servers fail without)

| Variable | Purpose | Set By |
|----------|---------|--------|
| `PERPLEXITY_API_KEY` | Perplexity MCP | Codespaces Secret |
| `BRAVE_API_KEY` | Brave Search MCP | Codespaces Secret |
| `BROWSERLESS_TOKEN` | Browserless MCP + container | Codespaces Secret |
| `N8N_MCP_ACCESS_TOKEN` | n8n MCP | Codespaces Secret |
| `SENTRY_AUTH_TOKEN` | Sentry MCP | Codespaces Secret |
| `FIGMA_TOKEN` | Figma MCP | Codespaces Secret |

## Optional (enhanced functionality)

| Variable | Purpose | Set By |
|----------|---------|--------|
| `VERCEL_ACCESS_TOKEN` | Vercel MCP | Codespaces Secret |
| `OPENROUTER_API_KEY` | Alternative AI models | Codespaces Secret |
| `KIMI_API_KEY` | Alternative provider | Codespaces Secret |

## Non-Secret Configuration

| Variable | Value | Set By |
|----------|-------|--------|
| `DATABASE_URL` | `postgres://opencode:opencode@localhost:5432/memory` | `devcontainer.json` |
| `BROWSERLESS_HOST` | `localhost` | `devcontainer.json` |
| `BROWSERLESS_PORT` | `3000` | `devcontainer.json` |
| `BROWSERLESS_PROTOCOL` | `http` | `devcontainer.json` |
| `DB_PATH` | `/workspaces/codespace-workbench/.saga/.tracker.db` | `devcontainer.json` |

## Secret Flow

```
GitHub Codespaces Secrets → devcontainer.json remoteEnv → Process Environment → {env:VAR} in opencode.json
```

## Bootstrap Fallback

`~/.bashrc` sources `~/.env.workbench` if present (legacy mechanism for secret injection when Codespaces Secrets are unavailable).

## Validation

```bash
# Check critical secrets present
env | grep -E '^(DEEPSEEK_|OPENCODE_|SIMONPLMAK_|DATABASE_URL)'

# Check MCP secrets
env | grep -E '^(PERPLEXITY_|BRAVE_|BROWSERLESS_|N8N_|SENTRY_|FIGMA_)'

# Check config vars
env | grep -E '^(BROWSERLESS_HOST|BROWSERLESS_PORT|BROWSERLESS_PROTOCOL|DB_PATH)'

# Check optional
env | grep -E '^(VERCEL_|OPENROUTER_|KIMI_)'
```
