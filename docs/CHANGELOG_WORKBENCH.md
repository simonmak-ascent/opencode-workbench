# Changelog — Codespace Workbench

## 2026-07-26

### Added
- **CLI tools**: Vercel CLI 57.0.0 (npm global), SurrealDB CLI 3.2.3 (curl installer)
- **Browsers**: Chromium 150.0.7871.181, Firefox ESR 140.13.0, Google Chrome 150.0.7871.186 (Playwright)
- **MCP auth**: n8n and Vercel OAuth completed via Playwright browser automation
- **MCP fixes**: Browserless MCP (dependencies installed), storybook MCP (disabled — library, not CLI)
- **MCP enabled**: Figma MCP (0.13.2), Sentry MCP (0.37.0)
- **Documentation**: workstation-inventory.md, home-directory-audit.md
- **Security**: .gitignore updated to exclude .playwright-mcp/ runtime artifacts

### Changed
- `.gitignore` — added .playwright-mcp/ exclusion
- `configs/mcp/mcp-inventory.json` — updated to reflect 19 active servers
- `configs/mcp/README.md` — expanded with auth status, architecture diagram
- `configs/opencode/README.md` — expanded with current state, MCP auth docs
- `docs/software-inventory.md` — updated with all current versions and new tools
- `opencode.json` — enabled figma and sentry MCPs, disabled storybook

### Fixed
- Browserless MCP startup failure (missing @modelcontextprotocol/sdk dependency)
- Storybook MCP startup failure (disabled — not a standalone CLI server)

### Notes
- Full workstation preservation audit completed across 18 phases
- 22 MCP servers configured, 19 active, 4 disabled
- Remote MCP servers (n8n, vercel) OAuth authenticated
- Security scan: repository remains clean — no secrets committed

## 2026-07-25

### Added
- **Documentation structure**: `docs/`, `docs/prompts/`, `docs/backup-reports/`, `configs/opencode/`, `configs/mcp/`
- **Prompts**: `workstation-preservation.md`, `software-bootstrap.md`
- **Config inventory**: `mcp-inventory.json`
- **Software inventory**: `software-inventory.md`
- **Security**: `.gitignore` (prevents accidental secret commits)
- **Data tools**: pandoc, miller, csvkit, duckdb, polars, datasette, pyarrow, openpyxl, xlrd, xlsxwriter, lxml, sqlalchemy, tabulate, csvtojson, json2csv

### Changed
- `.gitignore` created to prevent secret/environment file leakage

### Notes
- Security scan completed: no secrets found in repository
- MCP server catalog documented (22 servers, 14 active, 5 disabled, 3 vendored)
- Recovery documentation initiated
