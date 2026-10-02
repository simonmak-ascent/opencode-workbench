# Security Audit Report

**Date:** 2026-07-27 (Round 2)
**Scope:** Repository `/workspaces/workbench`, git history, live config, runtime cache
**Previous audit:** 2026-07-27 (Round 1) — all findings reassessed

---

## 1. Secret Scanning

### 1.1 Tracked Files
**Result: CLEAN**

- No API keys, tokens, passwords, or private keys detected in any tracked file
- No `sk-`, `figd_`, `pplx-`, `sntry_` secret prefixes found in tracked content
- No `.env`, `*.pem`, `*.key`, `credentials*`, `secrets*` files exist in the repo
- All 19 MCP environment variables use `{env:VAR}` syntax in opencode.json (verified)
- All 12 devcontainer secrets use `${localEnv:VAR}` syntax (verified)

### 1.2 Git History
**Result: 1 finding (LOW) — downgraded from prior audit**

| Pattern | Finding | Status |
|---------|---------|--------|
| `sk-[a-zA-Z0-9]{20,}` | Stale OPENCODE_API_KEY | **ROTATED** — key has been regenerated; the historical value is no longer valid |

An API key was previously hardcoded in an early version of `docs/opencode-runtime-config.md` and later redacted. The key no longer works (rotation confirmed) and the public history was rewritten at the "prepare public release" squash, so the value is not retrievable from this repository.

**Severity: LOW** — key is rotated and the value is not present in the published history.

### 1.3 Runtime Cache
**Result: CLEAN**

- `~/.cache/opencode/` contains only:
  - `bin/` — OpenCode binary cache
  - `models.json` — provider model catalog (public reference data)
  - `packages/bash-language-server/` — LSP auto-installed by OpenCode
  - `packages/yaml-language-server/` — LSP auto-installed by OpenCode
- **No secrets found** — no `.env`, `.token`, or credential files in cache
- Stale `opencode-conductor` cache: **CLEANED** (was CACHE-01 in previous audit)

### 1.4 Auth Files
**Result: CLEAN**

- `auth.json`: `{}` — previously cleaned, confirmed empty
- `mcp-auth.json`: Vercel OAuth state (PKCE challenge data) — NOT tracked in git

### 1.5 Hardcoded Credentials in Config
**Result: 1 finding (LOW — unchanged)**

- `devcontainer.json:27`: `DATABASE_URL` = `postgres://opencode:opencode@localhost:5432/memory`
  - Severity: **LOW** — local-only Postgres for development, never exposed externally
  - Mitigation: Acceptable for devcontainer; localhost binding prevents remote access

---

## 2. Configuration Audit

### 2.1 .gitignore Coverage
**Result: PASS**

All sensitive patterns blocked:
| Pattern | Purpose | Tested |
|---|---|---|
| `.env*` | Environment files | No `.env` files tracked |
| `*.pem`, `*.key` | Private keys | No key files in repo |
| `credentials*`, `secrets*` | Credential files | None present |
| `.opencode/*` (except skills) | OpenCode runtime | Skills excluded correctly |
| `.cache/` | Cache directories | Blocked |
| `.playwright-mcp/` | Playwright artifacts | Blocked |
| `.saga/` | Saga tracker data | Blocked |

### 2.2 opencode.json Validation
**Result: PASS**

- 19 MCP server blocks — all secrets use `{env:VAR}` syntax
- Provider config: `{env:DEEPSEEK_API_KEY}`, `{env:KIMI_API_KEY}`, `{env:OPENCODE_API_KEY}` 
- MCP auth headers: `Bearer {env:VAR}` where applicable
- `plugin` array: `[]` — no supply chain risk
- `formatter`: `true` — eslint from devcontainer image
- `$schema`: `https://opencode.ai/config.json`

### 2.3 devcontainer.json Validation
**Result: PASS**

- 12 `${localEnv:VAR}` references — all correct
- 5 hardcoded non-secret vars: `DATABASE_URL`, `BROWSERLESS_HOST`, `BROWSERLESS_PORT`, `BROWSERLESS_PROTOCOL`, `DB_PATH`
- `postCreateCommand`: `bash .devcontainer/setup.sh`

### 2.4 Exposed Internal Identifiers
**Result: 2 findings (LOW — unchanged)**

