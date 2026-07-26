# Software Inventory

> Generated: 2026-07-26 | Codespace: codespace-workbench

## Core Platform

| Tool | Version | Purpose | Install Method |
|------|---------|---------|---------------|
| Debian | 13 (trixie) | OS | GitHub Codespaces base |
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
| OpenCode CLI | 1.18.5 | AI coding assistant | curl install script |
| Claude Code | 2.1.220 | Anthropic CLI | npm global |

## CLI Tools

| Tool | Version | Purpose | Install Method |
|------|---------|---------|---------------|
| Vercel CLI | 57.0.0 | Vercel platform management | npm global |
| SurrealDB CLI | 3.2.3 | SurrealDB database management | curl install script |
| GitHub CLI | 2.96.0 | GitHub automation | devcontainer feature |

## Browsers

| Tool | Version | Purpose |
|------|---------|---------|
| Chromium | 150.0.7871.181 | Playwright/browserless automation |
| Firefox ESR | 140.13.0 | Alternative browser |
| Google Chrome | 150.0.7871.186 | Playwright MCP browser |

## Data Processing

| Tool | Version | Purpose | Install Method |
|------|---------|---------|---------------|
| Pandoc | 3.1.11.1 | Document conversion | apt |
| jq | 1.7.1 | JSON processing | apt |
| Miller (mlr) | 6.13.0 | Structured data CLI | apt |
| csvkit | 2.2.0 | CSV toolkit | pipx |
| SQLite | 3.46.1 | Embedded database | apt |
| DuckDB | 1.5.5 | OLAP database | pip (system) |
| Polars | 1.43.0 | DataFrame library | pip (system) |
| PyArrow | 25.0.0 | Arrow/Parquet | pip (system) |
| openpyxl | 3.1.5 | Excel read/write | pip (system) |
| xlrd | 2.0.2 | Excel read | pip (system) |
| XlsxWriter | 3.2.9 | Excel write | pip (system) |
| lxml | 6.1.1 | XML/HTML parsing | pip (system) |
| SQLAlchemy | 2.0.51 | SQL toolkit | pip (system) |
| tabulate | 0.10.0 | Table formatting | pip (system) |
| Datasette | 0.65.2 | SQLite browser | pip (system) |
| csvtojson | 2.0.14 | CSV to JSON converter | npm global |
| json2csv | 6.0.0-alpha.2 | JSON to CSV converter | npm global |

## MCP Servers (npm global)

| Server | Version | Enabled | Auth Required |
|--------|---------|---------|--------------|
| @modelcontextprotocol/server-brave-search | 0.6.2 | Yes | BRAVE_API_KEY |
| @modelcontextprotocol/server-postgres | 0.6.2 | Yes | DATABASE_URL |
| @playwright/mcp | 0.0.78 | Yes | No |
| @jpisnice/shadcn-ui-mcp-server | 2.0.0 | Yes | GITHUB_TOKEN |
| mcp-echarts | 0.7.1 | Yes | No |
| mcp-mermaid | 0.4.1 | Yes | No |
| saga-mcp | 1.6.0 | Yes | No |
| swagger-testcase-mcp | 1.0.0 | Yes | No |
| mcp-design-system-extractor | 1.1.1 | Yes | No |
| figma-developer-mcp | 0.13.2 | Yes | FIGMA_ACCESS_TOKEN |
| @sentry/mcp-server | 0.37.0 | Yes | SENTRY_ACCESS_TOKEN |
| surrealdb-mcp-server | 0.2.0 | No | SURREALDB_* |
| @storybook/mcp | 0.8.0 | No | Library, not standalone |
| @wcagc/mcp | 0.3.0 | No | WCAGC_MCP_KEY |
| convertica-mcp | 0.1.3 | No | CONVERTICA_API_KEY |

## MCP Servers (remote)

| Server | URL | Auth |
|--------|-----|------|
| context7 | https://mcp.context7.com/mcp | None |
| gh_grep | https://mcp.grep.app | None |
| n8n | https://simonmak.app.n8n.cloud/mcp-server/http | OAuth |
| clerk | https://mcp.clerk.com/mcp | None |
| vercel | https://mcp.vercel.com | OAuth |

## MCP Servers (local binary)

| Server | Location |
|--------|----------|
| github-mcp-server | ~/.local/bin/github-mcp-server |

## Vendored MCPs

| Server | Location | Source |
|--------|----------|--------|
| perplexity-agent-mcp | ~/.local/bin/perplexity-agent-mcp/ | vendor/perplexity-agent-mcp/ |
| browserless-mcp | ~/.local/bin/browserless-mcp/ | vendor/browserless-mcp/ |

## Infrastructure (Docker)

| Service | Image | Port |
|---------|-------|------|
| postgres (memory) | postgres:16-alpine | 5432 |
| browserless | ghcr.io/browserless/chromium | 3000 |
