---
name: cicd-setup
description: Configure CI/CD pipelines for automated testing, building, and deployment
license: MIT
compatibility: opencode
metadata:
  domain: development
  audience: developers-devops
---

## What I do

- Set up CI/CD pipelines using the project's CI provider (GitHub Actions, GitLab CI, CircleCI, etc.)
- Configure automated testing, linting, type-checking, building, and deployment stages
- Ensure fast feedback loops with parallel jobs and intelligent caching

## When to use me

Use when: setting up CI for a new project, adding stages to an existing pipeline, optimizing build times, or configuring automated deployments. Trigger phrases: "set up CI for...", "add a GitHub Action for...", "configure deployment pipeline...", "automate testing in CI...", "add linting to CI...".

## Workflow

1. Read existing CI configs to understand patterns, secrets management, and deployment setup
2. Design the pipeline stages (ordered by speed — fail fast):
   - **Lint & Format**: run linters and formatters (ESLint, Biome, ruff) — < 2 min
   - **Type Check**: run TypeScript/mypy compiler — < 3 min
   - **Unit Tests**: run fast tests in parallel — < 5 min
   - **Build**: compile/production build to catch build errors — < 5 min
   - **Integration Tests**: spin up test DB/services, run API tests — < 10 min
   - **E2E Tests**: Playwright/Cypress against staging — < 15 min
   - **Deploy**: deploy to staging/production (gated on all tests passing)
3. Implement:
   - Dependency caching (node_modules, pip cache, Go modules)
   - Build artifact caching (Next.js .next/cache, Turborepo cache)
   - Parallel job execution where possible
   - Matrix builds for multiple Node/Python versions if needed
   - Preview deployments for PRs
4. Set up branch protection rules (in prose, since this is a repo-level config):
   - Require passing CI before merge
   - Require PR review
5. Test the pipeline by pushing a branch and verifying it runs

## GitHub Actions example structure

```yaml
name: CI
on: [push, pull_request]
jobs:
  lint: ...
  typecheck: ...
  test: ...
  build: ...
  deploy-preview: # on PR
  deploy-production: # on main, needs all tests
```
