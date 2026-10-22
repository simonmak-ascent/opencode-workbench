# Data Storage Domain Primer

Loaded during Phase 2 (Strategy) when the vision involves persistent data, databases, or storage infrastructure.

## Research Patterns

### Data Model Discovery
- What are the core domain entities? Identify nouns from the vision statement and stakeholder map
- What are the relationships? (one-to-one, one-to-many, many-to-many)
- What are the access patterns? (read-heavy, write-heavy, mixed, analytics queries)
- What is the data lifecycle? (create → read → update → delete → archive → purge)
- What are the consistency requirements? (strong, eventual, causal)

### Storage Technology Evaluation
- **Relational (OLTP)**:
  - PostgreSQL — general purpose, rich features, strong consistency
  - MySQL/MariaDB — simpler ops, read-heavy workloads
  - SQLite — embedded, single-writer, testing, edge devices
- **Document/NoSQL**:
  - MongoDB — flexible schema, document model, horizontal scale
  - DynamoDB — serverless, predictable latency, AWS ecosystem
  - Firestore — real-time sync, mobile-first, Google ecosystem
- **Cache/Ephemeral**:
  - Redis/Valkey — caching, sessions, rate limiting, pub/sub
  - Memcached — simple key-value cache
- **Search/Analytics**:
  - Elasticsearch/OpenSearch — full-text search, aggregations
  - ClickHouse — columnar analytics, time-series
  - TimescaleDB — PostgreSQL extension for time-series
- **Blob/Object**:
  - S3 / R2 / Cloud Storage — files, images, backups, static assets
- **Graph**:
  - Neo4j — relationship-heavy queries
  - Dgraph — distributed graph database

### Schema Design Principles
- Normalize to 3NF unless performance requires denormalization
- Every table gets: `id` (uuid or serial), `created_at`, `updated_at`
- Use check constraints for enums (not application-level only)
- Foreign keys with explicit ON DELETE behavior (CASCADE, SET NULL, RESTRICT)
- Index on every column used in WHERE, JOIN, ORDER BY clauses
- Composite indexes for multi-column queries — order columns by selectivity

### Data Governance
- PII classification: identify all personally identifiable fields, apply encryption at rest
- Data retention policy: how long is each entity retained? When is it purged?
- Backup strategy: frequency, retention, off-site storage, restore testing
- Access control: row-level security (RLS), column-level encryption for sensitive fields
- Audit logging: who accessed/changed what, when, from where

## Impact Verification

### Data Quality Metrics
- Data freshness (lag between source and storage)
- Data completeness (% of required fields populated)
- Data accuracy (% of records passing validation rules)
- Schema drift incidents (unexpected schema changes in production)

### Performance Metrics
- Query latency at p50, p95, p99 per endpoint
- Connection pool utilization and saturation
- Cache hit ratio (for cached queries/data)
- Index utilization (unused indexes = wasted writes)
- Storage growth rate (predicting capacity needs)

### Impact-to-Vision Verification
For each vision goal that involves data:
- "Centralizes fragmented data" → measured by: reduction in number of data silos, time saved in cross-source queries
- "Enables data-driven decisions" → measured by: query latency for dashboard queries, freshness of analytics data
- "Protects user privacy" → measured by: PII encryption coverage, access audit completeness, breach response time

## Domain-Specific Constraints

- **ACID compliance**: Required for financial, healthcare, inventory — Postgres default. Optional for analytics, caches
- **Multi-tenancy**: Row-level (tenant_id column + RLS) vs schema-level (per-tenant schema) vs database-level (per-tenant DB)
- **Connection pooling**: PgBouncer, built-in pool, serverless connection management
- **Migration strategy**: Expand-contract pattern for zero-downtime schema changes
- **Seeding**: Development, staging, and test seed data strategy
- **Soft deletes**: Consider `deleted_at` timestamp instead of hard DELETE for audit trails
- **Idempotency keys**: For payment/order tables — prevent duplicate operations

## Anti-Patterns Specific to Data Storage

