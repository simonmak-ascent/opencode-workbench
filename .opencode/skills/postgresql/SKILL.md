---
name: postgresql
description: PostgreSQL database work via the postgres MCP — schema exploration, SQL execution, EXPLAIN, index tuning, and health checks. Use when the user asks to query, inspect, migrate, or tune a PostgreSQL database, or mentions tables, schemas, indexes, or EXPLAIN.
---

# PostgreSQL

Work against PostgreSQL through the `postgres` MCP server (postgres-mcp v1.x,
`--access-mode=unrestricted`). It exposes these tools:

- `list_schemas` — enumerate schemas.
- `list_objects` — tables/views/sequences/functions in a schema.
- `get_object_details` — columns, types, indexes, constraints for one object.
- `explain_query` — run EXPLAIN (with analysis) on a query; read the plan before
  adding an index.
- `analyze_query_indexes` / `analyze_workload_indexes` — suggest missing indexes
  (optionally verifies with the `hypopg` extension).
- `analyze_db_health` — quick DB health scan (missing indexes, bloated tables,
  invalid indexes, etc.).
- `get_top_queries` — top queries from `pg_stat_statements`.
- `execute_sql` — run arbitrary SQL (DML + DDL, since access mode is unrestricted).

## Workflow

1. **Orient first**: `list_schemas` → `list_objects` → `get_object_details` before
   writing any query. Don't guess column names.
2. **Read before write**: prefer `explain_query` + `analyze_query_indexes` before
   `CREATE INDEX`. Verify on realistic data.
3. **Write safely**: wrap exploratory DML in a transaction; back up before DDL.
   `execute_sql` runs immediately — no implicit transaction.
4. **Tune by evidence**: use `get_top_queries` (needs `pg_stat_statements` + a
   representative workload) instead of indexing from intuition.

## Conventions (this environment)

- The MCP points at `localhost:5432/memory` (the opencode memory store) via
  `DATABASE_URI`. The server must be running for tools to succeed.
- Identifiers are lowercase snake_case; text primary keys use a `table:<uuid>`
  form (`newRecordId`), not auto-increment — check `get_object_details` for the
  actual schema before assuming serial IDs.
- Prefer keyset/cursor pagination over `OFFSET`; index the filter + order columns
  in the same order.
