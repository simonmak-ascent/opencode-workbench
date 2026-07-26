# Changelog — Codespace Workbench

## 2026-07-26

### Added
- **MCP packages installed**: mcp-mermaid (0.4.1), saga-mcp (1.6.0), mcp-echarts (0.7.1), @jpisnice/shadcn-ui-mcp-server (2.0.0), swagger-testcase-mcp (1.0.0), mcp-design-system-extractor (1.1.1)
- **MCP servers enabled**: mermaid, saga, echarts, shadcn, swagger-testcase, design-system (all previously disabled due to missing packages)
- **Documentation**: environment-inventory.md, codespaces-secrets.md, recovery-gap-analysis.md
- **Git attributes**: `.gitattributes` created with line-ending and binary-file configs
- **Backup snapshot**: docs/backup-reports/2026-07-26.md updated

### Changed
- `configs/mcp/README.md` — reformatted local npm table, updated recovery docs, added cross-references
- `configs/mcp/mcp-inventory.json` — updated versions, added type fields, corrected auth info
- `docs/prompts/prompt-index.md` — expanded with related documentation cross-references
- `docs/CHANGELOG_WORKBENCH.md` — appended today's entries

### Fixed
- 6 MCP servers were enabled in config but packages weren't installed — now installed and active

### Security
- Full repository security scan completed: CLEAN — no secrets, tokens, or keys found
- Verified all `.env*`, `credentials*`, `secrets*` patterns covered by `.gitignore`

### Notes
- Comprehensive 21-phase workstation preservation audit completed
- Recovery gap analysis rates overall reproducibility at 89/100
- 22 MCP servers configured, 19 active, 3 disabled

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
