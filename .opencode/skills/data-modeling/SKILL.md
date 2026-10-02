---
name: data-modeling
description: Design relational and document database schemas — entities, keys, normalisation, constraints, indexes and migrations — and introspect live databases via the postgres MCP. Use for database design, schema reviews, or migration planning.
license: MIT
compatibility: opencode
metadata:
  domain: data
  audience: engineers
---

# Data Modeling

## Design

1. **Entities & relationships**: name nouns, cardinality, optionality; produce an ER diagram (`mermaid` MCP).
2. **Keys**: surrogate vs natural; UUID vs bigint; composite uniqueness constraints.
3. **Normalise** to 3NF by default; denormalise only with a measured reason.
4. **Constraints**: NOT NULL, FK, CHECK, and enums where the domain is finite.
5. **Indexes**: derived from access patterns (queries), not guessed; cover FKs and filters.
6. **Migrations**: forward-only, reviewable, idempotent where possible; never destructive without a consented step.

## Introspect

- `postgres` MCP: list tables/columns, run `EXPLAIN`, inspect indexes and constraints.
- Compare live schema against the intended model; report drift as findings.

## Rules

- `db-schema` skill for the concrete schema authoring workflow.
- Schema files define structure/constraints — no data rows.
- Reference tables are populated from real source values, never invented.
