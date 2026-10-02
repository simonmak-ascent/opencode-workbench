# apg-website — architecture review

**Total 16.8/30** · Next · 66 tracked source files · 3 test files · 1 CI workflow(s)

Score against the ten best-practice categories, each 0–3 (0 absent · 1 partial · 2 present · 3 present and gated).

| Category | Score | Assessment |
|---|---|---|
| Security | 1.5 | adequate |
| Accessibility | 2.0 | adequate |
| Performance | 1.5 | adequate |
| SEO | 2.5 | strong |
| Privacy | 1.8 | adequate |
| Reliability | 2.0 | adequate |
| Code quality | 1.8 | adequate |
| Testing | 2.0 | adequate |
| Observability | 0.2 | absent |
| DevOps/CI-CD | 1.5 | adequate |

## Criterion detail

### Security — 1.5/3

| Criterion | Score | Evidence |
|---|---|---|
| security headers | 1/3 | 1 config file(s) set headers |
| API authorization | 0/3 | 0/4 routes show any guard |
| input validation | 3/3 | zod used in 5 modules |
| supply chain | 2/3 | lockfile=y audit_in_ci=y |

### Accessibility — 2.0/3

| Criterion | Score | Evidence |
|---|---|---|
| automated a11y tooling | 2/3 | axe_dep=True a11y_script=True |
| a11y gate in CI | 3/3 | ci_ref=True |
| semantics (skip link / main / lang) | 3/3 | 3/3 present |
| declared conformance target | 0/3 | not stated |

### Performance — 1.5/3

| Criterion | Score | Evidence |
|---|---|---|
| render strategy | 1/3 | 7 force-dynamic, 1 static/ISR signals |
| image optimisation | 2/3 | next/image=9 raw_img=1 |
| CWV measurement | 2/3 | speed-insights |
| JS budget / splitting | 1/3 | not measured by this audit |

### SEO — 2.5/3

| Criterion | Score | Evidence |
|---|---|---|
| per-page metadata | 3/3 | 7 metadata exports |
| canonical URLs | 2/3 | 6 references |
| sitemap + robots | 3/3 | sitemap=True robots=True |
| structured data / i18n SEO | 2/3 | jsonld=1 hreflang=5 |

### Privacy — 1.8/3

| Criterion | Score | Evidence |
|---|---|---|
| privacy/cookie pages | 2/3 | 1 route files |
| third-party trackers | 2/3 | 0 tracker reference(s) |
| PII stance documented | 2/3 | constitution present |
| retention/audit policy | 1/3 | not evidenced by this audit |

### Reliability — 2.0/3

| Criterion | Score | Evidence |
|---|---|---|
| error boundary | 3/3 | src/app/[locale]/(marketing)/error.tsx |
| 404 page | 2/3 | src/app/[locale]/(marketing)/not-found.tsx |
| external-call timeouts/retries | 1/3 | 1 references |
| DB failure handling | 2/3 | per-code inspection |

### Code quality — 1.8/3

| Criterion | Score | Evidence |
|---|---|---|
| TS strict | 2/3 | strict: true |
| no `any` | 3/3 | 0 occurrences in app code |
| linter | 2/3 | .eslintrc.json |
| formatter | 0/3 | NONE |
| no console.log in app code | 2/3 | 0 in app code |

### Testing — 2.0/3

| Criterion | Score | Evidence |
|---|---|---|
| unit tests | 1/3 | 3 test files |
| E2E | 2/3 | playwright.config.ts |
| coverage gate | 2/3 | configured |
| tests in CI | 3/3 | test.yml |

### Observability — 0.2/3

| Criterion | Score | Evidence |
|---|---|---|
| structured logger | 0/3 | NONE |
| error tracking | 0/3 | NONE |
| audit trail | 0/3 | 0 refs |
| request correlation ids | 1/3 | not evidenced by this audit |

### DevOps/CI-CD — 1.5/3

| Criterion | Score | Evidence |
|---|---|---|
| CI pipeline | 3/3 | test.yml |
| deploy config | 1/3 | Vercel project (no vercel.json) |
| extra quality gates | 0/3 | 1 workflows |
| lockfile reproducibility | 2/3 | pnpm-lock.yaml |

## Verified findings

| Severity | Finding |
|---|---|
| **LOW** | Its error boundary and 404 exist but are scoped to the `(marketing)` route group (`src/app/[locale]/(marketing)/error.tsx`), so failures elsewhere — admin, other groups — fall through to Next's default page. |
| **MEDIUM** | Only one CI workflow (`test.yml`); no lint/type/build pipeline in CI, and no `vercel.json`. Strongest audit tooling in the fleet otherwise (`audit:a11y`, `audit:links`, `audit:visual`, `audit:containers`). |

## Summary

- **Strong:** SEO
- **Weak or absent:** Observability

Scores of 1 on *JS budget/splitting* and *request correlation ids* mean *not evidenced by this audit*, not *failed*.
