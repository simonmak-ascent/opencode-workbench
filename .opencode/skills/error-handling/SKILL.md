---
name: error-handling
description: Implement robust error handling, logging, and observability patterns
license: MIT
compatibility: opencode
metadata:
  domain: development
  audience: developers-sre
---

## What I do

- Implement error handling patterns: structured error types, user-friendly messages, graceful degradation, and recovery flows
- Set up logging (structured), error tracking (Sentry), and alerting
- Ensure errors are actionable for developers and non-threatening for users

## When to use me

Use when: adding error handling to a feature, setting up Sentry/error tracking, improving error UX, implementing retry logic, or adding structured logging. Trigger phrases: "handle errors for...", "set up Sentry for...", "add error tracking...", "improve error messages...", "add retry logic to...".

## Workflow

1. Read existing error handling patterns: error classes, middleware, logging setup, Sentry config
2. Implement errors in layers:
   - **Domain errors**: typed error classes with codes (e.g., `NotFoundError`, `ValidationError`, `UnauthorizedError`)
   - **API layer**: catch domain errors → map to HTTP status codes → consistent error response format
   - **UI layer**: error boundaries for component trees, toast notifications for transient errors, inline error states for form fields
   - **Retry logic**: exponential backoff with jitter for transient failures (network, rate limits, deadlocks)
3. Set up structured logging:
   - Log levels: debug, info, warn, error, fatal
   - Include: request ID, user ID (if authenticated), correlation ID for distributed tracing
   - Never log: passwords, tokens, PII, full request bodies in production
4. Wire Sentry/error tracking:
   - Capture unhandled exceptions and promise rejections
   - Add breadcrumbs for key user actions
   - Set up release tracking for source map resolution
   - Configure alert rules for critical error spikes
5. Write error recovery tests: verify the app degrades gracefully, not crashes

## Error response format

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested project was not found",
    "details": { "projectId": "prj_123" },
    "requestId": "req_abc"
  }
}
```
