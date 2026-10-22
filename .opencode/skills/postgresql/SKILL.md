---
name: postgresql
description: PostgreSQL database work via the postgres MCP — schema exploration, SQL execution, EXPLAIN analysis, index tuning, locking, migrations and health checks. Use when the user asks to query, inspect, migrate, or tune a PostgreSQL database, debug a slow query, or mentions tables, schemas, indexes, locks, VACUUM or EXPLAIN.
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
2. **Measure, then change**: `explain_query` (with ANALYZE) → `analyze_query_indexes`
   → *then* `CREATE INDEX`. Re-run the plan after the change to confirm the win.
3. **Write safely**: wrap exploratory DML in `BEGIN … ROLLBACK`; back up before DDL.
   `execute_sql` runs immediately — no implicit transaction.
4. **Tune by evidence**: use `get_top_queries` (needs `pg_stat_statements` + a
   representative workload) instead of indexing from intuition.

## Reading a query plan

`EXPLAIN (ANALYZE, BUFFERS, VERBOSE)` — always with ANALYZE when diagnosing, and
BUFFERS to see actual I/O.

| Symptom | Meaning | Fix |
|---|---|---|
| `Seq Scan` on a large table with a selective filter | missing or unusable index | add a matching index; check type/collation |
| `rows=10` estimated vs `actual rows=50000` | stale or unrepresentative statistics | `ANALYZE <table>`; consider `ALTER TABLE … SET STATISTICS` |
| `Nested Loop` with a big outer row count | nested loop chosen wrongly | check indexes on the inner side, `work_mem`, or force with `enable_nestloop=off` to test |
| `Sort` with `external merge Disk` | sort spills | raise `work_mem` for the session or add an index matching the ORDER BY |
| `Filter` removing most rows *after* the scan | predicate not indexable (function/type mismatch) | expression index or rewrite the predicate |
| `Buffers: shared read=` ≫ `hit=` | cold cache or table much larger than RAM | expected on first run; investigate if persistent |

Compare total runtime across runs; single-run timings include cache warm-up.

## Indexing

- **Type by access pattern:** B-tree (default, equality/range/ORDER BY), GIN
  (JSONB, arrays, full-text, `pg_trgm`), BRIN (very large append-only tables),
  GiST (geometry/ranges). Hash is rarely worth it.
- **Composite order matters:** equality columns first, then range, then the
  ORDER BY columns. `(tenant_id, created_at DESC)` serves
  `WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 20`.
- **Partial indexes** for hot subsets: `WHERE deleted_at IS NULL`.
- **Covering indexes** with `INCLUDE (col)` to enable index-only scans.
- **Don't** index low-selectivity columns on their own (booleans, status flags).
- **Check usage before adding more:**
  ```sql
  SELECT relname, indexrelname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid))
  FROM pg_stat_user_indexes ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;
  ```
  `idx_scan = 0` on an old index is dead weight — confirm with the owner before dropping.
- Build on live tables with `CREATE INDEX CONCURRENTLY` (cannot run inside a transaction).

## Diagnostics

```sql
-- largest tables (incl. indexes and TOAST)
SELECT relname, pg_size_pretty(pg_total_relation_size(oid)) AS total,
       pg_size_pretty(pg_relation_size(oid)) AS heap
FROM pg_class WHERE relkind = 'r'
ORDER BY pg_total_relation_size(oid) DESC LIMIT 20;

-- long-running / blocked queries
SELECT pid, now() - query_start AS dur, wait_event_type, wait_event, state, left(query, 120)
FROM pg_stat_activity
WHERE state <> 'idle' ORDER BY dur DESC;

-- who blocks whom
SELECT blocked.pid AS blocked_pid, blocking.pid AS blocking_pid,
       left(blocked.query, 80) AS blocked_query
FROM pg_stat_activity blocked
JOIN pg_stat_activity blocking ON blocking.pid = ANY(pg_blocking_pids(blocked.pid));

-- dead tuples / last vacuum (bloat signal)
SELECT relname, n_live_tup, n_dead_tup, last_vacuum, last_autovacuum
FROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 20;

-- cache hit ratio (target > 0.99 for OLTP)
SELECT sum(blks_hit)::numeric / nullif(sum(blks_hit + blks_read), 0) AS hit_ratio
FROM pg_stat_database;
```

`VACUUM (VERBOSE, ANALYZE) <table>` reclaims dead tuples; `VACUUM FULL` rewrites
the table and takes an ACCESS EXCLUSIVE lock — avoid on live systems (prefer
`pg_repack`).

## Schema quick rules

- `timestamptz` (never `timestamp`) for instants; store UTC.
- `numeric` for money — never `float`.
- `text` + `CHECK` beats `varchar(n)` unless a hard length limit is contractual.
- Prefer `GENERATED ALWAYS AS IDENTITY` over `serial`.
- Every FK gets an index on the referencing column (Postgres does not create one).
- `NOT NULL` + `CHECK` constraints are free documentation the planner can use.
- For full table-design reviews (types, partitioning, semi-structured data),
  use the `postgresql-table-design` skill.

## JSONB and advanced features

- `jsonb` (binary) over `json`; index with GIN: `CREATE INDEX … USING gin (doc jsonb_path_ops)`.
- Containment `@>` is index-friendly; `->>` extraction is not unless you add an
  expression index: `CREATE INDEX … ON t ((doc->>'status'))`.
- Full-text: `tsvector` column + GIN, or a generated column kept in sync.
- Arrays, ranges, `EXCLUDE` constraints, window functions, and extensions have
  deeper coverage in the `postgresql-optimization` skill.

## Migrations

- **Additive first:** add nullable column → backfill in batches → add constraint
  (`NOT VALID`, then `VALIDATE CONSTRAINT`) → drop the old shape later.
- Set a guard in migration sessions: `SET lock_timeout = '5s'; SET statement_timeout = '60s';`
  so a migration fails fast instead of queueing behind a long transaction.
- Backfill in batches (e.g. 5–10k rows) with commits between batches; never one
  giant `UPDATE` on a hot table.
- `ALTER TABLE … ADD COLUMN … DEFAULT` is metadata-only on PG 11+.
- DDL takes locks that queue behind running queries — check `pg_stat_activity`
  first and run during low traffic.

## Safety (this environment)

- The MCP is `--access-mode=unrestricted`, so DDL and DML both execute for real.
- Explore with `BEGIN; … ROLLBACK;`; never leave an open transaction idle.
- Before destructive DDL (`DROP`, `TRUNCATE`, type changes), take a backup or a
  snapshot, and confirm the target schema/table with `get_object_details`.
- Prefer `LIMIT` on ad-hoc `SELECT *` against large tables.

## Conventions (this environment)

- The MCP points at `localhost:5432/memory` (the opencode memory store) via
  `DATABASE_URI`. The server must be running for tools to succeed.
- Identifiers are lowercase snake_case; text primary keys use a `table:<uuid>`
  form (`newRecordId`), not auto-increment — check `get_object_details` for the
  actual schema before assuming serial IDs.
- Prefer keyset/cursor pagination over `OFFSET`; index the filter + order columns
  in the same order.
