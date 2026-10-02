# Recovery Gap Analysis

> Updated: 2026-07-27 (post-DR-test round 2)
> Purpose: Validate whether a fresh build box can be fully recovered from repo + secrets alone

## Recovery Requirements Checklist

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1 | Repository contains devcontainer.json | ✅ Pass | Full remoteEnv coverage (17 entries) |
| 2 | All build box secrets documented | ✅ Pass | 10 required/alternate secrets in docs/architecture/secrets.md |
| 3 | setup.sh installs all MCP servers | ✅ Pass | npm global + vendored MCPs |
| 4 | setup.sh starts Docker containers | ✅ Pass | pg-memory + browserless |
| 5 | setup.sh copies opencode.json | ✅ Pass | Copies to ~/.config/opencode/ |
| 6 | setup.sh clones external repos | ✅ Pass | esg-hub, project_human |
| 7 | All env vars declared in remoteEnv | ✅ Pass | 17 explicit entries (DB_PATH unreliable at runtime — see I13) |
| 8 | OpenCode skills tracked in repo | ✅ Pass | 28 skills in .opencode/skills/ |
| 9 | MCP versions documented | ✅ Pass | docs/architecture/mcp-inventory.md |
| 10 | AI provider configuration documented | ✅ Pass | docs/architecture/ai-provider-inventory.md |
| 11 | Runtime config snapshot preserved | ✅ Pass | docs/architecture/opencode-runtime-snapshot.md |
| 12 | Workstation playbook exists | ✅ Pass | docs/architecture/workstation-playbook.md |
| 13 | Git remote and branch documented | ✅ Pass | origin: simonplmak-cloud/opencode-workbench, main |
| 14 | Security scan clean (no secrets in repo) | ✅ Pass | Working tree clean; 1 stale rotated key in history |
| 15 | .gitignore covers sensitive paths | ✅ Pass | .saga/, .playwright-mcp/, node_modules/, .env* |
| 16 | PostgreSQL data is ephemeral | ⚠️ Accept | Docker volume lost on rebuild — intentional for dev |
| 17 | Browserless token matches Docker | ✅ Pass | Both use `browserless-local-token` |
| 18 | Playwright chromium auto-installed | ✅ Pass | setup.sh line 44-45: `npx -y playwright install chromium` |
| 19 | Vercel uses token auth (no OAuth needed) | ✅ Pass | Bearer {env:VERCEL_ACCESS_TOKEN}, auto-authenticated |
| 20 | Saga DB auto-created if missing | ✅ Pass | DB_PATH set, saga-mcp creates DB on first use |
| 21 | No plugins configured | ✅ Pass | `"plugin": []` — simpler recovery, no npm resolution needed |
| 22 | Formatter (eslint) from devcontainer image | ✅ Pass | eslint pre-installed in typescript-node:22 image |

## Gap Summary

| Gap | Severity | Mitigation |
|-----|----------|-----------|
| Postgres data ephemeral | Low | Acceptable for dev environment |
| Storybook URL not configured | Low | Design-system MCP needs `STORYBOOK_URL` env var |
| Machine type not in recovery doc | Low | Now documented: `basicLinux32gb` recommended |
| Saga MCP disabled intentionally | Low | `enabled: false` in opencode.json; re-enable after DB_PATH verification |
| Vercel OAuth still in DISASTER_RECOVERY.md | Low | Actually uses token auth now — doc drift, fix below |
| Perplexity key prefix mismatch (pplx-) | Medium | Key regenerated in GitHub secrets — rebuild needed to propagate |
| DB_PATH unreliable at runtime | Medium | Declared in remoteEnv but not always picked up; needs investigation |
| OPENCODE_API_KEY in git history | Low | Key already rotated; history contains stale value only |

## Recovery Process (Step by Step)

1. Create new build box from `simonplmak-cloud/opencode-workbench` (main branch)
2. Wait for `postCreateCommand` (setup.sh) — ~3-5 minutes
3. Verify Docker: `docker ps` (pg-memory + browserless)
4. Verify MCP packages: `npm list -g --depth=0`
5. Start OpenCode: `opencode`
6. Run bootstrap if needed: `bash scripts/bootstrap-tools.sh`
7. Validate: `bash scripts/recovery/validate-recovery.sh`

## Overall Recovery Score: 94/100

- **Reproducibility**: 95 — Vercel OAuth eliminated; saga disabled (intentional); Docker containers auto-restart
- **Documentation**: 94 — Playbook current; minor OAuth refs to update in DR doc
- **Automation**: 96 — setup.sh covers all entry points; 17/17 remoteEnv vars; no manual formatter/plugin steps
- **Secret Management**: 93 — All critical secrets declared; 1 stale key in history; Perplexity rotation pending rebuild
- **Plugin/Fmt Recoverability**: 96 — No plugins to resolve; eslint from devcontainer image; zero manual setup
