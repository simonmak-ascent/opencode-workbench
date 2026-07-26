---
name: component-builder
description: Build accessible, composable UI components with proper typing and testing
license: MIT
compatibility: opencode
metadata:
  domain: development
  audience: frontend-developers
---

## What I do

- Build UI components following the project's existing patterns (React, Vue, Svelte, etc.)
- Ensure accessibility (a11y), proper TypeScript typing, responsive behavior, and composability
- Generate accompanying tests, stories, and documentation

## When to use me

Use when: building a new UI component, refactoring an existing one, or implementing a design system pattern. Trigger phrases: "build a component for...", "create a button/modal/form/table that...", "implement this UI pattern...".

## Workflow

1. Read existing components in the codebase to understand patterns, conventions, and imports
2. Check the design system (if available via MCP) for existing variants
3. Implement the component with:
   - Proper TypeScript types (no `any`)
   - ARIA attributes and keyboard navigation
   - Responsive design using the project's breakpoint system
   - Loading, empty, error, and edge-case states
   - CSS following the project's styling approach (Tailwind, CSS modules, styled-components)
4. Write a unit test covering render, interactions, and edge cases
5. If the project has Storybook, generate a `.stories` file with all variants
6. Validate the component renders and handles all prop combinations

## Principles

- Prefer composition over configuration
- One component, one responsibility
- All interactive elements must be keyboard accessible
- Colors must meet WCAG AA contrast ratios
- Props must be fully typed with JSDoc descriptions
