# AI Provider Configuration

> Purpose: AI/LLM provider configurations for OpenCode.

## Active Provider

**DeepSeek** (`deepseek/deepseek-v4-pro`)
- API endpoint: `https://api.deepseek.com/v1`
- Required secret: `DEEPSEEK_API_KEY`
- Configuration: `opencode.json` → `provider.deepseek`

## Available Provider Keys (not configured)

The following API keys are available in the environment but not configured as OpenCode providers:

| Provider | Env Var | Status |
|----------|---------|--------|
| Kimi (Moonshot) | `KIMI_API_KEY` | Previous provider, available as fallback |
| OpenRouter | `OPENROUTER_API_KEY` | Available, not configured |
| Google AI | `GOOGLE_API_KEY` | Available, not configured |

## Adding a New Provider

1. Add the provider configuration to `opencode.json` under `provider`
2. Ensure the API key exists as a SWAS Secret
3. Add the env var to `devcontainer.json` `remoteEnv`
4. Update `docs/architecture/ai-provider-inventory.md`
5. Update `docs/architecture/SWAS-secrets.md`
6. Commit and push
