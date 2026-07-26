---
name: spec-writer
description: Write thorough technical specifications and product requirement documents
license: MIT
compatibility: opencode
metadata:
  domain: research
  audience: developers-architects
---

## What I do

- Transform user ideas into structured technical specifications with clear scope, requirements, and acceptance criteria
- Produce PRDs, technical design docs, and RFCs following established templates
- Identify edge cases, constraints, non-functional requirements, and cross-cutting concerns

## When to use me

Use when: planning a new feature, writing a design doc, scoping an epic, or when the user says "write a spec for...", "design a system that...", or "create a PRD for...".

## Workflow

1. Gather requirements — ask clarifying questions about goals, users, constraints, and success metrics
2. Research existing codebase patterns — read related files, APIs, and schemas to ground the spec in reality
3. Break down into modules/components with clear interfaces and data contracts
4. Define data models, API contracts, and error states
5. List non-functional requirements: performance, security, accessibility, observability
6. Write the spec with: overview, goals, non-goals, architecture, data models, API design, error handling, testing strategy, migration plan
7. Validate against existing patterns in the codebase — flag inconsistencies

## Output format

```markdown
# [Feature Name]
## Overview
## Goals & Non-Goals
## Architecture
## Data Model
## API / Interface Design
## Error Handling
## Testing Strategy
## Migration Plan
## Open Questions
```
