---
name: tech-stack-eval
description: Evaluate and recommend technology stacks with trade-off analysis
license: MIT
compatibility: opencode
metadata:
  domain: research
  audience: architects-tech-leads
---

## What I do

- Evaluate technology choices (frameworks, databases, hosting, tooling) for a project with structured trade-off analysis
- Consider: maturity, performance, ecosystem, hiring, learning curve, long-term maintenance cost
- Produce an architecture decision record (ADR) for each key choice

## When to use me

Use when: starting a new project, making a major tech decision, choosing between frameworks or databases. Trigger phrases: "what stack should I use for...", "React vs Vue vs Svelte for...", "PostgreSQL vs MongoDB for...", "help me choose a framework...".

## Workflow

1. Understand the project: scale, team size, timeline, performance requirements, existing skills
2. Identify 2-4 viable options for each technology decision category
3. For each option, research: maturity (age, releases, adoption), performance (benchmarks, real-world), ecosystem (plugins, tooling, community), learning curve, hiring availability, long-term viability
4. Create a weighted decision matrix with the user's priorities as weights
5. Write an ADR for each decision following the standard format (context, decision, consequences)
6. Flag any risky choices and suggest fallback options

## Output format

```markdown
# Technology Stack Evaluation: [Project]
## Context & Constraints
## Decision Areas
### [Area]: [Decision]
- Candidates
- Weighted Matrix
- ADR (Context → Decision → Consequences)
## Overall Stack Recommendation
## Risks & Mitigations
```
