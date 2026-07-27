# Security Audit Report

**Date:** 2026-07-27
**Scope:** Repository `/workspaces/codespace-workbench`, git history, live config, runtime cache
**Auditor:** OpenCode platform engineer

---

## 1. Secret Scanning

### 1.1 Tracked Files
**Result: CLEAN**

- No API keys, tokens, passwords, or private keys detected in any tracked file
- No `sk-`, `figd_`, `pplx-`, `sntry_` secret prefixes found in tracked content
- No `.env`, `*.pem`, `*.key`, `credentials*`, `secrets*` files exist in the repo
- All 13 MCP environment variables use `{env:VAR}` syntax in opencode.json
- All devcontainer secrets use `${localEnv:VAR}` syntax

### 1.2 Git History
**Result: CLEAN**

- Three historical commits matched `sk-` pattern search but contained only config boilerplate changes (plugin additions, MCP env var wiring), not actual secret values
- No SSH/SSL private keys ever committed
- No JWT tokens (`eyJ` prefix) committed

### 1.3 Runtime Cache
**Result: LOW RISK — stale cache**

- `~/.cache/opencode/packages/opencode-conductor/` — stale plugin cache from removed plugin
- Contains binary packages (msgpackr-extract, yaml) — not secret-bearing
- `~/.cache/opencode/models.json` — provider model catalog (public reference data)
- `mcp-auth.json` — vercel OAuth PKCE challenge (not tracked in git, safe)

### 1.4 Auth Files
**Result: CLEAN**

- `auth.json`: `{}` — previously cleaned, no hardcoded keys remain
- `mcp-auth.json`: Vercel OAuth state (clientId, codeVerifier, oauthState) — PKCE challenge data, not a persistent secret. NOT tracked in git.

### 1.5 Hardcoded Credentials in Config
**Result: 1 finding (LOW)**

- `devcontainer.json:27`: `DATABASE_URL` = `postgres://opencode:opencode@localhost:5432/memory`
  - Severity: **LOW** — local-only Postgres for development, never exposed externally
  - Mitigation: Acceptable for devcontainer; localhost binding prevents remote access

---

## 2. Configuration Audit

### 2.1 .gitignore Coverage
**Result: PASS**

| Pattern | Purpose | Status |
|---|---|---|
| `.env*` | Environment files | Covered |
| `!*.env.example` | Allow examples | Covered |
| `*.pem`, `*.key` | Private keys | Covered |
| `credentials*`, `secrets*` | Credential files | Covered |
| `.opencode/*` (except skills) | OpenCode runtime | Covered |
| `.cache/` | Cache directories | Covered |
| `.playwright-mcp/` | Playwright artifacts | Covered |
| `.saga/` | Saga tracker data | Covered |

### 2.2 opencode.json Validation
**Result: PASS**

- All provider API keys: `{env:VAR}` syntax
- All MCP environment variables: `{env:VAR}` syntax
- MCP auth headers: `Bearer {env:VAR}` syntax
- `plugin` array: `[]` — no supply chain risk
- `$schema` version: `https://opencode.ai/config.json`

### 2.3 devcontainer.json Validation
**Result: PASS**

- All secrets: `${localEnv:VAR}` syntax
- `DATABASE_URL`: hardcoded `opencode:opencode` (see 1.5)
- `DB_PATH`: hardcoded absolute path (acceptable for devcontainer)
- `postCreateCommand`: runs `.devcontainer/setup.sh`

### 2.4 Exposed Internal Identifiers
**Result: 3 findings**

| Finding | Location | Severity |
|---|---|---|
| `simonmak.app.n8n.cloud` | opencode.json:49 | **LOW** — public n8n cloud subdomain, already externally resolveable |
| `127.0.0.1:3333/mcp` | opencode.json:120 | **NONE** — local loopback, unreachable externally |
| `/home/node/` paths (13x) | opencode.json | **LOW** — codespace-specific paths, not sensitive |

---

## 3. Plugin Supply Chain Audit

**Result: EXEMPT** — no plugins declared (`"plugin": []`)

- Previous 17 plugins removed in commit `f682d5f`
- Stale `opencode-conductor` cache remains in `~/.cache/opencode/` — recommended cleanup
- No risk of typosquatted packages, malicious hooks, or unmaintained plugins

---

## 4. Access Audit

### 4.1 Repository Visibility
**Result: PASS**

- Repository: `simonplmak-cloud/codespace-workbench`
- Visibility: **PRIVATE**

### 4.2 Commit Authors
**Result: 1 finding (MEDIUM)**

| Email | Type | Severity |
|---|---|---|
| `simon.pl.mak@gmail.com` | Personal email in git metadata | **MEDIUM** |
| `246365505+simonplmak-cloud@users.noreply.github.com` | GitHub noreply (all other commits) | OK |

### 4.3 Exposed Paths / Usernames
**Result: LOW** — codespace-standard paths

- `/home/node/` — default codespace user directory
- `/workspaces/codespace-workbench/` — default workspace mount point
- `node` username — default codespace username
- No secrets combined with path exposure

---

## 5. Findings Summary

### Critical (0)
None.

### High (0)
None.

### Medium (1)

| ID | Finding | Remediation |
|---|---|---|
| ACC-01 | Personal email `simon.pl.mak@gmail.com` in git commit metadata | Set git config: `git config user.email "246365505+simonplmak-cloud@users.noreply.github.com"` and rewrite history or accept as-is |

### Low (3)

| ID | Finding | Remediation |
|---|---|---|
| CFG-01 | Hardcoded `opencode:opencode` in `DATABASE_URL` (devcontainer.json) | Acceptable for local dev — no action needed |
| EXP-01 | `simonmak.app.n8n.cloud` subdomain visible in opencode.json | Acceptable — public n8n cloud endpoint |
| CACHE-01 | Stale `opencode-conductor` plugin cache in `~/.cache/opencode/` | Run: `rm -rf ~/.cache/opencode/packages/opencode-conductor` |

---

## 6. Recommended Remediations

### Immediate
1. **Clean stale plugin cache** (`LOW`, CACHE-01):
   ```bash
   rm -rf ~/.cache/opencode/packages/opencode-conductor
   ```

### Short-term
2. **Configure git for noreply email** (`MEDIUM`, ACC-01):
   ```bash
   git config user.email "246365505+simonplmak-cloud@users.noreply.github.com"
   ```
3. **Update codespaces-secrets.md** to note that `opencode-conductor` plugin has been removed (cache is stale)

### Ongoing
4. **Run health check before push**: `bash scripts/maintenance/opencode-health-check.sh`
5. **Re-run this audit** after any config changes involving new plugins or providers

---

## 7. Audit Conclusion

**OVERALL: CLEAN** — No secrets exposed. No critical or high-severity findings.

The workstation configuration follows security best practices:
- All secrets use env-var references (`{env:VAR}` / `${localEnv:VAR}`)
- Repository is private
- `.gitignore` blocks all common secret file patterns
- No plugins pose supply chain risk (plugin array is empty)
- Auth.json has been wiped of hardcoded keys
- Failed MCP servers are disabled with documented reasons

**1 medium finding** (personal email in git history) and **3 low findings** (hardcoded local DB creds, public n8n subdomain, stale plugin cache).
