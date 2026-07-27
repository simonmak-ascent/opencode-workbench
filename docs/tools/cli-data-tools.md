# CLI & npm Data Tools

> Phase: #3 | Created: 2026-07-27

## pandoc
- **Purpose**: Universal document converter (Markdown ↔ HTML ↔ PDF ↔ DOCX ↔ ...)
- **Install**: `sudo apt-get install pandoc`
- **Version**: apt latest
- **Runtime impact**: CLI only, no persistent process
- **Why chosen**: Swiss Army knife for document conversion
- **Alternatives considered**: Custom converters (fragile)
- **Security**: No network access by default

## miller (mlr)
- **Purpose**: CSV, JSON, TSV, and tabular data processing (like awk/sed for structured data)
- **Install**: `sudo apt-get install miller`
- **Why chosen**: Handles all tabular formats, streaming operation for large files
- **Alternatives considered**: awk (no JSON), jq (JSON only), csvkit (CSV only)
- **Key commands**: `mlr cut`, `mlr filter`, `mlr stats1`, `mlr put`, `mlr sort`

## jq
- **Purpose**: JSON processor (query, filter, transform, format)
- **Install**: `sudo apt-get install jq`
- **Why chosen**: Standard JSON CLI tool, ubiquitous
- **Key commands**: `jq '.'`, `jq '.[] | {name, value}'`, `jq -s 'add'`

## csvkit
- **Purpose**: CSV toolkit (csvcut, csvgrep, csvjson, csvstat, csvlook)
- **Install**: `pipx install csvkit`
- **Why chosen**: Comprehensive CSV processing with SQL integration
- **Key commands**: `csvcut -n file.csv`, `csvsql --query "..." file.csv`

## csvtojson / json2csv
- **Purpose**: Bidirectional CSV ↔ JSON conversion
- **Install**: `npm install -g csvtojson json2csv`
- **Why chosen**: Simple, fast, Node-native

## sqlite3
- **Purpose**: Lightweight SQL database CLI
- **Install**: `sudo apt-get install sqlite3`
- **Why chosen**: Zero-config, perfect for local data exploration

## vercel (CLI)
- **Purpose**: Vercel platform management (deploy, env, projects, domains)
- **Install**: `npm install -g vercel`
- **Key commands**: `vercel`, `vercel deploy`, `vercel env pull`, `vercel promote`

## surreal (CLI)
- **Purpose**: SurrealDB client (query, import, export, schema management)
- **Install**: `curl -sSf https://install.surrealdb.com | sh`
- **Version**: latest stable
- **Key commands**: `surreal sql`, `surreal import`, `surreal export`, `surreal start`
- **Rollback**: `sudo rm /usr/local/bin/surreal`
