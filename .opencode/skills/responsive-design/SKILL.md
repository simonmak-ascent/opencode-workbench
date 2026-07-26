---
name: responsive-design
description: Implement responsive layouts with mobile-first approach and breakpoint systems
license: MIT
compatibility: opencode
metadata:
  domain: development
  audience: frontend-developers
---

## What I do

- Implement responsive layouts that work across mobile, tablet, and desktop breakpoints
- Use the project's CSS/styling framework (Tailwind, CSS modules, styled-components) and breakpoint conventions
- Ensure touch targets, readable font sizes, and appropriate information density at each breakpoint

## When to use me

Use when: building a new page/layout, fixing responsiveness issues, implementing a mobile-first design, or converting desktop-only UI to responsive. Trigger phrases: "make this responsive", "mobile layout for...", "responsive design for...", "implement breakpoints for...", "this looks broken on mobile...".

## Workflow

1. Read the project's styling setup: breakpoint values, CSS framework, existing layout components, and responsive patterns
2. Implement mobile-first: design for the smallest screen first, then add breakpoint overrides
3. Ensure:
   - Viewport meta tag is present
   - Fluid typography (clamp() or breakpoint-based scaling)
   - Flexible grids that reflow (CSS Grid or Flexbox)
   - Images with srcset/sizes or responsive containers
   - Touch targets ≥ 44×44px on mobile
   - No horizontal overflow at any breakpoint
   - Readable line lengths (45-75 characters) at all sizes
4. Test the layout at each breakpoint — verify no content is cut off, overlapping, or requiring horizontal scroll
5. For complex layouts (dashboard, sidebar, data tables), consider: collapse priority, off-canvas patterns, horizontal scroll as last resort for tables

## Breakpoint reference

Use the project's existing breakpoints. If none defined, suggest:
- sm: 640px (mobile landscape)
- md: 768px (tablet)
- lg: 1024px (desktop)
- xl: 1280px (wide)
- 2xl: 1536px (ultra-wide)
