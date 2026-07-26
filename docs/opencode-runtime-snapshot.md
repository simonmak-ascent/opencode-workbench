# OpenCode Runtime Snapshot

> Captured: 2026-07-26
> Purpose: Preserve behavioural configuration at this point in time

## Active Profile

| Setting | Value |
|---------|-------|
| **Model** | `deepseek/deepseek-v4-pro` |
| **Small Model** | `deepseek/deepseek-v4-pro` |
| **Reasoning** | Enabled (via model capability) |
| **LSP** | Enabled |
| **Formatters** | Not explicitly configured (default: disabled) |

## MCP Servers — Runtime Status

| Server | Status | Notes |
|--------|--------|-------|
| context7 | ✅ Active | Remote, docs lookup |
| gh_grep | ✅ Active | Remote, GitHub code search |
| n8n | ✅ Active | Remote, Bearer auth |
| clerk | ✅ Active | Remote, SDK snippets |
| vercel | ⚠️ Active but unauth | OAuth not completed |
| github | ✅ Active | Local, PAT auth |
| perplexity | ❌ Failed (401) | Invalid API key format |
| brave-search | ✅ Active | Local, API key auth |
| postgres | ✅ Active | Local, `memory` database |
| browserless | ✅ Active | Local, Docker container |
| playwright | ✅ Active | Local, Chromium installed |
| figma | ⚠️ Needs restart | Config fixed, old connection closed |
| mermaid | ✅ Active | Local, diagram generation |
| saga | ⚠️ Needs restart | DB_PATH fix applied, old session needs restart |
| echarts | ✅ Active | Local, chart generation |
| shadcn | ✅ Active | Local, PAT auth |
| swagger-testcase | ✅ Active | Local, spec parsing |
| design-system | ⚠️ Needs Storybook | Defaults to localhost:6006 |
| sentry | ✅ Active | Local, token auth |

## Agent Configuration

- **Type**: Default (no custom agents defined)
- **Permission**: Default (no custom permission rules)
- **Skills**: 28 custom skills loaded from `.opencode/skills/`
- **Built-in skill**: `customize-opencode` for OpenCode self-configuration

## Shell Environment

- **Shell**: bash (via codespace)
- **OpenCode binary**: `/home/node/.opencode/bin/opencode`
- **Node version**: 22 (via devcontainer image)
- **npm global prefix**: `/home/node/.npm-global`

## External Repos in Home

| Repo | Path | Purpose |
|------|------|---------|
| esg-hub | `~/esg-hub` | ESG data platform with MCP server |
| project_human | `~/project_human` | Project Human application |
