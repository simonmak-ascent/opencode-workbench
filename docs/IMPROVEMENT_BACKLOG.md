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
| I01 | 💜 | Perplexity API key needs regeneration (wrong prefix) | 2026-07-26 |
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
| I13 | 🔴 | DB_PATH env var empty at runtime — devcontainer.json declares it but SWAS needs rebuild to pick up new remoteEnv entry | 2026-07-26 |
| I14 | 🟡 | `~/.env.workbench` file missing — legacy/bootstrap fallback not available; all secrets now sourced via SWAS secrets → devcontainer.json, but recovery docs reference this file | 2026-07-26 |
| I15 | 🟢 | AGENTS.md MCP count was 18 (actual: 19) — fixed, but maintain awareness as servers are added/removed | 2026-07-26 |
| I16 | 🟢 | `docs/architecture/ai-provider-inventory.md` contained partial Perplexity key prefix — redacted | 2026-07-26 |
| I17 | ⚪ | Legacy provider env vars (OPENROUTER_API_KEY, GOOGLE_API_KEY, MOONSHOT_API_KEY, VERCEL_ACCESS_TOKEN) present in env but inactive — consider removing from SWAS secrets if unused | 2026-07-26 |
| I18 | 🟡 | Saga MCP intentionally disabled — document reason and re-enable criteria in recovery docs | 2026-07-27 |
| I19 | 🟢 | DISASTER_RECOVERY.md still referenced Vercel OAuth as manual step (now uses token auth) — fixed | 2026-07-27 |
| I20 | 🟡 | Perplexity API key regenerated with `pplx-` prefix in GitHub secrets — needs SWAS rebuild to propagate | 2026-07-27 |
| I21 | 🟡 | DB_PATH declared in remoteEnv but not reliably set at runtime — investigate root cause | 2026-07-27 |

## Completed

| ID | Priority | Item | Completed |
|----|----------|------|-----------|
| C01 | 🔴 | Fix Figma MCP env var (FIGMA_TOKEN → FIGMA_API_KEY) | 2026-07-26 |
| C02 | 🔴 | Add DB_PATH for saga MCP | 2026-07-26 |
| C03 | 🔴 | Add missing remoteEnv entries to devcontainer.json | 2026-07-26 |
| C04 | 🔴 | Sync runtime opencode.json with repo | 2026-07-26 |
| C05 | 🟡 | Install Chromium for Playwright MCP | 2026-07-26 |
| C06 | 🟡 | Create 28 custom agent skills | 2026-07-26 |
| C07 | 🟡 | Create comprehensive documentation system | 2026-07-26 |
| C08 | 🟡 | Switch active model to deepseek/deepseek-v4-pro | 2026-07-26 |
| C09 | 🟡 | Add .saga/ to .gitignore | 2026-07-26 |
| C10 | 🟡 | Unblock .opencode/skills from .gitignore | 2026-07-26 |
| C11 | 🟡 | Chromium now auto-installed in setup.sh (line 44-45) — gap closed | 2026-07-26 |
| C12 | 🟡 | DR test: recovery score improved 92→94 — Chromium auto-install confirmed | 2026-07-26 |
| C13 | 🟡 | Added MOONSHOT_API_KEY to devcontainer.json remoteEnv | 2026-07-26 |
| C14 | 🟢 | Moved MOONSHOT_API_KEY to Optional/Alternate in SWAS-secrets.md | 2026-07-26 |
| C15 | 🔴 | Regenerated Perplexity API key with `pplx-` prefix (GitHub secret updated; requires SWAS rebuild to propagate) | 2026-07-26 |
| C16 | 🟢 | Fixed DISASTER_RECOVERY.md — Vercel OAuth manual step removed (token auth active) | 2026-07-27 |
| C17 | 🟢 | Updated recovery-gap-analysis.md: scores recalculated, 2 new checklist items, 4 new gaps | 2026-07-27 |
