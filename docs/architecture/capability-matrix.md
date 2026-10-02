# Capability Matrix

> What the Workbench profile gives each domain, and which component / MCP / skill
> delivers it. Use it to check that a clone is fit for R&D, data, web and
> scientific work.

Legend: **C** component · **M** MCP · **S** skill.

## R&D / research

| Capability | Delivered by |
|------------|--------------|
| Primary-source facts (filings, macro, public data) | **M** `primary-sources` |
| Literature | **M** `arxiv`, `paper-search` |
| Semantic web + extraction | **M** `exa`, `firecrawl` |
| Fast current facts | **M** `brave-search` |
| Synthesised multi-source answers | **M** `perplexity` |
| Library docs / real code | **M** `context7`, `gh_grep` |
| Workflow (`docs/research/pipeline.md`) | **S** `web-research`, `company-research`, `content-research`, `competitive-analysis`, `benchmark-research`, `api-research` |
| VDD research dispatch | **M** `vdd` · **S** `vision-driven-design` |

## Database design

| Capability | Delivered by |
|------------|--------------|
| Postgres introspection/query | **M** `postgres` · **C** `docker-containers` (pg-memory) |
| SurrealDB | **M** `surrealdb` (optional) |
| Schema/design workflow | **S** `db-schema` |
| CLI clients | **C** `data-tools` (sqlite3, duckdb, polars, pyarrow, sqlalchemy) |

## Data mining / ETL

| Capability | Delivered by |
|------------|--------------|
| Tabular/ETL tooling | **C** `data-tools` (pandoc, jq, miller, csvkit, duckdb, polars, datasette) |
| Analysis workflow | **S** `data-analysis` (via `benchmark-research` / `content-research`) |
| Sourced ingestion | **M** `primary-sources`, `exa`, `firecrawl` |

## Software development (web app)

| Capability | Delivered by |
|------------|--------------|
| Deploy | **M** `vercel`, `cloudflare` · **S** `cloud-deploy`, `cicd-setup` |
| UI components | **M** `shadcn`, `design-system` · **S** `component-builder`, `frontend-design`, `ui-ux-pro-max`, `web-design-guidelines`, `responsive-design` |
| Auth / billing | **M** `clerk`, `stripe` |
| Browser automation / E2E | **M** `playwright`, `browserless`, `browser-mcp` · **S** `test-writer`, `clone-audit` |
| Diagrams / charts | **M** `mermaid`, `echarts`, `designlang`, `difflens` |
| API design | **S** `api-designer`, `api-builder`, `swagger-testcase` |

## Scientific program

| Capability | Delivered by |
|------------|--------------|
| Python scientific core | **C** `scientific` (numpy, scipy, pandas, matplotlib, sympy) |
| Reproducible Python | **C** `uv`, `scientific` (pip) |
| Notebooks / R / Julia | **C** `scientific` optional (Jupyter, r-base, julia) |
| Papers | **M** `arxiv`, `paper-search` |
| Workflow | **S** `scientific-computing` |

## Cross-cutting

| Capability | Delivered by |
|------------|--------------|
| VDD 8-phase chain | **M** `vdd` (remote `vdd.simonmak.com`) · agent `vdd` |
| Repo provenance / E2E | **S** `spec-driven-development`, `writing-plans`, `executing-plans`, `verification-before-completion`, `systematic-debugging`, `test-driven-development` |
| Memory / compute | **S** `memory-usage`, `workbench-compute` · **C** `gh`, `uv` |
| Self-test | `scripts/selftest/run-selftest.sh` |
| Credential acquisition | **M** `list_required_credentials`, `run_auth_flow` · **S** `credential-acquisition` |

## Known optional / deferred

- `scientific` R/Julia/Jupyter are opt-in (heavier install).
- `surrealdb`, `google-workspace`, `ms-365`, `alibaba-cloud-ops`, `stripe`,
  `cloudflare`, `exa`, `firecrawl` require credentials (see `list_required_credentials`).
