# Project Constitution

Status: Active
Version: 1.0.0
Last updated: 2026-10-03

> Impact Chain: Phase 0 — Constitution (immutable)
> Governs every later VDD phase. Amendments require `vdd_amend` and a
> `docs/CHANGELOG_WORKBENCH.md` entry.

## Mission

Provide a reproducible, self-documenting, recoverable OpenCode development
workstation — configuration, agent skills, MCP stack, and the
`opencode-workbench` MCP server that clones the whole profile onto any Linux
machine (local or SSH). The repository is the single source of truth; runtime
drift is a defect.

## Architecture Principles

- **Repository is the source of truth**: runtime configuration (on the build
  box) must match repository configuration. Any divergence is a bug.
- **Secrets never touch disk**: values flow
  `build-box Secrets → devcontainer.json remoteEnv → process env → {env:VAR}`.
  No secret values, prefixes, or partials in repo files.
- **Thin launcher, single app**: the root package is a launcher; the only
  application code is `mcp-server/`. There is no second app to invent.
- **MCP-first**: tooling is exposed as MCP servers/tools with Zod-validated
  inputs; the clone connector never reads or transmits secret values.
- **Compute is remote**: builds, tests, lint and typecheck run on a compute box
  (`cs run`) or CI — never on the editing workstation.
- **Documentation lives with code**: docs describe the system as it is, not as
  imagined. Drift is detectable, not tolerated.

## Technology Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Language | TypeScript 5.6.x | ESM (`"type": "module"`), `strict: true`, `noUncheckedIndexedAccess: true` |
| Runtime | Node.js >= 20 | TS target/module `ES2022` / `NodeNext` |
| Package manager | pnpm 9 | Matches `pnpm-lock.yaml`; pnpm 10 rejects the lockfile |
| Protocol SDK | `@modelcontextprotocol/sdk` ^1.31 | stdio + Streamable HTTP transports |
| Validation | Zod ^4.6 | All tool inputs/outputs |
| Tests | Vitest ^3 (`--root mcp-server`) | `pnpm test`, `pnpm test:coverage` |
| Build | `tsc -p mcp-server/tsconfig.json` | Output `mcp-server/dist` |
| Hosted endpoint | Vercel serverless functions (`api/*.js`, `vercel.json`) | Glama / remote connector |
| Database | None in project code | Workbench runtime wires PostgreSQL via MCP for other projects |
| Scripts | Bash (`scripts/`) + Node (`scripts/selftest`) | Inventories, backup, recovery, secret scan |

## Security Constraints

- No secret values, prefixes, or partials in repository files — enforced by
  `.gitignore` (`.env*`, `*.pem`, `*.key`, `credentials*`, `secrets*`) and
  gitleaks (`secret-scan.yml`, `.gitleaks.toml`).
- The clone connector writes an empty `~/.env.workbench` template; it must
  never read or transmit secret values.
- All external input at a tool boundary is validated with Zod.
- Never log tokens, passwords, or PII.
- New secrets are documented by name and purpose only in
  `docs/architecture/secrets.md` — never by value.
- `scripts/security/scan-secrets.sh` must pass before commit.

## Naming Conventions

- Files: kebab-case (`run-master-backup.sh`, `mcp-server/src/render.ts`)
- Variables/functions: camelCase
- Types/interfaces: PascalCase
- Constants / env vars: SCREAMING_SNAKE_CASE
- MCP tools: snake_case verbs (`inspect_target`, `plan_clone`, `apply_clone`)
- VDD IDs: `V-###` vision, `S-###` strategy, `T-###` tactics, `A-###` action
  items, `SP-##` specs, `PL-##` plans, `TK-##` tasks

## Banned Patterns

- No `any` in TypeScript (strict + `noUncheckedIndexedAccess`).
- No plain `.js` source files in `src/` — TypeScript only.
- No default exports when a named export suffices.
- No `.then()` chains where `async/await` applies.
- No secret values or prefixes committed, printed, or logged.
- No hardcoded absolute build-box paths in committed config without a
  documented reason (known defect: `DB_PATH` hardcodes `/workspaces/workbench`).
- No new app code outside `mcp-server/` (the root package is a launcher).
- No comments added to source unless requested.

## File Structure Rules

```
mcp-server/        # the opencode-workbench MCP server (src/ + test/)
  src/             # inspect / plan / apply / verify; local + SSH + HTTP
plugins/           # OpenCode plugins (memory.ts, doc-tools.ts)
scripts/           # backup / inventory / security / recovery / maintenance / selftest
vendor/            # vendored MCP source (perplexity-agent-mcp, browserless-mcp)
configs/           # reference MCP / shell / git / provider configuration
docs/              # charter, architecture, recovery, prompts, audit, VDD-derived records
.opencode/skills/  # the only tracked content under .opencode/
api/               # Vercel serverless handlers for the hosted connector
constitution.md    # this file (VDD Phase 0)
vdd/               # VDD artifacts (vision → strategy → tactics → specs; Phase 1+)
```

## Domain Primitives

- workstation-config
- mcp-server
- agent-skills
- automation-scripts
- recovery-and-backup

## Open Questions / Deferred Decisions

- [PENDING] VDD adoption scope — is the full 8-phase chain required for this
  repo, or only Phases 0–3 (constitution/vision/strategy/tactics) over the
  existing hand-rolled `docs/` system? (Prior review found 0 VDD artifacts.)
- [PENDING] MCP server count is stated 19 / 18 / 29 / 35 across
  `README.md`, `AGENTS.md`, and `opencode.json`; reconcile and add a CI
  assertion.
- [PENDING] `DB_PATH` path drift (`/workspaces/workbench` vs the actual
  `/workspaces/<repo-name>`); backlog I13/I21.
- [PENDING] `WORKFLOW_STATE.md` staleness and whether the AI-Web-App and
  Web-Scraper tracks remain in scope.
