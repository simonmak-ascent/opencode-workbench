# valuation_report — architecture review

**Total 14.1/30** · Next · 239 tracked source files · 25 test files · 4 CI workflow(s)

Score against the ten best-practice categories, each 0–3 (0 absent · 1 partial · 2 present · 3 present and gated).

| Category | Score | Assessment |
|---|---|---|
| Security | 1.5 | adequate |
| Accessibility | 1.0 | weak |
| Performance | 1.0 | weak |
| SEO | 2.5 | strong |
| Privacy | 1.2 | weak |
| Reliability | 1.2 | weak |
| Code quality | 0.8 | weak |
| Testing | 2.0 | adequate |
| Observability | 0.5 | absent |
| DevOps/CI-CD | 2.2 | adequate |

## Criterion detail

### Security — 1.5/3

| Criterion | Score | Evidence |
|---|---|---|
| security headers | 2/3 | 2 config file(s) set headers |
| API authorization | 1/3 | 11/33 guard in-route; remainder needs manual review |
| input validation | 2/3 | zod used in 4 modules |
| supply chain | 1/3 | lockfile=y audit_in_ci=N |

### Accessibility — 1.0/3

| Criterion | Score | Evidence |
|---|---|---|
| automated a11y tooling | 0/3 | axe_dep=False a11y_script=False |
| a11y gate in CI | 1/3 | ci_ref=True |
| semantics (skip link / main / lang) | 3/3 | 3/3 present |
| declared conformance target | 0/3 | not stated |

### Performance — 1.0/3

| Criterion | Score | Evidence |
|---|---|---|
| render strategy | 0/3 | 20 force-dynamic, 0 static/ISR signals |
| image optimisation | 3/3 | next/image=6 raw_img=0 |
| CWV measurement | 0/3 | no CWV tooling |
| JS budget / splitting | 1/3 | not measured by this audit |

### SEO — 2.5/3

| Criterion | Score | Evidence |
|---|---|---|
| per-page metadata | 3/3 | 3 metadata exports |
| canonical URLs | 2/3 | 2 references |
| sitemap + robots | 3/3 | sitemap=True robots=True |
| structured data / i18n SEO | 2/3 | jsonld=1 hreflang=0 |

### Privacy — 1.2/3

| Criterion | Score | Evidence |
|---|---|---|
| privacy/cookie pages | 0/3 | 0 route files |
| third-party trackers | 2/3 | 0 tracker reference(s) |
| PII stance documented | 2/3 | constitution present |
| retention/audit policy | 1/3 | not evidenced by this audit |

### Reliability — 1.2/3

| Criterion | Score | Evidence |
|---|---|---|
| error boundary | 0/3 | NONE |
| 404 page | 0/3 | NONE |
| external-call timeouts/retries | 3/3 | 28 references |
| DB failure handling | 2/3 | per-code inspection |

### Code quality — 0.8/3

| Criterion | Score | Evidence |
|---|---|---|
| TS strict | 2/3 | strict: true |
| no `any` | 0/3 | 167 occurrences in app code |
| linter | 2/3 | .eslintrc.json |
| formatter | 0/3 | NONE |
| no console.log in app code | 0/3 | 145 in app code |

### Testing — 2.0/3

| Criterion | Score | Evidence |
|---|---|---|
| unit tests | 3/3 | 25 test files |
| E2E | 0/3 | NONE |
| coverage gate | 2/3 | configured |
| tests in CI | 3/3 | ci.yml, db-staging-refresh.yml, opencode-auto.yml |

### Observability — 0.5/3

| Criterion | Score | Evidence |
|---|---|---|
| structured logger | 0/3 | NONE |
| error tracking | 0/3 | NONE |
| audit trail | 1/3 | 2 refs |
| request correlation ids | 1/3 | not evidenced by this audit |

### DevOps/CI-CD — 2.2/3

| Criterion | Score | Evidence |
|---|---|---|
| CI pipeline | 3/3 | ci.yml, db-staging-refresh.yml, opencode-auto.yml, opencode.yml |
| deploy config | 2/3 | vercel.json |
| extra quality gates | 2/3 | 4 workflows |
| lockfile reproducibility | 2/3 | .opencode/package-lock.json |

## Verified findings

| Severity | Finding |
|---|---|
| **HIGH** | **API authorization depends on every route remembering to check.** `middleware.ts` lists only page routes (/, /research, /forex-research, /fixed-incomes, /bond-research, /admin) — it never matches `/api`, so nothing centrally protects the API. 21 of 32 API routes show no session assertion. Verified by reading: `stream-research-v2`, `industry-research`, `research`, `classify-input`, `sectors`, `forex` contain no guard. |
| **HIGH** | **Unauthenticated paid-API endpoints.** `research/route.ts` and `classify-input/route.ts` read `EODHD_API_KEY` / `DEEPSEEK_API_KEY` and call those services, with no session check and no API middleware — the only key references are *outbound*. That is unauthenticated third-party cost exposure, not just a data leak. |
| **MEDIUM** | No error boundary and no 404 page (`app/error.tsx`, `app/not-found.tsx`, `app/global-error.tsx` all absent) — an uncaught render error surfaces as Next's default page. |
| **MEDIUM** | No structured logger and no error tracking; logging is `console.log` (145 occurrences in application code). Nothing correlates a failure to a request. |
| **MEDIUM** | 167 explicit `any` in application code, so `strict: true` in tsconfig is opted out of where it matters most. |
| **LOW** | No accessibility tooling (no axe dependency, no a11y script) although a CI workflow references accessibility; no in-app skip link. |
| **LOW** | 20 `force-dynamic` exports vs 4 static/ISR signals — the app opts out of pre-rendering almost everywhere. |

## Summary

- **Strong:** SEO
- **Weak or absent:** Accessibility, Performance, Code quality, Observability

Scores of 1 on *JS budget/splitting* and *request correlation ids* mean *not evidenced by this audit*, not *failed*.
