# esg_reporting_tool — architecture review

**Total 18.9/30** · Next · 412 tracked source files · 73 test files · 5 CI workflow(s)

Score against the ten best-practice categories, each 0–3 (0 absent · 1 partial · 2 present · 3 present and gated).

| Category | Score | Assessment |
|---|---|---|
| Security | 2.5 | strong |
| Accessibility | 1.8 | adequate |
| Performance | 1.0 | weak |
| SEO | 2.5 | strong |
| Privacy | 1.0 | weak |
| Reliability | 2.5 | strong |
| Code quality | 1.6 | adequate |
| Testing | 2.5 | strong |
| Observability | 1.2 | weak |
| DevOps/CI-CD | 2.2 | adequate |

## Criterion detail

### Security — 2.5/3

| Criterion | Score | Evidence |
|---|---|---|
| security headers | 2/3 | 2 config file(s) set headers |
| API authorization | 3/3 | middleware covers /api (38 routes) |
| input validation | 3/3 | zod used in 17 modules |
| supply chain | 2/3 | lockfile=y audit_in_ci=y |

### Accessibility — 1.8/3

| Criterion | Score | Evidence |
|---|---|---|
| automated a11y tooling | 0/3 | axe_dep=False a11y_script=False |
| a11y gate in CI | 1/3 | ci_ref=True |
| semantics (skip link / main / lang) | 3/3 | 3/3 present |
| declared conformance target | 3/3 | WCAG 2.1 AA |

### Performance — 1.0/3

| Criterion | Score | Evidence |
|---|---|---|
| render strategy | 1/3 | 8 force-dynamic, 2 static/ISR signals |
| image optimisation | 0/3 | next/image=0 raw_img=12 |
| CWV measurement | 2/3 | speed-insights |
| JS budget / splitting | 1/3 | not measured by this audit |

### SEO — 2.5/3

| Criterion | Score | Evidence |
|---|---|---|
| per-page metadata | 3/3 | 5 metadata exports |
| canonical URLs | 2/3 | 13 references |
| sitemap + robots | 3/3 | sitemap=True robots=True |
| structured data / i18n SEO | 2/3 | jsonld=1 hreflang=4 |

### Privacy — 1.0/3

| Criterion | Score | Evidence |
|---|---|---|
| privacy/cookie pages | 0/3 | 0 route files |
| third-party trackers | 1/3 | 3 tracker reference(s) |
| PII stance documented | 2/3 | constitution present |
| retention/audit policy | 1/3 | not evidenced by this audit |

### Reliability — 2.5/3

| Criterion | Score | Evidence |
|---|---|---|
| error boundary | 3/3 | src/app/[locale]/error.tsx |
| 404 page | 2/3 | src/app/not-found.tsx |
| external-call timeouts/retries | 3/3 | 50 references |
| DB failure handling | 2/3 | per-code inspection |

### Code quality — 1.6/3

| Criterion | Score | Evidence |
|---|---|---|
| TS strict | 2/3 | strict: true |
| no `any` | 2/3 | 2 occurrences in app code |
| linter | 2/3 | eslint.config.mjs |
| formatter | 2/3 | .prettierrc |
| no console.log in app code | 0/3 | 35 in app code |

### Testing — 2.5/3

| Criterion | Score | Evidence |
|---|---|---|
| unit tests | 3/3 | 73 test files |
| E2E | 2/3 | playwright.config.ts |
| coverage gate | 2/3 | configured |
| tests in CI | 3/3 | ci.yml, content-sync.yml, lighthouse.yml |

### Observability — 1.2/3

| Criterion | Score | Evidence |
|---|---|---|
| structured logger | 2/3 | src/lib/observability/telemetry.ts |
| error tracking | 0/3 | NONE |
| audit trail | 2/3 | 70 refs |
| request correlation ids | 1/3 | not evidenced by this audit |

### DevOps/CI-CD — 2.2/3

| Criterion | Score | Evidence |
|---|---|---|
| CI pipeline | 3/3 | ci.yml, content-sync.yml, lighthouse.yml, opencode-auto.yml |
| deploy config | 2/3 | vercel.json |
| extra quality gates | 2/3 | 5 workflows |
| lockfile reproducibility | 2/3 | pnpm-lock.yaml |

## Verified findings

| Severity | Finding |
|---|---|
| **INFO** | The only repo whose middleware explicitly covers the API surface (`'/(api\|trpc)(.*)'`), so route-level authorization is centralised rather than per-route. This is the pattern the other repos should adopt. |
| **MEDIUM** | 35 `console.log` in application code; no structured logger. |

## Summary

- **Strong:** Security, SEO, Reliability, Testing
- **Weak or absent:** Performance, Privacy

Scores of 1 on *JS budget/splitting* and *request correlation ids* mean *not evidenced by this audit*, not *failed*.
