# Changelog — Workbench

> All notable changes to the codespace-workbench configuration.
> Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [2026-07-26] — Comprehensive Audit & Fix Sprint

### Added
- 28 custom OpenCode agent skills (`.opencode/skills/`): 10 research, 10 development, 8 publishing
- `docs/ai-provider-inventory.md` — All AI providers documented
- `docs/opencode-runtime-config.md` — Runtime config snapshot
- `docs/opencode-runtime-snapshot.md` — Behavioural configuration preserved
- `docs/mcp-inventory.md` — All 19 MCP servers with versions and dependencies
- `docs/workstation-playbook.md` — Operational knowledge captured
- `DB_PATH` env var for saga MCP in devcontainer.json and opencode.json
- `.saga/` to `.gitignore`

### Changed
- **Active model**: `kimi-for-coding/k3` → `deepseek/deepseek-v4-pro`
- **devcontainer.json `remoteEnv`**: Added 6 missing env vars (BROWSERLESS_TOKEN, PERPLEXITY_API_KEY, BRAVE_API_KEY, FIGMA_ACCESS_TOKEN, SENTRY_ACCESS_TOKEN, SIMONPLMAK_CLOUD_PAT, DEEPSEEK_API_KEY, DB_PATH)
- **Figma MCP**: Fixed env var name from `FIGMA_ACCESS_TOKEN` → `FIGMA_API_KEY`
- Runtime sync: `~/.config/opencode/opencode.json` synced from repo
- Updated `docs/environment-inventory.md` — reflected model change, added new vars
- Updated `docs/codespaces-secrets.md` — DEEPSEEK_API_KEY moved to Required
- Updated `docs/software-inventory.md` — all MCP versions current
- Updated `docs/workstation-inventory.md` — complete file tree
- Updated `docs/recovery-gap-analysis.md` — score 89→92

### Fixed
- Figma MCP: `-32000 Connection closed` — env var name mismatch
- Saga MCP: missing `DB_PATH` — now set in devcontainer + opencode config
- Playwright MCP: installed Chromium (`npx playwright install chrome`)
- Browserless MCP: verified Docker container + correct token

### Known Issues
- Perplexity MCP: 401 — API key regenerated needed (wrong `pplx-` prefix)
- Vercel MCP: OAuth not completed (requires browser interaction)
- Design-system MCP: needs `STORYBOOK_URL` pointing to live Storybook

## [2026-07-25] — Initial Preservation Sprint

### Added
- Initial documentation structure (docs/)
- Workstation inventory
- Software inventory
- Environment variable inventory
- Codespaces secrets inventory
- Recovery gap analysis
- Prompt index with preservation prompts
- Bootstrap tools script
- Backup report

### Changed
- 6 MCP servers enabled
- Shell aliases configured
