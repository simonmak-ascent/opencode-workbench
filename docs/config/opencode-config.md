# OpenCode Configuration

> Phase: #2 | Created: 2026-07-27
> Documents the opencode.json configuration and how to maintain it.

## Config Locations

| File | Role | Sync |
|------|------|------|
| `/workspaces/workbench/opencode.json` | **Source of truth** — committed to repo | Edit this one |
| `~/.config/opencode/opencode.json` | **Runtime copy** — used by opencode CLI | Copied from repo on `postCreateCommand` |

**Rule**: Edit the repo copy, then manually sync: `cp opencode.json ~/.config/opencode/opencode.json`

## Model Configuration

```json
{
  "model": "deepseek/deepseek-v4-pro",
  "small_model": "deepseek/deepseek-v4-pro",
  "lsp": true,
  "formatter": true
}
```

## Providers (6 configured)

| Provider | API | Models | Active |
|----------|-----|--------|--------|
| deepseek | `api.deepseek.com/v1` | v4-pro, v4-flash | Primary |
| opencode-go | `api.opencode.ai/v1` | kimi-k3 | Yes |
| perplexity | `api.perplexity.ai` | sonar-pro, sonar-reasoning-pro, sonar | Yes |
| openrouter | `openrouter.ai/api/v1` | claude-sonnet-4-5, gemini-2.5-pro, gpt-5.5 | Yes |
| zen | `zen.opencode.ai/v1` | zen-medium | Yes |
| kimi | `api.moonshot.cn/v1` | kimi-k3 | Yes |

## MCP Servers (19 total, 18 enabled)

### Remote (5)
- context7, gh_grep, clerk, vercel (token auth)

### Local — npm global (11)
- brave-search, postgres, playwright, shadcn, echarts, mermaid, saga (disabled), swagger-testcase, design-system, figma, sentry

### Local — vendored (2)
- perplexity-agent-mcp, browserless-mcp

### Local — binary (1)
- github-mcp-server

## Adding a New MCP Server

1. Install: `npm install -g <package>` or add to `setup.sh`
2. Add to `opencode.json` under `mcp` with proper config
3. If secrets needed: add to `devcontainer.json` `remoteEnv`
4. Document in `docs/architecture/mcp-inventory.md`
5. Sync: `cp opencode.json ~/.config/opencode/opencode.json`
6. Restart opencode

## Secret References

All secrets use `{env:VAR}` syntax. Example:
```json
{ "Authorization": "Bearer {env:YOUR_TOKEN}" }
```

Secrets originate from:
1. the build box Secrets → `devcontainer.json` `remoteEnv`
2. Legacy fallback: `~/.env.workbench` (sourced by `~/.bashrc`)
