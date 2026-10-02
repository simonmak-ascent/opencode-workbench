# Fleet WebApp Benchmark — 10 best-practice categories

Status: Complete · Version: 1.0 · Generated 2026-09-21

Architecture review of all **10 webapps** in the fleet (8 Next.js, 2 Vite) against
the ten development best-practice categories the fleet holds itself to. The single
enumeration of all ten lived in the `did-website` spec (now retired); the individual
standards are echoed across the surviving repositories' own `constitution.md` files.

Each category is scored **0–3** (0 absent · 1 partial · 2 present · 3 present and
enforced by a gate), averaged over four criteria per category, for a maximum of 30.

## Score matrix

| repo | Security | Accessibility | Performance | SEO | Privacy | Reliability | Code quality | Testing | Observability | DevOps/CI-CD | TOTAL |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **esg_reporting_tool** | 2.5 | 1.8 | 1.0 | 2.5 | 1.0 | 2.5 | 1.6 | 2.5 | 1.2 | 2.2 | **18.9** |
| **ascent-accessibility** | 2.0 | 2.0 | 1.0 | 2.5 | 1.0 | 2.5 | 1.6 | 2.5 | 1.8 | 1.8 | **18.6** |
| **esg-hub** | 1.8 | 2.0 | 1.2 | 2.0 | 1.2 | 2.5 | 1.4 | 2.2 | 1.0 | 2.2 | **17.6** |
| **intangiable_valuation_model** | 1.2 | 1.8 | 1.2 | 2.5 | 1.2 | 2.0 | 1.6 | 2.2 | 1.2 | 1.8 | **16.9** |
| **apg-website** | 1.5 | 2.0 | 1.5 | 2.5 | 1.8 | 2.0 | 1.8 | 2.0 | 0.2 | 1.5 | **16.8** |
| **startup_valuation_model** | 1.5 | 0.5 | 0.8 | 2.5 | 1.2 | 2.0 | 1.6 | 2.0 | 1.2 | 1.8 | **15.1** |
| **valuation_report** | 1.5 | 1.0 | 1.0 | 2.5 | 1.2 | 1.2 | 0.8 | 2.0 | 0.5 | 2.2 | **14.1** |
| **simonmak-website** | 2.0 | 1.5 | 1.5 | 1.2 | 1.8 | 0.8 | 1.4 | 1.0 | 0.5 | 2.2 | **13.9** |
| **apf-website** | 1.8 | 0.8 | 1.5 | 1.8 | 1.2 | 0.5 | 1.4 | 1.0 | 0.5 | 2.2 | **12.7** |
| **ndc_report** | 0.8 | 1.5 | 0.5 | 0.2 | 1.2 | 1.2 | 1.0 | 0.8 | 0.2 | 2.2 | **9.8** |

Totals out of 30: best **esg_reporting_tool** (18.9),
weakest **ndc_report** (9.8);
fleet median 16.8.

## Method (and its limits)

Evidence was collected **only from git-tracked files** — that excludes `node_modules`,
`.next` and build output by construction. The collector and scorer are reproducible;
every per-repo finding cites the measured value.

Read the scores as *architecture maturity*, not as a quality verdict:

- A low score can mean **absent**, or **not evidenced by this audit**. The two
  `not evidenced by this audit` criteria (JS budget/splitting, request correlation ids)
  are scored 1 fleet-wide and should be treated as unknown, not as failures.
- Static analysis cannot judge whether a public endpoint *should* be public, whether
  a test is meaningful, or whether a page is slow. Those need the deeper per-repo pass.
- Scores are not comparable across frameworks on Performance: a Vite SPA and an
  SSG Next.js app are penalised differently by design.

## Fleet-wide findings (highest ROI first)

