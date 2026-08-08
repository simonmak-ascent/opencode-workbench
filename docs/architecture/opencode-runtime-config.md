# OpenCode Runtime Configuration

> Generated: 2026-07-27
> Source: `~/.config/opencode/opencode.json` (synced from repo `opencode.json`)

## Active Configuration

| Item | Value |
|------|-------|
| **Primary Model** | `deepseek/deepseek-v4-pro` |
| **Small Model** | `deepseek/deepseek-v4-pro` |
| **LSP** | Enabled |
| **Schema** | `https://opencode.ai/config.json` |

## Provider Configuration

### DeepSeek
- **API**: `https://api.deepseek.com/v1`
- **Key env**: `DEEPSEEK_API_KEY`
- **Source**: Codespaces Secret

## MCP Server Assignments (19 configured, 18 enabled, 1 disabled)

### Remote MCPs (5)
| Server | URL | Auth Method |
|--------|-----|-------------|
| context7 | `https://mcp.context7.com/mcp` | None |
| gh_grep | `https://mcp.grep.app` | None |
| n8n | `https://simonmak.app.n8n.cloud/mcp-server/http` | Bearer token (`N8N_MCP_ACCESS_TOKEN`) |
| clerk | `https://mcp.clerk.com/mcp` | None |
| vercel | `https://mcp.vercel.com` | OAuth |

### Local MCPs (14, 1 disabled)
| Server | Binary/Entry Point | Secrets |
|--------|-------------------|---------|
| github | `/home/node/.local/bin/github-mcp-server` | `SIMONPLMAK_CLOUD_PAT` |
| perplexity | `vendor/perplexity-agent-mcp/index.js` | `PERPLEXITY_API_KEY` |
| brave-search | `@modelcontextprotocol/server-brave-search` | `BRAVE_API_KEY` |
| postgres | `@modelcontextprotocol/server-postgres` | `DATABASE_URL` |
| browserless | `vendor/browserless-mcp/dist/index.js` | `BROWSERLESS_TOKEN` |
| playwright | `@playwright/mcp/cli.js` | None |
| figma | `figma-developer-mcp` | `FIGMA_TOKEN` (mapped to `FIGMA_API_KEY`) |
| mermaid | `mcp-mermaid` | None |
| saga | `saga-mcp` | `DB_PATH` |
| echarts | `mcp-echarts` | None |
| shadcn | `@jpisnice/shadcn-ui-mcp-server` | `SIMONPLMAK_CLOUD_PAT` |
| swagger-testcase | `swagger-testcase-mcp` | None |
| design-system | `mcp-design-system-extractor` | None (needs `STORYBOOK_URL`) |
| sentry | `@sentry/mcp-server` | `SENTRY_AUTH_TOKEN` |

## Recovery Method

1. Clone this repository
2. Codespaces secrets auto-propagate via `devcontainer.json` `remoteEnv`
3. `.devcontainer/setup.sh` installs MCP servers and copies config
4. `opencode.json` is the single source of truth for MCP configuration
5. Runtime copy at `~/.config/opencode/opencode.json` is synced from repo

## Custom Skills

28 custom agent skills defined in `.opencode/skills/` across three domains:
- **Research** (10): spec-writer, competitive-analysis, api-research, tech-stack-eval, codebase-explorer, dependency-audit, architecture-review, content-research, benchmark-research, security-audit
- **Development** (10): component-builder, api-builder, db-schema, auth-flow, responsive-design, state-management, test-writer, perf-optimizer, error-handling, cicd-setup
- **Publishing** (8): changelog-generator, release-manager, cloud-deploy, docker-builder, npm-publisher, docs-generator, semantic-release, post-deploy-monitor
