# MCP Server Architecture

> Last updated: 2026-07-26

## Summary

**Total:** 22 MCP servers configured
**Active:** 19 (15 local + 4 remote OAuth-authenticated)
**Disabled:** 4 (missing secrets, library-only, or optional)

## Authentication Status

| Server | Type | Auth | Status |
|--------|------|------|--------|
| context7 | remote | none | active |
| gh_grep | remote | none | active |
| n8n | remote | OAuth | active |
| clerk | remote | none | active |
| vercel | remote | OAuth | active |
| github | local binary | PAT | active |
| perplexity | vendored | API key | active |
| brave-search | npm global | API key | active |
| postgres | npm global | URL | active |
| browserless | vendored | token | active |
| playwright | npm global | none | active |
| mermaid | npm global | none | active |
| saga | npm global | none | active |
| echarts | npm global | none | active |
| shadcn | npm global | PAT | active |
| swagger-testcase | npm global | none | active |
| design-system | npm global | none | active |
| figma | npm global | API key | active |
| sentry | npm global | API key | active |
| surrealdb | npm global | credentials | disabled |
| storybook | npm global | n/a | disabled (library) |
| wcagc | npm global | API key | disabled |
| convertica | npm global | API key | disabled |

## Server Categories

### Remote (no local install needed)
- `context7` — documentation search via Context7
- `gh_grep` — GitHub code search via grep.app
- `n8n` — workflow automation (OAuth to simonmak.app.n8n.cloud)
- `clerk` — authentication snippets via Clerk
- `vercel` — deployment management (OAuth to Vercel)

### Local Binary
- `github-mcp-server` — GitHub API interactions
  - Install: download from github/github-mcp-server releases
  - Auth: `GITHUB_PERSONAL_ACCESS_TOKEN` (env var `SIMONPLMAK_CLOUD_PAT`)

### Local npm (global install)
- `server-brave-search` — web search
- `server-postgres` — database access
- `playwright/mcp` — browser automation
- `shadcn-ui-mcp-server` — UI component library
- `mcp-echarts` — chart generation
- `mcp-mermaid` — diagram generation
- `saga-mcp` — project tracking
- `swagger-testcase-mcp` — API testing
- `mcp-design-system-extractor` — design system analysis
- `figma-developer-mcp` — Figma design integration (enabled 2026-07-26)
- `@sentry/mcp-server` — Sentry error monitoring (enabled 2026-07-26)

### Vendored (custom, stored in vendor/)
- `perplexity-agent-mcp` — Perplexity Agent API wrapper
- `browserless-mcp` — Browserless.io automation

### Disabled by Default
- `@storybook/mcp` — library, not a standalone CLI
- `surrealdb-mcp-server` — requires SurrealDB credentials
- `@wcagc/mcp` — requires WCAGC_MCP_KEY
- `convertica-mcp` — requires CONVERTICA_API_KEY

## Required Secrets

| Secret | MCP Servers |
|--------|------------|
| SIMONPLMAK_CLOUD_PAT | github, shadcn |
| PERPLEXITY_API_KEY | perplexity |
| BRAVE_API_KEY | brave-search |
| BROWSERLESS_TOKEN | browserless |
| KIMI_API_KEY | opencode (LLM model) |
| FIGMA_ACCESS_TOKEN | figma |
| SENTRY_ACCESS_TOKEN | sentry |
| DATABASE_URL | postgres |

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│            OpenCode Client                   │
├─────────────────────────────────────────────┤
│  opencode.json (22 MCP server definitions)   │
├──────────┬──────────┬──────────┬────────────┤
│ Remote   │ Local    │ Vendored │ Disabled   │
│ (5)      │ npm (11) │ (2)      │ (4)        │
├──────────┼──────────┼──────────┼────────────┤
│ context7 │ brave    │ perplexity│ surrealdb  │
│ gh_grep  │ postgres │ browserless│ storybook │
│ n8n*     │ playwright│          │ wcagc      │
│ clerk    │ shadcn   │          │ convertica │
│ vercel*  │ echarts  │          │            │
│          │ mermaid  │          │            │
│          │ saga     │          │            │
│          │ swagger  │          │            │
│          │ design   │          │            │
│          │ figma    │          │            │
│          │ sentry   │          │            │
└──────────┴──────────┴──────────┴────────────┘
  * OAuth authenticated
```

## Adding a New MCP Server

1. Choose local vs remote
2. Add to `opencode.json` under `mcp` key
3. If local, add install step to `.devcontainer/setup.sh`
4. Document required secrets in README.md

## Recovery

All MCP server configurations are in `opencode.json`.
All are reinstalled by `.devcontainer/setup.sh` during postCreate.
Secrets must be configured via GitHub Codespaces Secrets.
