---
name: api-builder
description: Design and implement RESTful or GraphQL API endpoints with validation
license: MIT
compatibility: opencode
metadata:
  domain: development
  audience: backend-developers
---

## What I do

- Design and implement API endpoints (REST, GraphQL, tRPC) following the project's conventions
- Handle input validation, error responses, pagination, and proper HTTP status codes
- Connect endpoints to the data layer with proper error propagation

## When to use me

Use when: creating a new endpoint, adding a route handler, building a GraphQL resolver, or designing an API surface. Trigger phrases: "create an endpoint for...", "add a route that...", "build a GraphQL mutation for...", "implement the API for...".

## Workflow

1. Read existing route handlers, middleware, and validation patterns in the codebase
2. Design the endpoint:
   - HTTP method and path (REST) or query/mutation name (GraphQL)
   - Input schema with types and validation rules (zod, yup, class-validator)
   - Success response shape
   - Error response shape for each failure mode
3. Implement in layers:
   - Validation middleware or resolver input validation
   - Business logic (delegate to service layer, not inline)
   - Data access (use existing ORM/query patterns)
   - Response formatting (consistent envelope)
4. Handle: authentication/authorization check, rate limiting awareness, idempotency for mutations
5. Add API documentation (OpenAPI comments, GraphQL descriptions)
6. Write integration tests covering: happy path, validation errors, auth errors, not-found, edge cases

## Response envelope

Use the project's existing convention. If none exists, recommend:
```json
{
  "data": {},
  "error": { "code": "VALIDATION_ERROR", "message": "..." },
  "meta": { "page": 1, "total": 100 }
}
```
