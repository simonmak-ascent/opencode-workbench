# ascent-accessibility — architecture review

**Total 18.6/30** · Next · 517 tracked source files · 117 test files · 2 CI workflow(s)

Score against the ten best-practice categories, each 0–3 (0 absent · 1 partial · 2 present · 3 present and gated).

| Category | Score | Assessment |
|---|---|---|
| Security | 2.0 | adequate |
| Accessibility | 2.0 | adequate |
| Performance | 1.0 | weak |
| SEO | 2.5 | strong |
| Privacy | 1.0 | weak |
| Reliability | 2.5 | strong |
| Code quality | 1.6 | adequate |
| Testing | 2.5 | strong |
| Observability | 1.8 | adequate |
| DevOps/CI-CD | 1.8 | adequate |

## Criterion detail

### Security — 2.0/3

| Criterion | Score | Evidence |
|---|---|---|
| security headers | 2/3 | 3 config file(s) set headers |
| API authorization | 1/3 | 21/44 guard in-route; remainder needs manual review |
| input validation | 3/3 | zod used in 17 modules |
| supply chain | 2/3 | lockfile=y audit_in_ci=y |

### Accessibility — 2.0/3

| Criterion | Score | Evidence |
|---|---|---|
| automated a11y tooling | 2/3 | axe_dep=True a11y_script=False |
| a11y gate in CI | 3/3 | ci_ref=True |
| semantics (skip link / main / lang) | 3/3 | 3/3 present |
| declared conformance target | 0/3 | not stated |

### Performance — 1.0/3

| Criterion | Score | Evidence |
|---|---|---|
| render strategy | 1/3 | 12 force-dynamic, 31 static/ISR signals |
| image optimisation | 2/3 | next/image=1 raw_img=11 |
| CWV measurement | 0/3 | no CWV tooling |
| JS budget / splitting | 1/3 | not measured by this audit |

### SEO — 2.5/3

| Criterion | Score | Evidence |
|---|---|---|
| per-page metadata | 3/3 | 46 metadata exports |
| canonical URLs | 2/3 | 20 references |
| sitemap + robots | 3/3 | sitemap=True robots=True |
| structured data / i18n SEO | 2/3 | jsonld=4 hreflang=5 |

### Privacy — 1.0/3

| Criterion | Score | Evidence |
|---|---|---|
| privacy/cookie pages | 2/3 | 2 route files |
| third-party trackers | 1/3 | 1 tracker reference(s) |
| PII stance documented | 0/3 | no constitution |
| retention/audit policy | 1/3 | not evidenced by this audit |

### Reliability — 2.5/3

| Criterion | Score | Evidence |
|---|---|---|
| error boundary | 3/3 | src/app/[locale]/error.tsx |
| 404 page | 2/3 | src/app/[locale]/not-found.tsx |
| external-call timeouts/retries | 3/3 | 33 references |
| DB failure handling | 2/3 | per-code inspection |

### Code quality — 1.6/3

| Criterion | Score | Evidence |
|---|---|---|
| TS strict | 2/3 | strict: true |
| no `any` | 2/3 | 2 occurrences in app code |
| linter | 2/3 | eslint.config.mjs |
| formatter | 0/3 | NONE |
| no console.log in app code | 2/3 | 0 in app code |

### Testing — 2.5/3

| Criterion | Score | Evidence |
|---|---|---|
| unit tests | 3/3 | 117 test files |
| E2E | 2/3 | playwright.config.ts |
| coverage gate | 2/3 | configured |
| tests in CI | 3/3 | ci.yml, sync-public.yml |

### Observability — 1.8/3

| Criterion | Score | Evidence |
|---|---|---|
| structured logger | 2/3 | pino |
| error tracking | 2/3 | sentry |
| audit trail | 2/3 | 365 refs |
| request correlation ids | 1/3 | not evidenced by this audit |

### DevOps/CI-CD — 1.8/3

| Criterion | Score | Evidence |
|---|---|---|
| CI pipeline | 3/3 | ci.yml, sync-public.yml |
| deploy config | 1/3 | Vercel project (no vercel.json) |
| extra quality gates | 1/3 | 2 workflows |
| lockfile reproducibility | 2/3 | pnpm-lock.yaml |

## Verified findings

| Severity | Finding |
|---|---|
| **INFO** | Strongest repo in the fleet (18.6/30): only app with pino + Sentry + an axe gate + 117 test files + a CI dependency audit. It guards API routes by *resource ownership* (`authorizeAssessmentRead`) and API key (`authorized()`), not a session helper — which is why automated pattern matching under-counts it. Use it as the reference implementation. |

## Summary

- **Strong:** SEO, Reliability, Testing
- **Weak or absent:** Performance, Privacy

Scores of 1 on *JS budget/splitting* and *request correlation ids* mean *not evidenced by this audit*, not *failed*.
