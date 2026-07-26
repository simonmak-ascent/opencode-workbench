---
name: architecture-review
description: Review system architecture for scalability, reliability, and maintainability
license: MIT
compatibility: opencode
metadata:
  domain: research
  audience: architects-tech-leads
---

## What I do

- Review existing or proposed system architecture against best practices for scalability, reliability, security, and maintainability
- Identify architectural risks, bottlenecks, and single points of failure
- Produce actionable recommendations with diagrams and ADRs

## When to use me

Use when: reviewing a design before implementation, evaluating a system for scale, or preparing for a major refactor. Trigger phrases: "review my architecture", "is this design scalable", "architectural risk assessment", "evaluate system design".

## Workflow

1. Gather context: existing architecture docs, diagrams, deployment topology, traffic patterns, SLAs
2. Evaluate across standard dimensions:
   - Scalability: can it handle 10x growth? Where are the bottlenecks?
   - Reliability: fault tolerance, retry logic, circuit breakers, graceful degradation
   - Security: attack surface, auth model, data protection, secret management
   - Maintainability: module coupling, test coverage, observability, documentation
   - Cost: infrastructure efficiency, vendor lock-in risk
3. Identify anti-patterns: distributed monolith, tight coupling, missing abstractions
4. Produce an architecture decision record for each recommended change
5. Include a risk matrix (likelihood × impact) and suggested migration path

## Output format

```markdown
# Architecture Review: [System]
## Current State Summary
## Dimension Analysis (Scalability, Reliability, Security, Maintainability, Cost)
## Anti-Patterns Found
## Risk Matrix
## Recommendations with ADRs
## Migration Path
```
