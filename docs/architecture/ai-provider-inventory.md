# AI Provider Inventory

> Generated: 2026-07-26
> Purpose: Complete inventory of every AI/LLM provider used by this workstation
> Recovery: Each provider requires a build box secret or env var for API access

## Active Provider (OpenCode Runtime)

| Provider | Model(s) | Config Key | Secret Name | Recovery |
|----------|----------|------------|-------------|----------|
| **DeepSeek** | `deepseek-v4-pro` (primary), `deepseek-v4-flash` (small) | `DEEPSEEK_API_KEY` | `deepseek` | Generate at https://platform.deepseek.com/api_keys |

## Model Details

| Model | Role | Context Window | Max Output | Reasoning | Cost (input/1M tok) | Cost (output/1M tok) |
|-------|------|---------------|------------|-----------|---------------------|---------------------|
| deepseek-v4-pro | Primary (model) | 1,048,576 | 393,216 | Yes | $0.435 | $0.87 |
| deepseek-v4-flash | Small model fallback | 1,048,576 | 393,216 | Yes | $0.14 | $0.28 |

## MCP-Integrated Providers

| Provider | MCP Server | Secret Required | Status | Notes |
|----------|-----------|----------------|--------|-------|
| **Perplexity** | `perplexity-agent-mcp` (local) | `PERPLEXITY_API_KEY` | ✅ Key regenerated (pending rebuild) | Regenerated 2026-07-26 with `pplx-` prefix. Requires build box rebuild to take effect |
| **Brave Search** | `server-brave-search` (local) | `BRAVE_API_KEY` | ✅ Working | Search API, key format `BSA...` |
| **Sentry** | `@sentry/mcp-server` (local) | `SENTRY_AUTH_TOKEN` | ✅ Working | Key format `sntryu_...` |

## Additional Env-Detected Providers (unconfigured in OpenCode)

| Provider | Env Var Present | Status |
|----------|----------------|--------|
| Google AI | `GOOGLE_API_KEY` | Present, not configured in opencode.json |
| OpenRouter | `OPENROUTER_API_KEY` | Present, not configured in opencode.json |
| Kimi (Moonshot) | `KIMI_API_KEY` | Present, not configured in opencode.json |
| Vercel AI | `VERCEL_ACCESS_TOKEN`, `VERCEL_OIDC_TOKEN` | Present, used by Vercel MCP (remote, OAuth) |

## Recovery Process

1. All provider API keys must exist as **the build box Secrets**
2. They propagate via `devcontainer.json` → `remoteEnv`
3. OpenCode picks them up via `{env:SECRET_NAME}` in `opencode.json`
4. Full secret inventory: see `docs/architecture/secrets.md`

## Status

- **Configured in OpenCode**: DeepSeek (active)
- **Detected but not configured**: Google AI, OpenRouter, Kimi
- **Needs action**: Perplexity (regenerate key)
