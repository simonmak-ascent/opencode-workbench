# Changelog — Workbench

> All notable changes to the workbench configuration.
> Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [2026-10-03] — v2.1.0

### Added
- **Web introduction page** at `/` on the hosted connector — `public/index.html`
  (self-contained, responsive, no build step) plus `public/favicon.svg`. Fixes
  the 404 at `https://opencode-workbench.simonmak.com/`.
- **`remove_component`** and **`update_component`** MCP tools (consent-gated,
  value-blind, idempotent) — completing the install → update → remove lifecycle
  (raises TDQS server coherence "completeness").

### Changed
- TDQS description pass across tools (behavioral transparency for the mutating
  tools: exactly what is overwritten/destroyed, auth prerequisites, duration).
- Tool count 9 → 11 across `README`, `AGENTS.md`, `mcp-server/README.md`,
  `docs/architecture/clone-mcp.md`, `docs/architecture/opencode-runtime-snapshot.md`,
  `llms.txt`, `context7.json`, `glama.json`.
- `vercel.json`: `GET /` rewrite + `X-Content-Type-Options` / `Referrer-Policy` headers.

## [2026-10-03] — v2.0.0

### Breaking
- Renamed the MCP tool `workbench_info` → `get_workbench_info` for a consistent
  `verb_noun` naming pattern (TDQS coherence). Clients that call `workbench_info`
  must update. All other tools are unchanged.

### Changed
- TDQS description pass across all 9 tools: explicit purpose, usage (use/do-not-use),
  behavioral transparency, and sibling disambiguation.
- Official MCP Registry: added `mcpName` to `package.json`, `server.json`
  description within the 100-char limit, workflow uses `login github-oidc`.

## [2026-10-03] — VDD-ready, key-resilient profile

### Added
- **Key-resilient clone**: render-time model selection (DeepSeek → OpenCode Zen free floor → `degraded`); MCP servers missing required credentials are disabled and reported instead of failing at runtime. `apply_clone`/`verify_clone` return `model`, `providerMode` and `degraded`.
- **Consent gate**: `apply_clone` / `install_component` require `confirm:true`; without it they return a plan with privileged-command previews.
- **Credential acquisition** (value-blind): `list_required_credentials` + `run_auth_flow`, the `credential-acquisition` skill and `docs/prompts/ACQUIRE-KEYS.md`.
- **Self-test harness**: `scripts/selftest/` + `pnpm selftest` + `docs/prompts/SELFTEST.md`.
- **Research layer**: `arxiv`, `paper-search`, `firecrawl`, `exa`, `cloudflare` MCPs; `docs/research/pipeline.md`; ported research/VDD/domain skills (45 total).
- **Domains**: `scientific` (numpy/scipy/pandas/matplotlib/sympy; optional R/Julia/Jupyter) and `db-clients` components; `data-analysis`, `data-modeling`, `scientific-computing` skills; `docs/architecture/capability-matrix.md`.
- **`primary-sources-mcp`**: published as `@simonmak-ascent/primary-sources-mcp` and wired into the profile; `research-mcps` core component.

### Changed
- `vdd` MCP → remote `https://vdd.simonmak.com/api/mcp`; `sentry` → remote; `vdd` removed from optional add-ons.
- Repo/org references updated `simonplmak-cloud` → `simonmak-ascent`; install snippet scoped to `@simonmak-ascent/opencode-workbench`.
- `inventory-mcp.sh` is now config-driven; `sync-runtime-config.sh` is path-agnostic.
- `clone.ts` delivers `AGENTS.md` (+ `docs/research/pipeline.md`) to the config dir so `instructions: ["AGENTS.md"]` resolves.

---

## [2026-10-03] — VDD adoption + `bootstrap_host`

### Added
- **VDD chain** (Phase 0–8): `constitution.md`, `vdd/vision.md`, `vdd/strategy.md`,
  `vdd/tactics.md`, `vdd/specs/bootstrap-bare-host/{spec,plan,data-model,tasks}.md`
  + `contracts/bootstrap_host.md`, `vdd/gates/G1–G7.md`,
  `vdd/impact-report.generated.md`.
- **`bootstrap_host` MCP tool** — one-call provisioning of a bare Linux target
  (local or SSH): kernel-up platform scan + dry-run upgrade plan, latest-stable
  OpenCode install with recorded version pin, VDD profile apply, verify, and a
  target-free `help` parameter. (`mcp-server/src/bootstrap.ts`, `platform.ts`)
- New unit tests `mcp-server/test/platform.test.ts` (20) and a `help` test.

### Changed
- `mcp-server/src/probe.ts` + `clone.ts`: emit `osIdLike` (`ID_LIKE`) for exact
  distro-family detection.
- Reconciled MCP counts: `README.md` (19→35) and `AGENTS.md` (29→35 configured,
  33 enabled, 2 disabled).
- CI `validate-inventory.yml`: assert documented MCP counts match `opencode.json`.

### Fixed
- Canonical non-interactive upgrade flag placement (`apt-get -y dist-upgrade`).
- `AGENTS.md` tool list now includes `bootstrap_host`.

### Known Issues
- A-005/A-006 partially traced; README free-text counts now asserted by CI.
- Constitution `[PENDING]` decisions: VDD adoption scope, `DB_PATH` drift,
  `WORKFLOW_STATE.md` staleness.

---

## [2026-07-27] — Master Backup

### Changed
- OpenCode CLI: 1.18.5 → 1.18.7 (auto-updated)
- docs/architecture/opencode-runtime-config.md: MCP count corrected (18 enabled, 1 disabled), date refreshed
- docs/architecture/opencode-runtime-snapshot.md: Saga status corrected from "needs restart" to "disabled", date refreshed

### Fixed
- Docker containers (pg-memory, browserless) restarted after unexpected exit
- Runtime-config docs: "all enabled" → "18 enabled, 1 disabled" (saga)

### Known Issues
- OPENCODE_API_KEY in early git history — key already rotated, non-exploitable
- DB_PATH missing at runtime (present in devcontainer.json but not in current shell)
- Perplexity MCP: 401 — awaits codespace rebuild for `pplx-` key
- Vercel MCP: OAuth not completed

---

## [2026-07-26] — WORKSTATION_REVIEW Audit (Round 2)

### Added
- 5 new backlog items (I13–I17) from comprehensive workstation review

### Changed
- **AGENTS.md**: MCP server count corrected 18 → 19, all secret sources updated from `~/.env.workbench` to `Codespaces secret → devcontainer.json`
- **AGENTS.md**: Removed stale `OPENAI_API_KEY` entry, clarified `~/.env.workbench` as legacy fallback
- **docs/architecture/ai-provider-inventory.md**: Redacted partial Perplexity key prefix

### Fixed
- Documentation drift: AGENTS.md now matches runtime reality for secret sourcing

---

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
- **devcontainer.json `remoteEnv`**: Added 6 missing env vars (BROWSERLESS_TOKEN, PERPLEXITY_API_KEY, BRAVE_API_KEY, FIGMA_TOKEN, SENTRY_AUTH_TOKEN, SIMONPLMAK_CLOUD_PAT, DEEPSEEK_API_KEY, DB_PATH)
- **Figma MCP**: Fixed env var name from `FIGMA_TOKEN` → `FIGMA_API_KEY`
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
