# Recovery Checklist

> Purpose: Verifiable checklist for workstation recovery validation.
> Use after build box rebuild or disaster recovery.

## Infrastructure

- [ ] Docker daemon running
- [ ] PostgreSQL container (`pg-memory`) running on port 5432
- [ ] Browserless container (`browserless`) running on port 3000
- [ ] PostgreSQL accessible: `psql postgres://opencode:opencode@localhost:5432/memory -c "SELECT 1"`
- [ ] Browserless accessible: `curl http://localhost:3000/metrics?token=browserless-local-token`

## Software

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] OpenCode CLI installed (`opencode --version`)
- [ ] GitHub CLI installed (`gh --version`)
- [ ] `jq` available (`jq --version`)
- [ ] `pandoc` available (`pandoc --version`)
- [ ] Playwright Chromium installed (`npx playwright install chrome` is up to date)

## npm Global Packages

- [ ] `@modelcontextprotocol/server-brave-search` installed
- [ ] `@modelcontextprotocol/server-postgres` installed
- [ ] `@playwright/mcp` installed
- [ ] `@jpisnice/shadcn-ui-mcp-server` installed
- [ ] `mcp-echarts` installed
- [ ] `mcp-mermaid` installed
- [ ] `saga-mcp` installed
- [ ] `swagger-testcase-mcp` installed
- [ ] `mcp-design-system-extractor` installed
- [ ] `figma-developer-mcp` installed
- [ ] `@sentry/mcp-server` installed

## Environment Variables

- [ ] `DEEPSEEK_API_KEY` present
- [ ] `SIMONMAK_ASCENT_PAT` present
- [ ] `PERPLEXITY_API_KEY` present
- [ ] `BRAVE_API_KEY` present
- [ ] `BROWSERLESS_TOKEN` present
- [ ] `FIGMA_TOKEN` present
- [ ] `SENTRY_AUTH_TOKEN` present
- [ ] `DATABASE_URL` present
- [ ] `DB_PATH` present
- [ ] `BROWSERLESS_HOST` present
- [ ] `BROWSERLESS_PORT` present
- [ ] `BROWSERLESS_PROTOCOL` present

## Configuration

- [ ] `~/.config/opencode/opencode.json` matches repo `opencode.json`
- [ ] `.devcontainer/devcontainer.json` has all 13 remoteEnv entries
- [ ] `AGENTS.md` present at repo root
- [ ] 28 skill files in `.opencode/skills/`

## OpenCode

- [ ] Primary model: `deepseek/deepseek-v4-pro`
- [ ] Small model: `deepseek/deepseek-v4-pro`
- [ ] LSP enabled
- [ ] 19 MCP servers configured (5 remote, 14 local)

## MCP Connectivity

- [ ] context7 (remote) responds
- [ ] gh_grep (remote) responds
- [ ] clerk (remote) responds
- [ ] github (local) responds
- [ ] brave-search (local) responds
- [ ] postgres (local) responds
- [ ] browserless (local) responds
- [ ] playwright (local) responds
- [ ] mermaid (local) responds
- [ ] echarts (local) responds
- [ ] shadcn (local) responds
- [ ] swagger-testcase (local) responds
- [ ] sentry (local) responds
- [ ] saga (local) responds

## Documentation

- [ ] `docs/WORKBENCH_CHARTER.md` present
- [ ] `docs/security-model.md` present
- [ ] `docs/IMPROVEMENT_BACKLOG.md` present
- [ ] `docs/CHANGELOG_WORKBENCH.md` up to date
- [ ] `docs/architecture/` contains all 10 inventory docs
- [ ] `docs/recovery/` contains playbook, disaster recovery, checklist
- [ ] `docs/prompts/` contains all prompt files
- [ ] `README.md` is current

## Result

- [ ] All checks passed
- [ ] Recovery score ≥ 90/100

---

**Validator**: _______________
**Date**: _______________
**Score**: ____/100
