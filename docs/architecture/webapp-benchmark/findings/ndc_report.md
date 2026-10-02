# ndc_report — architecture review

**Total 9.8/30** · Next · 48 tracked source files · 0 test files · 4 CI workflow(s)

Score against the ten best-practice categories, each 0–3 (0 absent · 1 partial · 2 present · 3 present and gated).

| Category | Score | Assessment |
|---|---|---|
| Security | 0.8 | weak |
| Accessibility | 1.5 | adequate |
| Performance | 0.5 | absent |
| SEO | 0.2 | absent |
| Privacy | 1.2 | weak |
| Reliability | 1.2 | weak |
| Code quality | 1.0 | weak |
| Testing | 0.8 | weak |
| Observability | 0.2 | absent |
| DevOps/CI-CD | 2.2 | adequate |

## Criterion detail

### Security — 0.8/3

| Criterion | Score | Evidence |
|---|---|---|
| security headers | 0/3 | 0 config file(s) set headers |
| API authorization | 0/3 | 0/8 routes show any guard |
| input validation | 1/3 | zod present but unused |
| supply chain | 2/3 | lockfile=y audit_in_ci=N |

### Accessibility — 1.5/3

| Criterion | Score | Evidence |
|---|---|---|
| automated a11y tooling | 0/3 | axe_dep=False a11y_script=False |
| a11y gate in CI | 0/3 | ci_ref=False |
| semantics (skip link / main / lang) | 3/3 | 3/3 present |
| declared conformance target | 3/3 | WCAG 2.2 AA |

### Performance — 0.5/3

| Criterion | Score | Evidence |
|---|---|---|
| render strategy | 0/3 | 1 force-dynamic, 0 static/ISR signals |
| image optimisation | 1/3 | next/image=0 raw_img=0 |
| CWV measurement | 0/3 | no CWV tooling |
| JS budget / splitting | 1/3 | not measured by this audit |

### SEO — 0.2/3

| Criterion | Score | Evidence |
|---|---|---|
| per-page metadata | 1/3 | 1 metadata exports |
| canonical URLs | 0/3 | 0 references |
| sitemap + robots | 0/3 | sitemap=False robots=False |
| structured data / i18n SEO | 0/3 | jsonld=0 hreflang=0 |

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
| 404 page | 2/3 | src/app/not-found.tsx |
| external-call timeouts/retries | 1/3 | 1 references |
| DB failure handling | 2/3 | per-code inspection |

### Code quality — 1.0/3

| Criterion | Score | Evidence |
|---|---|---|
| TS strict | 2/3 | strict: true |
| no `any` | 1/3 | 22 occurrences in app code |
| linter | 0/3 | NONE |
| formatter | 0/3 | NONE |
| no console.log in app code | 2/3 | 0 in app code |

### Testing — 0.8/3

| Criterion | Score | Evidence |
|---|---|---|
| unit tests | 0/3 | 0 test files |
| E2E | 0/3 | NONE |
| coverage gate | 0/3 | NONE |
| tests in CI | 3/3 | ci.yml, opencode-auto.yml, opencode.yml |

### Observability — 0.2/3

| Criterion | Score | Evidence |
|---|---|---|
| structured logger | 0/3 | NONE |
| error tracking | 0/3 | NONE |
| audit trail | 0/3 | 0 refs |
| request correlation ids | 1/3 | not evidenced by this audit |

### DevOps/CI-CD — 2.2/3

| Criterion | Score | Evidence |
|---|---|---|
| CI pipeline | 3/3 | ci.yml, opencode-auto.yml, opencode.yml, sync-ndc-content.yml |
| deploy config | 2/3 | vercel.json |
| extra quality gates | 2/3 | 4 workflows |
| lockfile reproducibility | 2/3 | pnpm-lock.yaml |

## Verified findings

| Severity | Finding |
|---|---|
| **HIGH** | **No test infrastructure at all.** No `test` script, no test framework in `devDependencies`, and 0 test files — yet the CI workflow runs and the constitution declares WCAG 2.2 AA conformance with no scanner to verify it. |
| **MEDIUM** | No lint script and no ESLint config; no Prettier. Code quality rests on `tsc` alone. |
| **MEDIUM** | No security headers configured anywhere, and no logger or error boundary. |
| **LOW** | 22 explicit `any` and 70 `console.log` in application code. |

## Summary

- **Strong:** —
- **Weak or absent:** Security, Performance, SEO, Code quality, Testing, Observability

Scores of 1 on *JS budget/splitting* and *request correlation ids* mean *not evidenced by this audit*, not *failed*.
