---
name: codebase-explorer
description: Systematically explore and document unfamiliar codebases with structured maps
license: MIT
compatibility: opencode
metadata:
  domain: research
  audience: developers
---

## What I do

- Systematically explore an unfamiliar codebase and produce a structured understanding: directory map, key modules, data flow, entry points, and architectural patterns
- Generate navigation guides, onboarding docs, and dependency graphs
- Identify tech debt, code smells, and areas needing improvement

## When to use me

Use when: joining a new project, onboarding to a repository, evaluating open-source code, or understanding legacy code. Trigger phrases: "explore this codebase", "how does this project work", "give me an overview of...", "onboard me to...".

## Workflow

1. Start with the top-level directory structure and package manifests
2. Identify the framework and architectural pattern (MVC, hexagonal, microservices, monolith)
3. Trace the critical path: entry point → routing → business logic → data layer → response
4. Map module boundaries and their interfaces
5. Document: testing strategy, build system, deployment configuration, environment variables
6. Create a dependency graph of major modules
7. List potential issues: circular dependencies, missing tests, deprecated patterns, security concerns
8. Output a structured onboarding guide

## Output format

```markdown
# Codebase Exploration: [Project Name]
## Architecture Overview
## Directory Map
## Module Dependency Graph
## Critical Path Trace
## Configuration & Environment
## Testing & Build Pipeline
## Tech Debt & Improvement Areas
## Onboarding Quick-Start
```
