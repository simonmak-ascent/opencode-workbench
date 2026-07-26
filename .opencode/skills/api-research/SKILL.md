---
name: api-research
description: Evaluate third-party APIs, SDKs, and libraries for integration decisions
license: MIT
compatibility: opencode
metadata:
  domain: research
  audience: developers
---

## What I do

- Research and evaluate third-party APIs, SDKs, and libraries for a given integration need
- Compare alternatives on: API design quality, documentation, SDK maturity, pricing, rate limits, reliability, and community support
- Produce a structured recommendation with integration plan and proof-of-concept code

## When to use me

Use when: choosing between multiple API providers, evaluating an SDK for a new integration, or researching available libraries for a task. Trigger phrases: "what's the best API for...", "evaluate SDK options for...", "compare payment/auth/email providers...", "research libraries for...".

## Workflow

1. Define the integration requirements: what must the API/SDK do? What are hard constraints?
2. Search for available options — use web search, GitHub, package registries, and Context7 for docs
3. For each candidate, evaluate:
   - API design: REST/GraphQL/gRPC, consistency, versioning
   - SDK quality: language support, bundle size, TypeScript types, tree-shaking
   - Documentation: completeness, examples, changelog
   - Pricing: free tier, usage-based, enterprise
   - Reliability: uptime history, status page, incident response
   - Community: GitHub stars, issue response time, Stack Overflow activity
4. Produce a weighted recommendation matrix
5. Provide a minimal integration example for the top pick

## Output format

```markdown
# API Evaluation: [Purpose]
## Requirements
## Candidates (ranked)
## Comparison Matrix
## Recommendation with Rationale
## Integration Example (Proof of Concept)
## Risks & Mitigations
```
