# simonmak-website — architecture review

**Total 13.9/30** · Vite · 94 tracked source files · 3 test files · 4 CI workflow(s)

Score against the ten best-practice categories, each 0–3 (0 absent · 1 partial · 2 present · 3 present and gated).

| Category | Score | Assessment |
|---|---|---|
| Security | 2.0 | adequate |
| Accessibility | 1.5 | adequate |
| Performance | 1.5 | adequate |
| SEO | 1.2 | weak |
| Privacy | 1.8 | adequate |
| Reliability | 0.8 | weak |
| Code quality | 1.4 | weak |
| Testing | 1.0 | weak |
| Observability | 0.5 | absent |
| DevOps/CI-CD | 2.2 | adequate |

## Criterion detail

### Security — 2.0/3

| Criterion | Score | Evidence |
|---|---|---|
| security headers | 0/3 | 0 config file(s) set headers |
| API authorization | 3/3 | no API routes to protect |
| input validation | 2/3 | zod used in 2 modules |
| supply chain | 3/3 | lockfile=y audit_in_ci=y |

### Accessibility — 1.5/3

| Criterion | Score | Evidence |
|---|---|---|
| automated a11y tooling | 0/3 | axe_dep=False a11y_script=False |
| a11y gate in CI | 0/3 | ci_ref=False |
| semantics (skip link / main / lang) | 3/3 | 3/3 present |
| declared conformance target | 3/3 | WCAG 2.2 AAA |

### Performance — 1.5/3

| Criterion | Score | Evidence |
|---|---|---|
| render strategy | 2/3 | SPA (client-rendered by design) |
| image optimisation | 1/3 | 11 raw <img> (no next/image in Vite) |
| CWV measurement | 2/3 | speed-insights |
| JS budget / splitting | 1/3 | not measured by this audit |

### SEO — 1.2/3

| Criterion | Score | Evidence |
|---|---|---|
| per-page metadata | 0/3 | 0 metadata exports |
| canonical URLs | 2/3 | 1 references |
| sitemap + robots | 3/3 | sitemap=True robots=True |
| structured data / i18n SEO | 0/3 | jsonld=0 hreflang=0 |

### Privacy — 1.8/3

| Criterion | Score | Evidence |
|---|---|---|
| privacy/cookie pages | 2/3 | 3 route files |
| third-party trackers | 2/3 | 0 tracker reference(s) |
| PII stance documented | 2/3 | constitution present |
| retention/audit policy | 1/3 | not evidenced by this audit |

### Reliability — 0.8/3

| Criterion | Score | Evidence |
|---|---|---|
| error boundary | 0/3 | NONE |
| 404 page | 0/3 | NONE |
| external-call timeouts/retries | 1/3 | 1 references |
| DB failure handling | 2/3 | per-code inspection |

### Code quality — 1.4/3

| Criterion | Score | Evidence |
|---|---|---|
| TS strict | 2/3 | strict: true |
| no `any` | 2/3 | 1 occurrences in app code |
| linter | 0/3 | NONE |
| formatter | 2/3 | .prettierignore |
| no console.log in app code | 1/3 | 8 in app code |

### Testing — 1.0/3

| Criterion | Score | Evidence |
|---|---|---|
| unit tests | 1/3 | 3 test files |
| E2E | 0/3 | NONE |
| coverage gate | 0/3 | NONE |
| tests in CI | 3/3 | ci.yml, copilot-setup-steps.yml, opencode-auto.yml |

### Observability — 0.5/3

| Criterion | Score | Evidence |
|---|---|---|
| structured logger | 0/3 | NONE |
| error tracking | 0/3 | NONE |
| audit trail | 1/3 | 4 refs |
| request correlation ids | 1/3 | not evidenced by this audit |

### DevOps/CI-CD — 2.2/3

| Criterion | Score | Evidence |
|---|---|---|
| CI pipeline | 3/3 | ci.yml, copilot-setup-steps.yml, opencode-auto.yml, opencode.yml |
| deploy config | 2/3 | vercel.json |
| extra quality gates | 2/3 | 4 workflows |
| lockfile reproducibility | 2/3 | pnpm-lock.yaml |

## Verified findings

| Severity | Finding |
|---|---|
| **MEDIUM** | Declares WCAG 2.2 AAA in its constitution but has no axe dependency and no a11y CI step — the declaration is unverifiable as written. |
| **LOW** | No error boundary or 404 route; 8 `console.log` in application code. |

## Summary

- **Strong:** —
- **Weak or absent:** Reliability, Testing, Observability

Scores of 1 on *JS budget/splitting* and *request correlation ids* mean *not evidenced by this audit*, not *failed*.