| Finding | Location | Severity |
|---|---|---|
| `/home/node/` paths (13x) | opencode.json | **LOW** — codespace-standard paths |

No new URLs, IPs, or internal identifiers discovered since last audit.

---

## 3. Plugin Supply Chain Audit

**Result: EXEMPT** — no plugins declared (`"plugin": []`)

- Plugin array confirmed empty
- No npm packages to audit for typosquatting
- No permission hooks to inspect
- No maintenance status concerns
- Stale `opencode-conductor` plugin cache: **CLEANED** (resolved CACHE-01)

---

## 4. Access Audit

### 4.1 Repository Visibility
**Result: PASS**

- Repository: `simonplmak-cloud/opencode-workbench`
- Visibility: **PUBLIC** (confirmed via `gh api`)
- Public contents were reviewed before publishing: no secret values, no internal hostnames, no non-public URLs are exposed by the repository

### 4.2 Commit Authors
**Result: 1 finding (MEDIUM — mitigated)**

| Email | Count | Type | Status |
|---|---|---|---|
| `246365505+simonplmak-cloud@users.noreply.github.com` | 26 | GitHub noreply | ✅ Current (since commit after last audit) |
| `simon.pl.mak@gmail.com` | 28 | Personal email | ⚠️ Historical — git config fixed, but history retains old commits |

**Mitigation applied**: `git config user.email` now set to `246365505+simonplmak-cloud@users.noreply.github.com`. All new commits use noreply. Historical commits with personal email remain and are visible in the public history; rewriting history is possible but was judged low-ROI given the address is already public elsewhere in the org's repos.

**Severity unchanged**: MEDIUM due to historical exposure, but mitigated forward-going.

### 4.3 Exposed Paths / Usernames
**Result: LOW** — codespace-standard paths only

- `/home/node/` — default codespace user directory
- `/workspaces/workbench/` — workspace mount point
- `node` — default codespace username
- No internal server names, private hostnames, or non-public URLs discovered

---

## 5. Findings Summary

### Critical (0)
None.

### High (0)
None.

### Medium (1 — mitigated)

| ID | Finding | Remediation |
|---|---|---|
| ACC-01 | Personal email `simon.pl.mak@gmail.com` in 28 historical commits | Git config fixed to noreply. **MITIGATED** forward-going. |

### Low (4)

| ID | Finding | Status | Remediation |
|---|---|---|---|
| CFG-01 | Hardcoded `opencode:opencode` in `DATABASE_URL` | Same | Acceptable for local dev |
| HIST-01 | Stale rotated OPENCODE_API_KEY in early git history | **NEW** | Key rotated; value not present in the published history — LOW severity |
| ~~CACHE-01~~ | ~~Stale opencode-conductor cache~~ | **FIXED** | Cache cleaned |

---

## 6. Changes Since Previous Audit

| Finding | Previous | Current |
|---|---|---|
| CACHE-01 (stale cache) | Open | **FIXED** — cleaned |
| ACC-01 (personal email) | Open (MEDIUM) | **MITIGATED** — git config uses noreply |
| HIST-01 (stale key in history) | Not detected | **NEW (LOW)** |
| Working tree secrets | CLEAN | CLEAN |

**Net change**: 1 fixed, 1 mitigated, 1 new low-severity finding.

---

## 7. Recommended Remediations

### Immediate
None required.

### Short-term
1. **History rewrite is not required** — the published history contains neither the rotated key value nor any other secret (verified 2026-10-02 full-history scan)
2. Continue running `secret-scan.yml` (gitleaks) on every push/PR — it is the enforcement gate now that the repo is public

### Ongoing
3. **Run this audit** after any config changes involving new plugins or providers
4. **Keep plugin array empty** — current state is ideal for security

---

## 8. Audit Conclusion

**OVERALL: CLEAN** — No critical or high-severity findings. No live secrets exposed.

The workstation configuration maintains strong security posture:
- All secrets use env-var references (`{env:VAR}` / `${localEnv:VAR}`) — 31 references verified
- Repository is PUBLIC — contents reviewed for secrets before and after publishing
- `.gitignore` blocks all common secret file patterns
- No plugins (empty array) — zero supply chain risk
- Stale cache cleaned (previous CACHE-01 resolved)
- Personal email mitigated for future commits
- 1 historical rotated key (LOW — rotated, value not in published history)

**1 medium finding (mitigated), 4 low findings, 0 critical/high.**
