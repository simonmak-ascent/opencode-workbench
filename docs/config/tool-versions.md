# Tool Versions

> Phase: #2 | Created: 2026-07-27
> Known versions of key workstation tools.

## Core CLI

| Tool | Version | Verified |
|------|---------|----------|
| opencode | 1.18.5 | 2026-07-27 |
| node | 22.x | devcontainer image |
| npm | 10.x | devcontainer image |
| docker | latest (dind) | devcontainer feature |
| git | latest | devcontainer image |

## npm Global Packages

| Package | Version | Installed By |
|---------|---------|-------------|
| @modelcontextprotocol/server-brave-search | latest | setup.sh |
| @modelcontextprotocol/server-postgres | latest | setup.sh |
| @playwright/mcp | latest | setup.sh |
| figma-developer-mcp | latest | setup.sh |
| @sentry/mcp-server | latest | setup.sh |
| mcp-mermaid | latest | setup.sh |
| saga-mcp | latest (disabled) | setup.sh |
| mcp-echarts | latest | setup.sh |
| @jpisnice/shadcn-ui-mcp-server | latest | setup.sh |
| swagger-testcase-mcp | latest | setup.sh |
| mcp-design-system-extractor | latest | setup.sh |
| csvtojson | latest | bootstrap-tools.sh |
| json2csv | latest | bootstrap-tools.sh |
| vercel | latest | bootstrap-tools.sh |

## Data Tools (apt/pip)

| Tool | Source | Purpose |
|------|--------|---------|
| pandoc | apt | Document conversion |
| miller (mlr) | apt | CSV/JSON/TSV processing |
| jq | apt | JSON processing |
| sqlite3 | apt | SQLite CLI |
| csvkit | pipx | CSV toolkit |
| duckdb | pip | OLAP SQL engine |
| polars | pip | DataFrame library |
| datasette | pip | SQLite UI |
| pyarrow | pip | Arrow format |
| openpyxl | pip | Excel read |
| xlrd | pip | Excel read (legacy) |
| xlsxwriter | pip | Excel write |
| lxml | pip | XML/HTML parsing |
| sqlalchemy | pip | ORM |
| tabulate | pip | Table formatting |

## CLI Tools

| Tool | Version | Purpose |
|------|---------|---------|
| surreal | latest | SurrealDB CLI |
| gh | latest | GitHub CLI (feature) |
| playwright | latest (npx) | E2E testing |
