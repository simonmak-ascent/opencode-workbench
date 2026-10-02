# intangiable_valuation_model — architecture review

**Total 16.9/30** · Next · 108 tracked source files · 12 test files · 4 CI workflow(s)

Score against the ten best-practice categories, each 0–3 (0 absent · 1 partial · 2 present · 3 present and gated).

| Category | Score | Assessment |
|---|---|---|
| Security | 1.2 | weak |
| Accessibility | 1.8 | adequate |
| Performance | 1.2 | weak |
| SEO | 2.5 | strong |
| Privacy | 1.2 | weak |
| Reliability | 2.0 | adequate |
| Code quality | 1.6 | adequate |
| Testing | 2.2 | adequate |
| Observability | 1.2 | weak |
| DevOps/CI-CD | 1.8 | adequate |

## Criterion detail

### Security — 1.2/3

| Criterion | Score | Evidence |
|---|---|---|
| security headers | 1/3 | 1 config file(s) set headers |
| API authorization | 3/3 | no API routes to protect |
| input validation | 1/3 | zod present but unused |
| supply chain | 0/3 | lockfile=N audit_in_ci=N |

### Accessibility — 1.8/3

| Criterion | Score | Evidence |
|---|---|---|
| automated a11y tooling | 2/3 | axe_dep=True a11y_script=False |
| a11y gate in CI | 3/3 | ci_ref=True |
| semantics (skip link / main / lang) | 2/3 | 2/3 present |
| declared conformance target | 0/3 | not stated |

### Performance — 1.2/3

| Criterion | Score | Evidence |
|---|---|---|
| render strategy | 3/3 | 0 force-dynamic, 1 static/ISR signals |
| image optimisation | 1/3 | next/image=0 raw_img=0 |
| CWV measurement | 0/3 | no CWV tooling |
| JS budget / splitting | 1/3 | not measured by this audit |

### SEO — 2.5/3

| Criterion | Score | Evidence |
|---|---|---|
| per-page metadata | 3/3 | 5 metadata exports |
| canonical URLs | 2/3 | 2 references |
| sitemap + robots | 3/3 | sitemap=True robots=True |
| structured data / i18n SEO | 2/3 | jsonld=1 hreflang=0 |

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
| linter | 2/3 | eslint.config.mjs |
| formatter | 0/3 | NONE |
| no console.log in app code | 1/3 | 18 in app code |

### Testing — 2.2/3

| Criterion | Score | Evidence |
|---|---|---|
| unit tests | 2/3 | 12 test files |
| E2E | 2/3 | playwright.config.ts |
| coverage gate | 2/3 | configured |
| tests in CI | 3/3 | ci.yml, full-site-test.yml, publish.yml |

### Observability — 1.2/3

| Criterion | Score | Evidence |
|---|---|---|
| structured logger | 0/3 | NONE |
| error tracking | 2/3 | sentry |
| audit trail | 2/3 | 42 refs |
| request correlation ids | 1/3 | not evidenced by this audit |

### DevOps/CI-CD — 1.8/3

| Criterion | Score | Evidence |
|---|---|---|
| CI pipeline | 3/3 | ci.yml, full-site-test.yml, publish.yml, quality.yml |
| deploy config | 2/3 | vercel.json |
| extra quality gates | 2/3 | 4 workflows |
| lockfile reproducibility | 0/3 | NO LOCKFILE |

## Verified findings

| Severity | Finding |
|---|---|
| **INFO** | No API routes (nothing to protect) and Sentry present. Images are raw `<img>` with no `next/image`. |

## Summary

- **Strong:** SEO
- **Weak or absent:** —

Scores of 1 on *JS budget/splitting* and *request correlation ids* mean *not evidenced by this audit*, not *failed*.
