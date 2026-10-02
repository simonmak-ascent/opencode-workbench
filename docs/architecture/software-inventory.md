# Software Inventory

> Generated: 2026-07-26 | build box: opencode-workbench
> Captures exact versions. Update when tools are added, removed, or upgraded.

## Core Platform

| Tool | Version | Purpose | Install Method |
|------|---------|---------|---------------|
| Debian | 13 (trixie) | OS | the build box base |
| Node.js | 22.23.1 | JS runtime | devcontainer image |
| npm | 10.9.8 | Package manager | devcontainer image |
| Python | 3.13.5 | Python runtime | devcontainer image |
| Docker | 29.6.2 | Container runtime | docker-in-docker feature |
| Docker Compose | 5.3.1 | Multi-container | docker-in-docker feature |
| Git | 2.55.0 | Version control | devcontainer image |
| GitHub CLI | 2.96.0 | GitHub automation | devcontainer feature |
| SSHd | - | Remote access | devcontainer feature |

## AI / LLM Tooling

| Tool | Version | Purpose | Install Method |
|------|---------|---------|---------------|
| OpenCode CLI | 1.18.5 | AI coding assistant | curl install script (setup.sh) |

## CLI Tools

| Tool | Version | Purpose | Install Method |
|------|---------|---------|---------------|
| GitHub CLI | 2.96.0 | GitHub automation | devcontainer feature |

## Browsers

| Tool | Version | Purpose | Install Method |
|------|---------|---------|---------------|
| Chromium (Playwright) | latest | Playwright/browserless automation | npx playwright install (setup.sh) |

## Data Processing

| Tool | Version | Purpose | Install Method |
|------|---------|---------|---------------|
| Pandoc | 3.1.11.1 | Document conversion | apt (bootstrap-tools.sh) |
| jq | 1.7.1 | JSON processing | apt (bootstrap-tools.sh) |
| Miller (mlr) | 6.13.0 | Structured data CLI | apt (bootstrap-tools.sh) |
| SQLite | 3.46.1 | Embedded database | apt (bootstrap-tools.sh) |
| xmlstarlet | latest | XML CLI tool | apt (bootstrap-tools.sh) |

## MCP Servers (npm global)

| Server | Package | Version | Enabled | Auth Required |
|--------|---------|---------|---------|--------------|
| Brave Search | @modelcontextprotocol/server-brave-search | 0.6.2 | Yes | BRAVE_API_KEY |
| Postgres | @modelcontextprotocol/server-postgres | 0.6.2 | Yes | DATABASE_URL |
| Playwright | @playwright/mcp | 0.0.78 | Yes | No |
| Shadcn UI | @jpisnice/shadcn-ui-mcp-server | 2.0.0 | Yes | GITHUB_TOKEN |
| ECharts | mcp-echarts | 0.7.1 | Yes | No |
| Mermaid | mcp-mermaid | 0.4.1 | Yes | No |
| Saga | saga-mcp | 1.6.0 | Yes | No |
| Swagger Testcase | swagger-testcase-mcp | 1.0.0 | Yes | No |
| Design System | mcp-design-system-extractor | 1.1.1 | Yes | No |
| Figma | figma-developer-mcp | 0.13.2 | Yes | FIGMA_TOKEN |
| Sentry | @sentry/mcp-server | 0.37.0 | Yes | SENTRY_AUTH_TOKEN |

## MCP Servers (npm global, disabled)

| Server | Package | Version | Reason |
|--------|---------|---------|--------|
| SurrealDB | surrealdb-mcp-server | 0.2.0 | Requires SURREALDB_* vars |
| Storybook | @storybook/mcp | 0.8.0 | Library, not standalone CLI |
| WCAGC | @wcagc/mcp | 0.3.0 | Requires WCAGC_MCP_KEY |
| Convertica | convertica-mcp | 0.1.3 | Requires CONVERTICA_API_KEY |

## MCP Servers (remote)

| Server | URL | Auth |
|--------|-----|------|
| context7 | https://mcp.context7.com/mcp | None |
| gh_grep | https://mcp.grep.app | None |
| clerk | https://mcp.clerk.com/mcp | None |
| vercel | https://mcp.vercel.com | OAuth |

## MCP Servers (local binary)

| Server | Location |
|--------|----------|
| github-mcp-server | ~/.local/bin/github-mcp-server |

## Vendored MCPs

| Server | Location | Source | Auth |
|--------|----------|--------|------|
| perplexity-agent-mcp | ~/.local/bin/perplexity-agent-mcp/ | vendor/perplexity-agent-mcp/ | PERPLEXITY_API_KEY |
| browserless-mcp | ~/.local/bin/browserless-mcp/ | vendor/browserless-mcp/ | BROWSERLESS_TOKEN |

## Infrastructure (Docker)

| Service | Image | Port | Installed By |
|---------|-------|------|-------------|
| postgres (memory) | postgres:16-alpine | 5432 | setup.sh |
| browserless | ghcr.io/browserless/chromium | 3000 | setup.sh |

## Home Directory Projects (auto-cloned by setup.sh)

| Directory | Repository | Purpose |
|-----------|-----------|---------|
| ~/esg-hub/ | github.com/simonmak-ascent/esg-hub | MCP server (Next.js) |
| ~/project_human/ | github.com/humanity4ai/project_human | Humanity4AI project |
