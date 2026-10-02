# Security Model

> Version: 1.0.0 | Last reviewed: 2026-07-26

## Architecture

```
┌──────────────────────────────────────────────┐
│          the SWAS box Secrets            │
│  (encrypted at rest, injected at runtime)     │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│        devcontainer.json remoteEnv            │
│  (declares which secrets to propagate)        │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│        Container Environment Variables        │
│  (available to all processes)                 │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│        opencode.json {env:VAR} references     │
│  (maps env vars to MCP server processes)      │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│           MCP Server Processes                │
│  (receive secrets via process environment)    │
└──────────────────────────────────────────────┘
```

## Secret Classification

| Tier | Description | Examples | Storage |
|------|-------------|----------|---------|
| **Tier 0 — Platform** | GitHub-injected tokens | `GITHUB_TOKEN`, `GH_TOKEN` | Automatic |
| **Tier 1 — Critical** | Required for core function | `DEEPSEEK_API_KEY`, `SIMONPLMAK_CLOUD_PAT` | SWAS Secrets |
| **Tier 2 — Operational** | Required for MCP servers | `BRAVE_API_KEY`, `SENTRY_AUTH_TOKEN`, `FIGMA_TOKEN`, `PERPLEXITY_API_KEY`, `BROWSERLESS_TOKEN` | SWAS Secrets |
| **Tier 3 — Optional** | Nice to have, not critical | `OPENROUTER_API_KEY`, `GOOGLE_API_KEY`, `KIMI_API_KEY` | SWAS Secrets |
| **Tier 4 — Non-Secret** | Configuration only | `DATABASE_URL`, `DB_PATH`, `BROWSERLESS_HOST` | `devcontainer.json` |

## Defense in Depth

### Layer 1: Repository Hygiene
- `.gitignore` blocks: `.env*` (except `.env.example`), `*.pem`, `*.key`, `credentials*`, `secrets*`
- Pre-commit security scan script available
- No secrets in tracked files (verified: 2026-07-26)

### Layer 2: Runtime Isolation
- Secrets only accessible to processes that need them
- Each MCP server receives only its required environment variables
- `opencode.json` uses named `{env:VAR}` references (not blanket env passthrough)

### Layer 3: Documentation Discipline
- Secrets documented by name and purpose only
- Never record values, prefixes, or lengths in docs
- Recovery methods documented without exposing tokens

### Layer 4: Recovery Preparedness
- All required secrets inventoried in `docs/architecture/SWAS-secrets.md`
- Recovery playbook includes secret validation step
- Missing secrets detectable via environment validation script

## Threat Model

| Threat | Mitigation |
|--------|-----------|
| Accidental secret commit | `.gitignore` + pre-commit scan |
| Secret leak via logs | MCP servers receive narrow env, not full environment |
| Lost secrets | Full inventory with recovery methods in docs |
| Unauthorized access | the SWAS box Secrets are encrypted, scoped to repository |
| Configuration drift | Runtime sync scripts, inventory comparison |

## Security Scan

Run: `bash scripts/security/scan-secrets.sh`

This scans for known secret patterns (`sk-`, `ghp_`, `pplx-`, `figd_`, `sntryu_`, `BSA`, etc.) in all tracked files.

## Incident Response

If a secret is committed:
1. Immediately revoke the secret at its source
2. Remove from git history using `git filter-branch` or `BFG Repo-Cleaner`
3. Force push after confirming history is clean
4. Rotate all related credentials
5. Document the incident in backup report