| # | Fix | Affects | Category |
|---|---|---|---|
| 1 | Commit a lockfile — intangiable_valuation_model, startup_valuation_model declare "pin dependencies (lockfile committed)" in their own constitution while having **no lockfile at all**, so builds are not reproducible | intangiable_valuation_model, startup_valuation_model | Code quality / DevOps |
| 2 | Add a structured logger — the fleet's dominant observability gap; `console.log` is the current logging story | intangiable_valuation_model, apg-website, startup_valuation_model, valuation_report, simonmak-website, apf-website, ndc_report | Observability |
| 3 | Add error boundaries — an uncaught render error currently shows Next's default page | valuation_report, simonmak-website, apf-website, ndc_report | Reliability |
| 4 | Add a custom 404 | valuation_report, simonmak-website, apf-website | Reliability |
| 5 | Wire automated accessibility tooling (axe) — several apps have CI a11y steps but no scanner installed | esg_reporting_tool, startup_valuation_model, valuation_report, simonmak-website, apf-website, ndc_report | Accessibility |
| 6 | Reduce `any` usage — TypeScript strict is on, but explicit `any` opts out of it | valuation_report (167), ndc_report (22) | Code quality |
| 7 | Replace `console.log` in application code | esg_reporting_tool (35), intangiable_valuation_model (18), startup_valuation_model (11), valuation_report (145) | Code quality / Observability |
| 8 | Add privacy/cookie pages (GDPR / HK PDPO awareness) | esg_reporting_tool, esg-hub, valuation_report, ndc_report | Privacy |
| 9 | Add dependency auditing to CI | esg-hub, intangiable_valuation_model, startup_valuation_model, valuation_report, ndc_report | Security / Supply chain |
| 10 | Add error tracking (Sentry) | esg_reporting_tool, esg-hub, apg-website, valuation_report, simonmak-website, apf-website, ndc_report | Observability |

## Cross-cutting patterns worth noting

- **API authorization is the fleet's weakest structural point.** Two architectures
  are in use: centralised (middleware matches the API surface — only `esg_reporting_tool`
  does this cleanly) and per-route (middleware excludes `/api`, so each route must guard
  itself). Under the per-route pattern a new endpoint is **unprotected by default** and
  nothing enforces otherwise. Concretely: `valuation_report`'s middleware lists only page
  routes, and 21 of its 32 API routes show no session assertion — including
  `research`, `classify-input`, `stream-research-v2` and `industry-research`, which call
  paid external model APIs. At the other end, `ascent-accessibility` guards by *resource
  ownership* (`authorizeAssessmentRead`) and API key, and `esg-hub` by
  `requireWriteToken`, while `startup_valuation_model` uses `verifySessionFromCookies`.

  ⚠️ Route authorization **cannot** be judged by pattern matching — an *outbound* API key
  reads identically to an inbound one, and ownership checks look like ordinary code. Each
  repo's remaining routes need a manual pass; the scores here mark unverified coverage as
  1/3 rather than crediting or condemning it.
- **Constitutions outrun the code.** 15 of the fleet's repos carry a `constitution.md`
  encoding these standards, and two of them (`intangiable_valuation_model`,
  `startup_valuation_model`) declare "pin dependencies (lockfile committed)" while
  having **no lockfile at all**. Others declare WCAG conformance with no scanner to
  verify it. Written standard ≠ enforced standard.
- **`ascent-accessibility` is the reference implementation** (18.6/30) — it is the only repo
  with pino + Sentry + an axe gate + 117 test files + a CI dependency audit. Copying its
  patterns is the cheapest fleet-wide win.

## Per-repo reports

| repo | total | weakest categories | findings | report |
|---|---|---|---|---|
| esg_reporting_tool | 18.9 | Performance, Privacy | 2 verified | [findings/esg_reporting_tool.md](findings/esg_reporting_tool.md) |
| ascent-accessibility | 18.6 | Performance, Privacy | 1 verified | [findings/ascent-accessibility.md](findings/ascent-accessibility.md) |
| esg-hub | 17.6 | Observability, Performance | 3 verified | [findings/esg-hub.md](findings/esg-hub.md) |
| intangiable_valuation_model | 16.9 | Security, Performance | 1 verified | [findings/intangiable_valuation_model.md](findings/intangiable_valuation_model.md) |
| apg-website | 16.8 | Observability, Security | 2 verified | [findings/apg-website.md](findings/apg-website.md) |
| startup_valuation_model | 15.1 | Accessibility, Performance | 1 verified | [findings/startup_valuation_model.md](findings/startup_valuation_model.md) |
| valuation_report | 14.1 | Observability, Code quality | 7 verified | [findings/valuation_report.md](findings/valuation_report.md) |
| simonmak-website | 13.9 | Observability, Reliability | 2 verified | [findings/simonmak-website.md](findings/simonmak-website.md) |
| apf-website | 12.7 | Reliability, Observability | 2 verified | [findings/apf-website.md](findings/apf-website.md) |
| ndc_report | 9.8 | SEO, Observability | 4 verified | [findings/ndc_report.md](findings/ndc_report.md) |

## Reproducing

The audit is scripted and read-only:

```bash
python3 /tmp/opencode/collect_evidence.py   # git-tracked evidence -> evidence.json
python3 /tmp/opencode/score.py             # rubric                    -> scores.json
```

Re-run both after a remediation wave to re-measure.
