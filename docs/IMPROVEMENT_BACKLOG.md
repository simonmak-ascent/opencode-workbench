# Improvement Backlog

> Purpose: Track discovered improvements for future sprints.
> Process: Append new items. Mark completed with date. Never delete.

## Priority Legend
- 🔴 Critical — Security or recovery blocker
- 🟡 High — Significant workflow improvement
- 🟢 Medium — Quality of life
- ⚪ Low — Nice to have

---

## Open Items

| ID | Priority | Item | Discovered |
|----|----------|------|------------|
| I01 | 🔴 | Perplexity API key needs regeneration (wrong prefix) | 2026-07-26 |
| I02 | 🟡 | Add `npx playwright install chrome` to setup.sh | 2026-07-26 |
| I03 | 🟡 | Complete Vercel OAuth — run `opencode mcp auth vercel` | 2026-07-26 |
| I04 | 🟡 | Set `STORYBOOK_URL` env var for design-system MCP | 2026-07-26 |
| I05 | 🟢 | Add `OPENROUTER_API_KEY` as alternate AI provider | 2026-07-26 |
| I06 | 🟢 | Configure `GOOGLE_API_KEY` provider if needed | 2026-07-26 |
| I07 | 🟢 | Add SurrealDB MCP back if needed (currently disabled) | 2026-07-26 |
| I08 | 🟢 | Create routine maintenance script | 2026-07-26 |
| I09 | 🟢 | Add formatter configuration to opencode.json | 2026-07-26 |
| I10 | ⚪ | Consider adding WCAGC accessibility MCP | 2026-07-26 |
| I11 | ⚪ | Explore adding Convertica MCP for content conversion | 2026-07-26 |
| I12 | 🟢 | Add version tags/git tags for major workstation milestones | 2026-07-26 |

## Completed

| ID | Priority | Item | Completed |
|----|----------|------|-----------|
| C01 | 🔴 | Fix Figma MCP env var (FIGMA_ACCESS_TOKEN → FIGMA_API_KEY) | 2026-07-26 |
| C02 | 🔴 | Add DB_PATH for saga MCP | 2026-07-26 |
| C03 | 🔴 | Add missing remoteEnv entries to devcontainer.json | 2026-07-26 |
| C04 | 🔴 | Sync runtime opencode.json with repo | 2026-07-26 |
| C05 | 🟡 | Install Chromium for Playwright MCP | 2026-07-26 |
| C06 | 🟡 | Create 28 custom agent skills | 2026-07-26 |
| C07 | 🟡 | Create comprehensive documentation system | 2026-07-26 |
| C08 | 🟡 | Switch active model to deepseek/deepseek-v4-pro | 2026-07-26 |
| C09 | 🟡 | Add .saga/ to .gitignore | 2026-07-26 |
| C10 | 🟡 | Unblock .opencode/skills from .gitignore | 2026-07-26 |
