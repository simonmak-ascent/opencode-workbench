# Design Principles

> Phase: #2 | Created: 2026-07-27

## 1. Server-First Rendering

Render everything on the server by default. Client Components only for interactivity, state, effects, and browser APIs. This mirrors Next.js RSC architecture.

## 2. Progressive Enhancement

Core functionality works without JavaScript. Enhancements (streaming, real-time, animations) are layered on top. HTML-first, then CSS, then JS.

## 3. Token-Driven Design

Design tokens (colors, spacing, typography, radii) originate from Figma Variables. They flow through Style Dictionary → CSS custom properties → Tailwind theme. Never hardcode design values.

## 4. Mobile-First Responsive

Start with mobile layout, enhance for larger viewports. Use Tailwind breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px).

## 5. Accessible by Default

- Semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<article>`)
- ARIA labels where semantics are insufficient
- Focus management for dialogs, toasts, and dynamic content
- Color contrast meets WCAG AA minimum
- Keyboard navigation for all interactive elements
- Screen reader announcements for live regions (chat messages, status updates)

## 6. Consistent Loading States

Every async operation shows a loading state:
- Page-level: `loading.tsx` (Next.js)
- Component-level: `<Suspense>` boundaries
- Button-level: disabled + spinner during submission
- Chat: streaming text indicator, tool execution status
- Data tables: skeleton rows while fetching

## 7. Error Boundaries

Graceful degradation at every level:
- Route: `error.tsx` with reset
- Section: `<ErrorBoundary>` with fallback
- API call: inline error state with retry
- AI stream: fallback message with "try again"

## 8. Dark Mode Support

Design tokens include light and dark variants. Theme toggle respects `prefers-color-scheme` with manual override. Tokens use `[data-theme='dark']` CSS selector.

## 9. Shadcn/ui Component System

Use shadcn/ui v4 components as the base design system. Customize via CSS variables and Tailwind theme. Compose complex UIs from primitives rather than building bespoke components.

## 10. Figma ↔ Code Sync

- Figma is the source of truth for visual design
- Design tokens are versioned and exported
- CI validates that generated CSS matches committed output
- Visual regression tests catch drift
- Designer + engineer review required for token changes
