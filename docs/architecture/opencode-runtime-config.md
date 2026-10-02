# OpenCode Runtime Configuration

> Updated: 2026-10-03
> Source of truth: repo `opencode.json`, copied to `~/.config/opencode/opencode.json`
> on the build box. Counts below are derived from `opencode.json`.

## Active Configuration

| Item | Value |
|------|-------|
| **Primary Model** | `deepseek/deepseek-v4-pro` |
| **Small Model** | `deepseek/deepseek-v4-flash` |
| **Default agent** | `vdd` |
| **LSP** | Enabled |
| **Schema** | `https://opencode.ai/config.json` |

## Provider Configuration

- **DeepSeek** — `https://api.deepseek.com`, key `DEEPSEEK_API_KEY`.
- **OpenCode Zen / Console Go** — key `OPENCODE_API_KEY`.
- Additional optional providers are documented in
  `docs/architecture/ai-provider-inventory.md`.

## MCP Servers (35 configured · 33 enabled · 2 disabled)

> Full per-server table (entry point + auth env) is the generated inventory:
> [`mcp-inventory.md`](./mcp-inventory.md). Disabled by default: `google-search`,
> `google-workspace`. Opt-in add-ons (dropped unless enabled): see
> `OPTIONAL_MCP_IDS` in `mcp-server/src/render.ts`.

### Remote MCPs (9, all enabled)
| Server | URL | Auth |
|--------|-----|------|
| context7 | `https://mcp.context7.com/mcp` | none |
| gh_grep | `https://mcp.grep.app` | none |
| clerk | `https://mcp.clerk.com/mcp` | none |
| vdd | `https://vdd.simonmak.com/api/mcp` | none |
| exa | `https://mcp.exa.ai/mcp` | `EXA_API_KEY` |
| cloudflare | `https://mcp.cloudflare.com/mcp` | `CLOUDFLARE_API_TOKEN` |
| sentry | `https://mcp.sentry.dev/mcp` | `SENTRY_AUTH_TOKEN` |
| stripe | `https://mcp.stripe.com` | `STRIPE_SECRET_KEY` |
| vercel | `https://mcp.vercel.com` | `VERCEL_ACCESS_TOKEN` (token auth) |

### Local MCPs (26: 24 enabled, 2 disabled)
Includes github (binary), perplexity + browserless (vendored), brave-search,
postgres, playwright, mermaid, echarts, shadcn, swagger-testcase, design-system,
saga, arxiv, paper-search, firecrawl, primary-sources, ms-365, alibaba-cloud-ops,
surrealdb, designlang, difflens, browser-mcp, esg-hub, humanity4ai; plus the two
disabled local servers `google-search` and `google-workspace`.

> `figma` was removed from the profile (superseded by the v0 workflow).

## Recovery Method

1. Clone this repository.
2. Build-box secrets propagate via `.devcontainer/devcontainer.json` `remoteEnv`.
3. `.devcontainer/setup.sh` installs the OpenCode CLI, npm/vendored MCP servers,
   Playwright Chromium, and copies config.
4. `opencode.json` is the single source of truth; the runtime copy is synced from it.
5. Validate with `bash scripts/recovery/validate-recovery.sh`.

## Custom Skills (45 in `.opencode/skills/`)

Ported skill families include: research (spec-writer, competitive-analysis,
api-research, tech-stack-eval, codebase-explorer, dependency-audit,
architecture-review, content-research, benchmark-research, security-audit,
web-research); development (component-builder, api-builder, db-schema, auth-flow,
responsive-design, state-management, test-writer, perf-optimizer, error-handling,
cicd-setup); publishing (changelog-generator, release-manager, cloud-deploy,
docker-builder, npm-publisher, docs-generator, semantic-release,
post-deploy-monitor); plus VDD/spec-driven, data/analysis, scientific-computing,
frontend-design, browser-automation, accessibility and workbench-compute.
