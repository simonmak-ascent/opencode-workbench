---
name: state-management
description: Set up and implement client and server state management patterns
license: MIT
compatibility: opencode
metadata:
  domain: development
  audience: frontend-developers
---

## What I do

- Set up and implement state management patterns using the project's existing libraries (Redux, Zustand, Jotai, TanStack Query, Pinia, etc.)
- Distinguish between server state (cached, synced) and client state (ephemeral, UI-only)
- Implement proper loading, error, and stale states

## When to use me

Use when: adding global state, setting up data fetching, refactoring prop drilling, implementing optimistic updates, or caching server responses. Trigger phrases: "manage state for...", "fetch data for...", "add caching for...", "share state between...", "optimistic update for...".

## Workflow

1. Identify the project's state management patterns — read store files, query hooks, context providers
2. Classify the state:
   - **Server state**: data from APIs — use TanStack Query, SWR, RTK Query, or Apollo Client
   - **Client state**: UI state, form state, filters — use Zustand, Jotai, Redux, Context, or the framework's built-in
   - **URL state**: search params, route params — use the framework's router
3. Implement:
   - Data fetching with proper cache keys and stale times
   - Loading skeletons or spinners during initial fetch
   - Error boundaries or error states for failed fetches
   - Optimistic updates for mutations (update UI before server confirms)
   - Rollback on mutation failure
   - Pagination or infinite scroll for lists
4. Keep state as close to where it's used as possible — avoid unnecessary global state
5. Write tests for: initial load state, successful data render, error state, mutation flows, cache invalidation

## Decision guide

- One component uses it → local state (useState)
- A few siblings share it → lift to parent
- Many components across the tree → context or store
- Comes from the server → server state library (TanStack Query)
- Persists across sessions → localStorage + store
