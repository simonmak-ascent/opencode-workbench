---
name: test-writer
description: Write comprehensive tests at all levels with proper coverage patterns
license: MIT
compatibility: opencode
metadata:
  domain: development
  audience: developers-qa
---

## What I do

- Write unit, integration, and end-to-end tests using the project's existing test framework (Jest, Vitest, Playwright, Cypress, Pytest, etc.)
- Follow the project's test patterns: file naming, describe/it structure, mocking approach, fixture management
- Cover happy paths, edge cases, error states, and accessibility

## When to use me

Use when: writing tests for a new feature, adding missing test coverage, setting up test infrastructure, or writing integration tests for API endpoints. Trigger phrases: "write tests for...", "add test coverage for...", "test this component/endpoint/function...", "set up testing for...".

## Workflow

1. Read existing tests to understand patterns: test runner config, file location conventions, describe/it nesting, mock setup, test utilities
2. Identify what to test:
   - **Unit tests**: pure functions, hooks, utility logic — test behavior, not implementation
   - **Component tests**: render, user interactions, prop variants, a11y
   - **Integration tests**: API endpoints with real or test database, middleware chains, service composition
   - **E2E tests**: critical user flows (signup → create → edit → delete)
3. Write tests that:
   - Have descriptive names explaining the scenario and expected outcome
   - Follow Arrange-Act-Assert pattern
   - Test one behavior per test case
   - Mock external dependencies at the boundary, not internals
   - Use test fixtures or factories for test data
4. Ensure tests are deterministic (no flaky timers, no network dependency in unit tests, no shared mutable state)
5. Run the tests to verify they pass (and fail meaningfully when the code is broken)

## Test naming convention

```
describe('[Unit Under Test]', () => {
  it('should [expected behavior] when [condition]', () => { ... })
})
```

Example: `it('should return 401 when token is expired')`