- Using the database as a queue (use Redis/RabbitMQ/SQS instead)
- No indexing strategy → full table scans under load
- Storing computed/derived values without a refresh mechanism
- Using `TEXT` for everything because "it's flexible" — use appropriate types
- Missing foreign key constraints because "the application handles it"
- `SELECT *` in production queries — specify columns explicitly
- N+1 queries — use JOINs, eager loading, or batch queries
- Running migrations without a rollback plan
- No connection timeout or retry logic — hanging connections exhaust the pool
- Storing secrets or tokens in plaintext — use vault, env vars, or encryption

## Technology-Specific Deep Dives

### SurrealDB 3.x

**When to use**: Graph-heavy domains where relationships are first-class (social networks, recommendation engines, knowledge graphs). SurrealDB's RELATE statement, graph traversal, and schema-full/schema-less flexibility make it ideal for connected-data models.

**Schema design patterns**:
- **RELATE vs embedded arrays**: Use `RELATE` when the relationship is queried independently or shared across entities. Use embedded arrays when the data is always accessed together and never shared. *Trace this decision back to the vision: if the impact goal is "users discover content through their network," RELATE edges enable graph traversal queries directly.*
- **DEFINE TABLE with SCHEMAFULL**: For task-critical data (orders, payments) use schema-full tables. For user-generated content that evolves, use SCHEMAFULL with `FLEXIBLE` fields.
- **SurrealQL indexes**: `DEFINE INDEX idx_status ON tasks FIELDS status` — but prefer compound indexes for common query patterns. Always justify the index in `plan.md` with the query it serves.
- **Record links vs graph edges**: Record links (`user:123`) are simpler for 1-to-many. Graph edges enable path queries, shortest path, and recursive traversal.
- **Live queries**: SurrealDB's `LIVE SELECT` for real-time subscriptions — use when the vision requires instant UI updates. Be aware of connection overhead.

### PostgreSQL

**When to use**: The default choice for most applications requiring ACID compliance, complex queries, and mature ecosystem. Use when you need transactions, constraints, and JSON/JSONB for document-style flexibility alongside relational queries.

**Schema design patterns**:
- **Partitioning**: For tables >10M rows, use `PARTITION BY RANGE` on `created_at`. Justify in plan.md with query patterns.
- **JSONB vs normalized columns**: Use JSONB for user-specified metadata where the schema evolves at runtime. Use normalized columns for business-critical fields that are queried in WHERE, JOIN, or ORDER BY.
- **Index types**: `btree` for equality/range, `gin` for full-text/JSONB containment, `gist` for geometric/spatial, `brin` for very large append-only tables.
- **Row-Level Security (RLS)**: Enable when multi-tenancy requires row-level isolation. *Trace to vision: if "privacy-by-default" is a vision constraint, RLS is the implementation tactic.*

### Redis/Valkey

**When to use**: Caching, session storage, rate limiting, pub/sub, leaderboards, and real-time counters. Never as a primary database.

**Patterns**:
- **Cache-aside**: Application checks Redis first; on miss, loads from primary DB and populates Redis with TTL.
- **Rate limiting**: `INCR` + `EXPIRE` for per-user/IP rate counters. Implement the fixed-window or sliding-window algorithm based on the spec's rate limit AC.
- **Pub/Sub**: For real-time notifications across services — trace to the vision impact that requires instant user feedback.

### Neo4j

**When to use**: When relationships are the primary query axis. Social graphs, fraud detection (relationship-based anomaly detection), recommendation engines, and network analysis. Cypher queries are more readable than recursive CTEs for relationship traversal.

**Schema patterns**:
- **Node vs Relationship properties**: Put properties that describe the connection ON the relationship. Time-aware relationships (e.g., "worked at Company from 2020–2023") use relationship properties.
- **Multi-hop queries**: Design the graph schema so that the most common query paths are 1-2 hops. Paths longer than 4 hops should be documented with performance justification.

### MongoDB

**When to use**: Document-oriented workloads where the access pattern is always the full document. Content management, user profiles with variable schemas, IoT event storage.

**Schema patterns**:
- **Embedding vs referencing**: Embed when data is always accessed together and < 16MB. Reference when the child is accessed independently or shared.
- **Schema versioning**: Add a `schema_version` field to documents when the structure evolves — enables safe migrations without downtime.

