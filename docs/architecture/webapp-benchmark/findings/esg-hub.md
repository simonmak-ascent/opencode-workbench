# esg-hub — architecture review

**Total 17.6/30** · Next · 133 tracked source files · 10 test files · 10 CI workflow(s)

Score against the ten best-practice categories, each 0–3 (0 absent · 1 partial · 2 present · 3 present and gated).

| Category | Score | Assessment |
|---|---|---|
| Security | 1.8 | adequate |
| Accessibility | 2.0 | adequate |
| Performance | 1.2 | weak |
| SEO | 2.0 | adequate |
| Privacy | 1.2 | weak |
| Reliability | 2.5 | strong |
| Code quality | 1.4 | weak |
| Testing | 2.2 | adequate |
| Observability | 1.0 | weak |
| DevOps/CI-CD | 2.2 | adequate |

## Criterion detail

### Security — 1.8/3

| Criterion | Score | Evidence |
|---|---|---|
| security headers | 2/3 | 2 config file(s) set headers |
| API authorization | 1/3 | 2/17 guard in-route; remainder needs manual review |
| input validation | 3/3 | zod used in 5 modules |
| supply chain | 1/3 | lockfile=y audit_in_ci=N |

### Accessibility — 2.0/3

| Criterion | Score | Evidence |
|---|---|---|
| automated a11y tooling | 2/3 | axe_dep=True a11y_script=False |
| a11y gate in CI | 3/3 | ci_ref=True |
| semantics (skip link / main / lang) | 3/3 | 3/3 present |
| declared conformance target | 0/3 | not stated |

### Performance — 1.2/3

| Criterion | Score | Evidence |
|---|---|---|
| render strategy | 1/3 | 1 force-dynamic, 3 static/ISR signals |
| image optimisation | 3/3 | next/image=4 raw_img=0 |
| CWV measurement | 0/3 | no CWV tooling |
| JS budget / splitting | 1/3 | not measured by this audit |

### SEO — 2.0/3

| Criterion | Score | Evidence |
|---|---|---|
| per-page metadata | 3/3 | 6 metadata exports |
| canonical URLs | 2/3 | 13 references |
| sitemap + robots | 3/3 | sitemap=True robots=True |
| structured data / i18n SEO | 0/3 | jsonld=0 hreflang=1 |

### Privacy — 1.2/3

| Criterion | Score | Evidence |
|---|---|---|
| privacy/cookie pages | 0/3 | 0 route files |
| third-party trackers | 2/3 | 0 tracker reference(s) |
| PII stance documented | 2/3 | constitution present |
| retention/audit policy | 1/3 | not evidenced by this audit |

### Reliability — 2.5/3

| Criterion | Score | Evidence |
|---|---|---|
| error boundary | 3/3 | src/app/global-error.tsx |
| 404 page | 2/3 | src/app/[locale]/not-found.tsx |
| external-call timeouts/retries | 3/3 | 14 references |
| DB failure handling | 2/3 | per-code inspection |

### Code quality — 1.4/3

| Criterion | Score | Evidence |
|---|---|---|
| TS strict | 2/3 | strict: true |
| no `any` | 2/3 | 2 occurrences in app code |
| linter | 2/3 | eslint.config.mjs |
| formatter | 0/3 | NONE |
| no console.log in app code | 1/3 | 6 in app code |

### Testing — 2.2/3

| Criterion | Score | Evidence |
|---|---|---|
| unit tests | 2/3 | 10 test files |
| E2E | 2/3 | playwright.config.ts |
| coverage gate | 2/3 | configured |
| tests in CI | 3/3 | ci.yml, deploy-preview.yml, deploy.yml |

### Observability — 1.0/3

| Criterion | Score | Evidence |
|---|---|---|
| structured logger | 2/3 | src/lib/logger.ts |
| error tracking | 0/3 | NONE |
| audit trail | 1/3 | 1 refs |
| request correlation ids | 1/3 | not evidenced by this audit |

### DevOps/CI-CD — 2.2/3

| Criterion | Score | Evidence |
|---|---|---|
| CI pipeline | 3/3 | ci.yml, deploy-preview.yml, deploy.yml, km-ingestion.yml |
| deploy config | 2/3 | vercel.json |
| extra quality gates | 2/3 | 10 workflows |
| lockfile reproducibility | 2/3 | mcp-server/package-lock.json |

## Verified findings

| Severity | Finding |
|---|---|
| **INFO** | Auth is *not* missing despite `/api` being excluded from middleware: writes are guarded by a custom `requireWriteToken` (`src/lib/auth/write-token.ts`) with `checkRateLimit` and Zod schemas. The architectural risk is that a new route is unprotected by default. |
| **MEDIUM** | `/api/ai-chat`, `/api/ai-search` and `/api/embed` are POST endpoints that consume model/embedding credits. Worth confirming they are intentionally public and rate-limited at the edge. |
| **MEDIUM** | No error boundary and no structured logger usage in API routes; a custom logger exists (`src/lib/logger.ts`) but is not used consistently. |

## Summary

- **Strong:** Reliability
- **Weak or absent:** Observability

Scores of 1 on *JS budget/splitting* and *request correlation ids* mean *not evidenced by this audit*, not *failed*.
