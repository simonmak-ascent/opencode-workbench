# startup_valuation_model — architecture review

**Total 15.1/30** · Next · 106 tracked source files · 4 test files · 8 CI workflow(s)

Score against the ten best-practice categories, each 0–3 (0 absent · 1 partial · 2 present · 3 present and gated).

| Category | Score | Assessment |
|---|---|---|
| Security | 1.5 | adequate |
| Accessibility | 0.5 | absent |
| Performance | 0.8 | weak |
| SEO | 2.5 | strong |
| Privacy | 1.2 | weak |
| Reliability | 2.0 | adequate |
| Code quality | 1.6 | adequate |
| Testing | 2.0 | adequate |
| Observability | 1.2 | weak |
| DevOps/CI-CD | 1.8 | adequate |

## Criterion detail

### Security — 1.5/3

| Criterion | Score | Evidence |
|---|---|---|
| security headers | 1/3 | 1 config file(s) set headers |
| API authorization | 3/3 | middleware covers /api (7 routes) |
| input validation | 2/3 | zod used in 1 modules |
| supply chain | 0/3 | lockfile=N audit_in_ci=N |

### Accessibility — 0.5/3

| Criterion | Score | Evidence |
|---|---|---|
| automated a11y tooling | 0/3 | axe_dep=False a11y_script=False |
| a11y gate in CI | 0/3 | ci_ref=False |
| semantics (skip link / main / lang) | 2/3 | 2/3 present |
| declared conformance target | 0/3 | not stated |

### Performance — 0.8/3

| Criterion | Score | Evidence |
|---|---|---|
| render strategy | 1/3 | 8 force-dynamic, 2 static/ISR signals |
| image optimisation | 1/3 | next/image=0 raw_img=0 |
| CWV measurement | 0/3 | no CWV tooling |
| JS budget / splitting | 1/3 | not measured by this audit |

### SEO — 2.5/3

| Criterion | Score | Evidence |
|---|---|---|
| per-page metadata | 3/3 | 10 metadata exports |
| canonical URLs | 2/3 | 14 references |
| sitemap + robots | 3/3 | sitemap=True robots=True |
| structured data / i18n SEO | 2/3 | jsonld=3 hreflang=0 |

### Privacy — 1.2/3

| Criterion | Score | Evidence |
|---|---|---|
| privacy/cookie pages | 2/3 | 1 route files |
| third-party trackers | 2/3 | 0 tracker reference(s) |
| PII stance documented | 0/3 | no constitution |
| retention/audit policy | 1/3 | not evidenced by this audit |

### Reliability — 2.0/3

| Criterion | Score | Evidence |
|---|---|---|
| error boundary | 3/3 | app/error.tsx |
| 404 page | 2/3 | app/not-found.tsx |
| external-call timeouts/retries | 1/3 | 1 references |
| DB failure handling | 2/3 | per-code inspection |

### Code quality — 1.6/3

| Criterion | Score | Evidence |
|---|---|---|
| TS strict | 2/3 | strict: true |
| no `any` | 3/3 | 0 occurrences in app code |
| linter | 0/3 | NONE |
| formatter | 2/3 | prettier.config.mjs |
| no console.log in app code | 1/3 | 11 in app code |

### Testing — 2.0/3

| Criterion | Score | Evidence |
|---|---|---|
| unit tests | 1/3 | 4 test files |
| E2E | 2/3 | playwright.config.ts |
| coverage gate | 2/3 | configured |
| tests in CI | 3/3 | ci.yml, codeql.yml, deploy.yml |

### Observability — 1.2/3

| Criterion | Score | Evidence |
|---|---|---|
| structured logger | 0/3 | NONE |
| error tracking | 2/3 | sentry |
| audit trail | 2/3 | 72 refs |
| request correlation ids | 1/3 | not evidenced by this audit |

### DevOps/CI-CD — 1.8/3

| Criterion | Score | Evidence |
|---|---|---|
| CI pipeline | 3/3 | ci.yml, codeql.yml, deploy.yml, docs.yml |
| deploy config | 2/3 | vercel.json |
| extra quality gates | 2/3 | 8 workflows |
| lockfile reproducibility | 0/3 | NO LOCKFILE |

## Verified findings

| Severity | Finding |
|---|---|
| **INFO** | Rich CI (CodeQL, lighthouse, pip-audit, scorecard) and Sentry. Middleware covers `/api/export` only; 3 of 6 routes guard in-route. |

## Summary

- **Strong:** SEO
- **Weak or absent:** Accessibility, Performance

Scores of 1 on *JS budget/splitting* and *request correlation ids* mean *not evidenced by this audit*, not *failed*.
