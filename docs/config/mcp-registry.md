# MCP Registry

> Phase: #2 | Created: 2026-07-27
> Maps MCP servers to tools they provide.

## Registry

| Server | Type | Transport | Auth | Key Tools |
|--------|------|-----------|------|-----------|
| context7 | remote | HTTP | None | resolve-library-id, query-docs |
| gh_grep | remote | HTTP | None | search GitHub code |
| n8n | remote | HTTP | Bearer (N8N_MCP_ACCESS_TOKEN) | workflow CRUD, execution, nodes |
| clerk | remote | HTTP | None | auth snippets, user management |
| vercel | remote | HTTP | Bearer (VERCEL_ACCESS_TOKEN) | deploy, projects, domains, analytics |
| github | local (binary) | stdio | PAT (SIMONPLMAK_CLOUD_PAT) | repos, PRs, issues, commits, code search |
| perplexity | local (vendored) | stdio | PERPLEXITY_API_KEY | ask, research, reason, search |
| brave-search | local (npm) | stdio | BRAVE_API_KEY | web_search, local_search |
| postgres | local (npm) | stdio | DATABASE_URL | query |
| browserless | local (vendored) | stdio | BROWSERLESS_TOKEN | screenshot, pdf, content, function, performance |
| playwright | local (npm) | stdio | None | navigate, click, type, snapshot, screenshot, evaluate |
| figma | local (npm) | HTTP (localhost:3333) | FIGMA_TOKEN | design tokens, components |
| mermaid | local (npm) | stdio | None | generate diagrams |
| saga | local (npm) | stdio | DB_PATH | task tracking (disabled) |
| echarts | local (npm) | stdio | None | charts (bar, line, pie, scatter, etc.) |
| shadcn | local (npm) | stdio | PAT (SIMONPLMAK_CLOUD_PAT) | components, blocks, themes |
| swagger-testcase | local (npm) | stdio | None | test case generation, API analysis |
| design-system | local (npm) | stdio | None | component HTML, CSS tokens, themes |
| sentry | local (npm) | stdio | SENTRY_AUTH_TOKEN | issues, events, traces, analysis |

## Tool Discovery

At runtime, use `list_mcp_resources` and `list_mcp_resource_templates` to discover all available tools. Server names must match exactly as listed above.

## Startup Verification

```bash
# Local MCP servers (verify npm global packages)
npm list -g --depth=0 | grep -E "brave-search|postgres|playwright|shadcn|echarts|mermaid|saga|swagger|design-system|sentry"

# Vendored MCP servers (verify binary presence)
ls ~/.local/bin/perplexity-agent-mcp/index.js
ls ~/.local/bin/browserless-mcp/dist/index.js

# Binary MCP server
which github-mcp-server
```
