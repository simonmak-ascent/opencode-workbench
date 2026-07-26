---
name: db-schema
description: Design and migrate database schemas with proper indexing and constraints
license: MIT
compatibility: opencode
metadata:
  domain: development
  audience: backend-developers
---

## What I do

- Design database schemas (tables, indexes, constraints, relations) aligned with the application's data model
- Write migrations that are safe, reversible, and tested
- Optimize queries with proper indexing strategies

## When to use me

Use when: designing a new schema, adding tables, creating indexes, writing migrations, or optimizing slow queries. Trigger phrases: "design a schema for...", "create a migration for...", "add table for...", "optimize this query...", "index the...".

## Workflow

1. Understand the data model from the spec or feature requirements
2. Read the existing schema and migration history to follow conventions
3. Design tables with:
   - Appropriate column types and constraints (NOT NULL, UNIQUE, CHECK)
   - Primary keys (UUID vs serial based on project convention)
   - Foreign keys with ON DELETE behavior specified
   - Timestamps (created_at, updated_at) following project convention
   - Indexes on: foreign keys, frequently queried columns, columns used in WHERE/ORDER BY/JOIN
4. Write the migration using the project's migration tool (Prisma, Drizzle, Knex, Alembic, etc.)
5. Ensure migration is reversible (provide `down` migration or equivalent)
6. Add seed data if the feature requires pre-populated data
7. Consider: soft deletes, audit logging, data retention policies

## Safety checks

- No dropping columns/tables without explicit user confirmation
- Add indexes concurrently for large tables when possible
- Test migration on a copy of production data before finalizing
- Never commit a migration that can't roll back
