# MCP Inventory

> Generated: 2026-07-26
> Purpose: Complete inventory of all MCP servers with versions, dependencies, and setup

## Remote MCP Servers

| # | Name | URL | Auth | Version |
|---|------|-----|------|---------|
| 1 | context7 | `https://mcp.context7.com/mcp` | None | N/A (remote) |
| 2 | gh_grep | `https://mcp.grep.app` | None | N/A (remote) |
| 3 | n8n | `https://simonmak.app.n8n.cloud/mcp-server/http` | Bearer (`N8N_MCP_ACCESS_TOKEN`) | N/A (remote) |
| 4 | clerk | `https://mcp.clerk.com/mcp` | None | N/A (remote) |
| 5 | vercel | `https://mcp.vercel.com` | OAuth | N/A (remote) |

## Local MCP Servers

| # | Name | Package | Version | Entry Point | Dependencies | Setup |
|---|------|---------|---------|-------------|--------------|-------|
| 6 | github | `github-mcp-server` | N/A (binary) | `/home/node/.local/bin/github-mcp-server` | Go binary | Downloaded by setup.sh |
| 7 | perplexity | `perplexity-agent-mcp` | 1.0.0 | `vendor/perplexity-agent-mcp/index.js` | `@modelcontextprotocol/sdk` | Vendored, `npm install` by setup.sh |
| 8 | brave-search | `@modelcontextprotocol/server-brave-search` | 0.6.2 | `.npm-global/lib/.../dist/index.js` | Node.js | `npm install -g` |
| 9 | postgres | `@modelcontextprotocol/server-postgres` | 0.6.2 | `.npm-global/lib/.../dist/index.js` | Node.js, Postgres 16 | `npm install -g`, Docker |
| 10 | browserless | `browserless-mcp` (vendored) | N/A | `vendor/browserless-mcp/dist/index.js` | Node.js, Browserless Docker | Vendored, built by setup.sh |
| 11 | playwright | `@playwright/mcp` | 0.0.78 | `.npm-global/lib/.../cli.js` | Node.js, Chromium | `npm install -g`, `npx playwright install chrome` |
| 12 | figma | `figma-developer-mcp` | 0.13.2 | `.npm-global/lib/.../dist/index.js` | Node.js, `@figma/rest-api-spec` | `npm install -g` |
| 13 | mermaid | `mcp-mermaid` | 0.4.1 | `.npm-global/lib/.../build/index.js` | Node.js | `npm install -g` |
| 14 | saga | `saga-mcp` | 1.6.0 | `.npm-global/lib/.../dist/index.js` | Node.js, SQLite | `npm install -g` |
| 15 | echarts | `mcp-echarts` | 0.7.1 | `.npm-global/lib/.../build/index.js` | Node.js | `npm install -g` |
| 16 | shadcn | `@jpisnice/shadcn-ui-mcp-server` | 2.0.0 | `.npm-global/lib/.../build/index.js` | Node.js, GitHub PAT | `npm install -g` |
| 17 | swagger-testcase | `swagger-testcase-mcp` | 1.0.0 | `.npm-global/lib/.../dist/index.js` | Node.js | `npm install -g` |
| 18 | design-system | `mcp-design-system-extractor` | 1.1.1 | `.npm-global/lib/.../dist/index.js` | Node.js | `npm install -g` |
| 19 | sentry | `@sentry/mcp-server` | 0.37.0 | `.npm-global/lib/.../dist/index.js` | Node.js | `npm install -g` |

## Infrastructure Dependencies

| Infrastructure | Type | Port | Setup |
|---------------|------|------|-------|
| PostgreSQL 16 | Docker (`pg-memory`) | 5432 | `docker run` via setup.sh |
| Browserless | Docker (`browserless`) | 3000 | `docker run` via setup.sh |

## Setup Automation

All MCP servers installed by `.devcontainer/setup.sh`:

1. npm-global packages installed via `npm install -g` (line ~45-55)
2. Vendored MCPs copied to `~/.local/bin/` (line ~59-62)
3. Docker containers started (line ~25-35)
4. `opencode.json` copied to `~/.config/opencode/` (line ~15)
5. External repos cloned to `~/` (line ~65-70)
