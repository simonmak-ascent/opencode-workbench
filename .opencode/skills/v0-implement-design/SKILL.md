---
name: v0-implement-design
description: >
  Implement an approved v0 design as production code per project conventions.
  Use when the user says "implement the design", "build the approved page",
  "convert v0 output to production", "adapt v0 code", or when implementation
  follows a design-gate approval. NEVER use to copy-paste v0 output directly —
  always adapt to tokens.json, custom components, and project conventions.
  Covers: token compliance, component adaptation, i18n wiring, container rules,
  audit readiness, and the design→implementation PR workflow.
---

# v0 Design → Implementation

Take an approved v0 design and implement it as hand-written production code.
**v0 output is a design artifact, never source code.** Implementation is always
adapted to project conventions.

## Pre-requisites

- Design approved by human (AC-D1 gate passed)
- v0 chat ID and deployment URL available
- Design reference files in `design/releases/<ver>/v0-output/` or on a `design/<ver>/<feature>` branch
- Project constitution read (`constitution.md`) — all banned patterns apply

## Implementation Workflow

### 1. Source the v0 design reference

```
v0 files <chatId> design/releases/<ver>/v0-output/
```

Or, if using web-app mode: the `design/<ver>/<feature>` branch has the generated code.

### 2. Create implementation branch

```
git checkout develop
git checkout -b feat/<ver>/<feature>
```

### 3. Adapt to project conventions (mandatory for every component)

| v0 output                                    | Replace with                                                                            |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| shadcn Button, Card, Dialog, etc.            | Custom Tailwind component matching the same visual                                      |
| Inline hex colors                            | `tokens.json` alias: `text-teal` #0085ae, `bg-teal-accent` #0083ab, `text-gold` #dfb947 |
| Rounded-full, rounded-xl buttons             | `rounded` (4px) — rectangular, uppercase                                                |
| `@/components/ui/*` (shadcn)                 | `@/components/ui/*` (project custom components)                                         |
| Tailwind v4 features (oklch, @container)     | Tailwind v3 equivalents                                                                 |
| Hardcoded text strings in JSX                | `useTranslations("key")` from `src/messages/{en,zh,hi,id,es}.json`                      |
| `export default` + `"use client"` everywhere | Server Components by default; `"use client"` only for interactivity                     |
| `useState` for content                       | Server Component fetching from SurrealDB via `src/lib/content.ts`                       |
| Gradient backgrounds                         | Flat colors from tokens                                                                 |
| Emoji in UI                                  | None (remove all)                                                                       |

### 4. Enforce container architecture

Every page must follow: `CSS Grid Template → Grid/Flexbox → Content`

```tsx
// Root: SiteShell handles the 5-zone grid. Pages render inside <main row-start-4>

// Page layout:
<main className="flex flex-col">
  <PageBanner />           // exempt (position:relative + absolute overlay)
  <section className="flex flex-col site-container">
    <SectionHeading />
    <div className="flex flex-col gap-10">  // <-- NEVER space-y-*
      {content}
    </div>
  </section>
</main>
```

Verify: `pnpm audit:containers` must exit 0 before PR.

### 5. Wire i18n

- All UI strings: `src/messages/{locale}.json` — never hardcoded
- Content: `src/lib/content.ts` → `getPage(slug, locale)` from SurrealDB
- `force-dynamic` on every page (no ISR)
- `localePrefix: "as-needed"`, `localeCookie: false`
- 5 locales supported; project picks subset

### 6. Wire AI backend (if design includes AI features)

- Ascent Navigator: floating chat panel (client component, `"use client"`)
- AI insights: Server Component, `force-dynamic`, fetched server-side from Python engines (Fly.io, via server-side proxy only — never exposed client-side)
- All AI-generated text rendered through `sanitizeRichText` from `src/lib/sanitize.ts`

### 7. Verify before PR

```bash
pnpm check           # tsc --noEmit && eslint
pnpm audit:containers  # must exit 0
pnpm audit:links     # all links resolve
pnpm audit:a11y      # WCAG 2.2 AA
pnpm audit:visual --base <vercel-preview-url> --share <token>
```

All verification runs on the **SWAS box only** (via `cs run`), never locally.

### 8. PR to develop

```bash
git add src/ design/releases/<ver>/
git commit -m "feat(<feature>): implement approved v0 design (release <ver>)"
git push origin feat/<ver>/<feature>
# Open PR on GitHub → SWAS runs pnpm check + audit (cs run) → merge
```

## Component Adaptation Cheat Sheet

| v0 Component                                                   | Project Equivalent                                                           |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `import { Button } from "@/components/ui/button"`              | Custom `<button className="bg-teal-button text-white uppercase px-6 py-3">`  |
| `import { Card } from "@/components/ui/card"`                  | `<div className="border border-borderGray p-6 hover:bg-lightBg">`            |
| `import { Dialog } from "@/components/ui/dialog"`              | Custom modal with `position:fixed z-50` and overlay                          |
| `import { DropdownMenu } from "@/components/ui/dropdown-menu"` | Custom dropdown: `invisible group-hover:visible absolute top-full shadow-lg` |
| `import { Table } from "@/components/ui/table"`                | `<table className="w-full"><thead><th scope="col">...`                       |
| `import { Input } from "@/components/ui/input"`                | `<input className="border border-borderGray px-4 py-2 text-text">`           |

## Banned in Implementation (constitution — NEVER introduce)

- No `any` type
- No `console.log` in `src/` (use `logError` from `src/lib/log.ts`)
- No string-concatenated SurrealQL (parameterized only)
- No hardcoded content strings in JSX (DB or messages JSON only)
- No shadcn/ui dependency
- No direct DB calls from client components
- No `space-y-*` (use `flex flex-col gap-*`)
- No `position:absolute` overlays (use `position:fixed`)
- No fresh npm dependencies without asking first

## Intentional Deviations (from v0 output)

These differences are EXPECTED and correct:

1. Token aliases replace inline hex values
2. Custom components replace shadcn imports
3. next-intl `useTranslations()` replaces hardcoded strings
4. Server Components replace `"use client"` defaults
5. force-dynamic replaces static generation
6. grid/flex containers replace bare block divs

## APF appendix (React SPA — NOT the Next.js flow above)

Everything above describes **apg-website** (Next.js 16 App Router). For **apf-website**
(React 19 + Vite 7 SPA + Express/tRPC), use this instead:

| Concern        | APF                                                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| i18n           | `client/src/messages/{en,zh,hk}.json` (3 locales, not 5)                                                                                        |
| Tokens         | `client/src/styles/tokens.v2.json` + `tokens-dark.json` + `tokens.status.json`                                                                  |
| Type-check     | `pnpm check` (tsc + token guard + ratchet + doc + CSP hash test)                                                                                |
| Unit tests     | `pnpm test` (Vitest, `server/**/*.test.ts`)                                                                                                     |
| Build          | `pnpm build:client`                                                                                                                             |
| a11y           | `pnpm audit:a11y --theme dark` **and** `--theme light`                                                                                          |
| E2E            | `pnpm e2e` (`scripts/e2e.mjs`, static server — never `vite preview`)                                                                            |
| CSP            | editing tokens changes the inline stylesheet → regenerate the `sha256` in `vercel.json`; `server/csp-style-hash.test.ts` fails until it matches |
| Not applicable | Server Components, `force-dynamic`, `audit:containers`, `audit:links`, next-intl                                                                |
| Immutable      | hero imagery — never touch it for an unrelated feature                                                                                          |

All verification runs on a compute box (`cs run`), never locally. The canonical
pipeline is `~/.config/opencode/workflows/design-gate.md`.
