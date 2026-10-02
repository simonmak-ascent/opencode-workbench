# Contributing

This repository is a workstation profile and the `workbench` MCP clone tool.
Changes to the profile and to the MCP server are reviewed the same way.

## Setup

```bash
git clone https://github.com/simonplmak-cloud/workbench.git
cd workbench
```

## Ground rules

- Never commit secret values. Use `{env:VAR}` references only.
- Keep the workbench profile (root `opencode.json`) and the MCP server's portable
  profile in sync where they overlap.
- Do not run builds, tests, lint, or installs on the local workstation — offload
  them to a compute box (`cs best` / `cs run`), or rely on CI.
- MCP server code lives in `mcp-server/`; keep the root `package.json` a thin
  launcher only.

## Workflow

1. Branch from `main` (`feat/<scope>/<topic>`).
2. Make the change; update docs (`README.md`, `AGENTS.md`, `docs/`) in the same PR.
3. Verify on a compute box: `cs run "pnpm --dir mcp-server build && pnpm --dir mcp-server test"`.
4. Open a PR. CI runs gitleaks, doc validation, and the MCP server build/tests.
5. For security issues, see [SECURITY.md](./SECURITY.md).

## Commit style

Concise, imperative mood, describing intent (e.g. `feat(mcp): add ssh transport`).
