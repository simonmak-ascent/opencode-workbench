---
name: benchmark-research
description: Research performance benchmarks and optimization strategies for tech choices
license: MIT
compatibility: opencode
metadata:
  domain: research
  audience: developers-performance
---

## What I do

- Research and analyze performance benchmarks for frameworks, databases, libraries, and infrastructure choices
- Compare latency, throughput, memory usage, bundle size, and cold-start times across alternatives
- Produce data-driven optimization recommendations with before/after projections

## When to use me

Use when: making performance-critical technology choices, investigating a performance bottleneck, comparing framework performance, or planning optimization work. Trigger phrases: "how fast is X vs Y", "benchmark comparison of...", "performance analysis of...", "is X faster than Y for...".

## Workflow

1. Define the performance dimensions that matter: latency (p50/p95/p99), throughput, memory, bundle size, cold start, TTFB, etc.
2. Research published benchmarks from reputable sources (not vendor benchmarks)
3. Look for real-world performance reports from production users (blog posts, conference talks, case studies)
4. Compare the top 2-4 options across the defined dimensions
5. Note benchmark methodology differences that affect comparability
6. Identify the performance characteristics of the current codebase if applicable
7. Produce optimization recommendations ordered by impact-to-effort ratio

## Output format

```markdown
# Performance Research: [Topic]
## Performance Dimensions & Priorities
## Candidate Comparison (with data)
## Methodology Notes & Caveats
## Current Baseline (if applicable)
## Optimization Recommendations (ranked by impact/effort)
## References
```
