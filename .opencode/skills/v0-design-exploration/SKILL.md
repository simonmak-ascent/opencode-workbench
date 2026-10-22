---
name: v0-design-exploration
description: >
  Explore and generate UI designs using v0 by Vercel — MCP tools, global CLI,
  templates, and presets. Use when the user asks to "design with v0", "generate
  a page", "explore a layout", "create a v0 chat", "use a template", "find a
  v0 template", or mentions v0 design work. Covers: v0 CLI (chat/design/deploy),
  v0 MCP server, 150-design-template library, apg preset with full token system,
  Vercel deployment integration, and the design gate approval workflow.
---

# v0 Design Exploration

Use v0 by Vercel to generate token-faithful UI designs for new surfaces.
**Never for parity work** (fidelity-first: v0 must not replace measured/original values).

## Three Integration Modes

### 1. Global CLI (`v0`) — fastest for batch/automated

```bash
# Full design pipeline: chat + wait + deploy to Vercel
v0 design "6-section nav with dropdown descriptions" --preset apg --team

# Explore with a template (150 available)
v0 chat "$(cat ~/.config/opencode/v0-templates/branding/1A-01-full-homepage.md)" --preset apg

# Quick component sketch
v0 chat "valuation service card with gold accent" --preset apg --model v0-mini

# Deploy an existing chat to Vercel
v0 deploy <chatId>

# Dump generated files as design reference
v0 files <chatId> design/releases/<ver>/v0-output/
```

Flags: `--preset apg` (tokens/layout/banned), `--model v0-pro|v0-max|v0-max-fast|v0-mini`, `--team`, `--sync`, `--skill <id>`, `--mcp <id>`, `--meta k=v`

### 2. v0 MCP — for interactive agent-driven design

The v0 MCP (`https://v0.app/api/mcp`) is configured in `opencode.json`. Auth: `opencode mcp auth v0` (OAuth browser flow).
Tools: `createChat`, `getChat`, `sendMessage`, `resolveTask`, `getPreview`, `listChats`, `deploy`.

Use the MCP when:

- Iterating on a design with follow-up messages
- Resolving v0 tasks (plan approvals, permission grants)
- Browsing existing chats for reference
- Agent needs to create/manage chats from within a tool call

### 3. v0 Web App + GitHub — for interactive visual exploration

`v0.app` → "Import from GitHub" → select project repo. Every chat creates a dedicated branch.
Push manually (disable auto-push). Fork chat per iteration. Vercel auto-deploys from branches.

## Template Library (150 templates)

```
~/.config/opencode/v0-templates/
  branding/   50 — high visual intensity, ascent-partners.com style
  utility/    50 — low intensity, data-dense Bloomberg-terminal style
  others/     50 — medium intensity, workspace/settings/onboarding
  _index.md   searchable catalog
```

**Browse templates:**

```bash
# List all by category
ls ~/.config/opencode/v0-templates/branding/

# Search by tag/intensity
grep -l "brandIntensity.*high" ~/.config/opencode/v0-templates/**/*.md
grep -l "dashboard\|kpi\|calculator" ~/.config/opencode/v0-templates/**/*.md

# Read the catalog
cat ~/.config/opencode/v0-templates/_index.md
```

**Use a template:**

```bash
v0 chat "$(cat ~/.config/opencode/v0-templates/branding/1A-01-full-homepage.md)" --preset apg
```

**Template categories for common tasks:**

| Need               | Template IDs                        |
| ------------------ | ----------------------------------- |
| New page (branded) | 1A-01–1A-05, 1B-_, 1C-_, 1D-_, 1E-_ |
| Navigation/Shell   | 1G-01–1G-05                         |
| Data dashboard     | 2A-01–2A-08                         |
| Table/Grid         | 2B-01–2B-08                         |
| Form/Wizard        | 2D-01–2D-06                         |
| Calculator/Tool    | 2F-01–2F-06                         |
| Settings/Profile   | 3A-01–3A-06                         |
| Error/404          | 3I-01–3I-05                         |

## Presets

```
~/.config/opencode/v0-presets/
  apg.md       ascent-partners.com: teal brand, full token system, container hierarchy, 5 locales
  apf.md       ascent-partners-foundation: green brand, charity voice, en/zh/hk
  default.md   generic Tailwind/React baseline
```

Auto-detect: if `./design/v0-system-prompt.md` exists in the project root, `--preset` is optional.

## Design Gate Workflow

> Canonical, stack-aware pipeline: `~/.config/opencode/workflows/design-gate.md`,
> invoked as `/design-gate <brief> --stack apf|apg --ver X.Y --preset apf|apg`.
> The steps below are the older APG-era summary and apply to apg-website.

For NEW surfaces (v1.15+ releases):

```
1. v0 design "prompt grounded in spec" --preset apg --team
   → prints chatId + deploymentId

2. vercel_get_deployment <deploymentId>
   → Vercel preview URL (SSO-protected, team simon-maks-projects)

3. vercel_get_access_to_vercel_url <url>
   → share link for audit

4. pnpm audit:visual --base <share-url> + Playwright screenshot
   → design/releases/<ver>/

5. v0 files <chatId> design/releases/<ver>/v0-output/
   → version generated source as design reference

6. Open PR from design branch (web-app mode) or commit design artifacts (CLI mode)
   → Human approves (AC-D1) → CLOSE WITHOUT MERGING

7. Create feat/<ver>/<feature> from develop
   → Hand-write adapted implementation (tokens.json, custom components, no shadcn)
   → PR → SWAS (cs run): pnpm check + audit → merge to develop
```

## Quick Reference

| Task             | Command                                                      |
| ---------------- | ------------------------------------------------------------ |
| New branded page | `v0 chat "$(cat ~/.../branding/1B-*)" --preset apg --team`   |
| Data tool page   | `v0 chat "$(cat ~/.../utility/2A-*)" --preset apg`           |
| Iterate design   | `v0 message <chatId> "add dark header, fix teal to #0083ab"` |
| Deploy to Vercel | `v0 deploy <chatId>`                                         |
| Check deployment | `vercel_get_deployment <deploymentId>`                       |
| List my chats    | `v0 list`                                                    |
| Get files        | `v0 files <chatId> design/releases/<ver>/v0-output/`         |
| Find templates   | `grep -rl "contact\|form" ~/.../v0-templates/`               |

## Guardrails (ALWAYS enforced by --preset apg)

- No shadcn/ui components — custom Tailwind only
- No invented colors — every hex from tokens.json
- No rounded-pill buttons — rectangular, border-radius max 4px
- No gradients, no dark mode, no Tailwind v4 features
- CSS Grid Template → Grid/Flexbox → Content hierarchy
- 5-locale support with font stacks per script
- WCAG 2.2 AA: 4.5:1 contrast, 44px touch, sequential headings
