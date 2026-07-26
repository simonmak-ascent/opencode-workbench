---
name: perf-optimizer
description: Profile and optimize frontend and backend performance bottlenecks
license: MIT
compatibility: opencode
metadata:
  domain: development
  audience: developers-performance
---

## What I do

- Profile and optimize performance: bundle size, rendering, network waterfalls, database queries, and API response times
- Apply framework-specific optimization techniques (React.memo, Next.js ISR, database indexing, caching strategies)
- Measure before and after to quantify improvements

## When to use me

Use when: investigating slow pages, optimizing bundle size, speeding up API responses, reducing Time to Interactive, or preparing for a performance-sensitive launch. Trigger phrases: "optimize performance of...", "this page is slow...", "reduce bundle size...", "speed up this query...", "improve lighthouse score...".

## Workflow

1. Establish a baseline — measure current performance metrics using available tools
2. For frontend optimization:
   - **Bundle size**: analyze with bundle analyzer, identify large dependencies, implement code splitting and lazy loading
   - **Rendering**: identify unnecessary re-renders, add React.memo/useMemo/useCallback where profiling shows benefit
   - **Loading**: implement suspense boundaries, streaming SSR, skeleton loading states
   - **Images**: ensure Next/Image or equivalent optimization, correct formats (WebP/AVIF), lazy loading
   - **Fonts**: optimize font loading (font-display: swap, subset, self-host)
   - **Network**: reduce waterfall with resource hints (preload, prefetch), implement data caching
3. For backend optimization:
   - **Queries**: identify N+1 queries, add eager loading, optimize joins, add missing indexes
   - **Caching**: implement Redis/Memcached for hot data, HTTP cache headers (ETag, Cache-Control)
   - **N+1**: use DataLoader or ORM eager loading to batch database queries
   - **Serialization**: avoid over-fetching, use field selection or sparse fieldsets
4. Measure after each change — only keep optimizations that show measurable improvement
5. Benchmark in production-like conditions (not dev with hot reload)

## Key metrics

- Frontend: LCP < 2.5s, FID < 100ms, CLS < 0.1, TTI < 5s
- Backend: p95 response time < 200ms for APIs, query time < 50ms
- Bundle: initial JS < 200KB gzipped per route
