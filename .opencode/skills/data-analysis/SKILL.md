---
name: data-analysis
description: Explore, clean, join and analyse tabular datasets on the workbench using duckdb, polars, pandas and the CLI data tools, with sourced provenance. Use for data mining, ETL, profiling, or any dataset analysis.
license: MIT
compatibility: opencode
metadata:
  domain: data
  audience: analysts
---

# Data Analysis

## Tools

- **C** `data-tools`: pandoc, jq, miller (mlr), sqlite3, duckdb, polars, datasette, csvkit, pyarrow, openpyxl.
- **S** this skill; **M** `primary-sources`/`exa`/`firecrawl` for sourced data.

## Workflow

1. **Profile** before transforming: row/col counts, dtypes, nulls, cardinality, ranges.
2. **Clean** with an explicit, recorded set of steps (dedupe key, coercion rules, drop reasons).
3. **Join** on documented keys; record match rates; never silently drop unmatched rows.
4. **Analyse** with duckdb/polars for scale; pandas for interactive steps.
5. **Provenance**: every input carries `source` + `retrievedAt`; every output names the inputs and the transform.

## Rules

- Real data only — never fabricate rows to fill gaps; missing stays null.
- Keep raw inputs immutable; write cleaned data to a new path.
- Prefer SQL (duckdb) for joins/aggregations; push compute to `cs run` for large sets.
- Output a small data dictionary with every deliverable.
