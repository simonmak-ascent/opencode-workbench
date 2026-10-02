# MCP Server Architecture

> Last updated: 2026-07-26

## Summary

**Total:** 22 MCP servers configured
**Active:** 19 enabled (17 active local/npm + 1 local binary + 2 remote OAuth, some remote no-auth)
**Disabled:** 4 (missing secrets, library-only, or optional)

## Authentication Status

| Server | Type | Auth | Status |
|--------|------|------|--------|
| context7 | remote | none | active |
| gh_grep | remote | none | active |
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
| sentry | npm global | API key | active |
| surrealdb | npm global | credentials | disabled |
| storybook | npm global | n/a | disabled (library) |
| wcagc | npm global | API key | disabled |
| convertica | npm global | API key | disabled |

## Server Categories

### Remote (no local install needed)
- `context7` — documentation search via Context7
- `gh_grep` — GitHub code search via grep.app
- `clerk` — authentication snippets via Clerk
- `vercel` — deployment management (OAuth to Vercel)

### Local Binary
- `github-mcp-server` — GitHub API interactions
  - Install: download from github/github-mcp-server releases
  - Auth: `GITHUB_PERSONAL_ACCESS_TOKEN` (env var `SIMONPLMAK_CLOUD_PAT`)

### Local npm (global install, all enabled)
| Server | Package | Version | Auth |
|--------|---------|---------|------|
| Brave Search | @modelcontextprotocol/server-brave-search | 0.6.2 | BRAVE_API_KEY |
| Postgres | @modelcontextprotocol/server-postgres | 0.6.2 | DATABASE_URL |
| Playwright | @playwright/mcp | 0.0.78 | none |
| Shadcn UI | @jpisnice/shadcn-ui-mcp-server | 2.0.0 | GITHUB_TOKEN |
| ECharts | mcp-echarts | 0.7.1 | none |
| Mermaid | mcp-mermaid | 0.4.1 | none |
| Saga | saga-mcp | 1.6.0 | none |
| Swagger Testcase | swagger-testcase-mcp | 1.0.0 | none |
| Design System | mcp-design-system-extractor | 1.1.1 | none |
| Sentry | @sentry/mcp-server | 0.37.0 | SENTRY_AUTH_TOKEN |

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
| MOONSHOT_API_KEY | opencode (LLM model) |
| SENTRY_AUTH_TOKEN | sentry |
| DATABASE_URL | postgres |

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│            OpenCode Client                   │
├─────────────────────────────────────────────┤
│  opencode.json (21 MCP server definitions)   │
├──────────┬──────────┬──────────┬────────────┤
│ Remote   │ Local    │ Vendored │ Disabled   │
│ (4)      │ npm (11) │ (2)      │ (4)        │
├──────────┼──────────┼──────────┼────────────┤
│ context7 │ brave    │ perplexity│ surrealdb  │
│ gh_grep  │ postgres │ browserless│ storybook │
│          │ playwright│          │ wcagc      │
│ clerk    │ shadcn   │          │ convertica │
│ vercel*  │ echarts  │          │            │
│          │ mermaid  │          │            │
│          │ saga     │          │            │
│          │ swagger  │          │            │
│          │ design   │          │            │
│          │ v0       │          │            │
│          │ sentry   │          │            │
└──────────┴──────────┴──────────┴────────────┘
  * OAuth authenticated
```

## Adding a New MCP Server

1. Choose local vs remote vs vendored
2. Add entry to `opencode.json` under `mcp` key
3. If local npm: add `npm install -g <package>` to `.devcontainer/setup.sh`
4. If vendored: add source to `vendor/` and copy to `~/.local/bin/` in setup.sh
5. If binary: add download step to `.devcontainer/setup.sh`
6. If auth required: add secret to `docs/SWAS-secrets.md`
7. Update `configs/mcp/mcp-inventory.json`
8. Update `docs/software-inventory.md`

## Recovery

All MCP server configurations are in `opencode.json`.
All are reinstalled by `.devcontainer/setup.sh` during postCreate.
Secrets must be configured via the SWAS box Secrets.

## Related Documentation

- `docs/software-inventory.md` — Full inventory with versions
- `docs/environment-inventory.md` — Environment variable map
- `docs/SWAS-secrets.md` — Secrets management
- `docs/recovery-gap-analysis.md` — Disaster recovery gaps
- `configs/mcp/mcp-inventory.json` — Machine-readable inventory
