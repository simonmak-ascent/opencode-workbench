# WebApp Domain Primer

Loaded during Phase 2 (Strategy) when the vision targets web application delivery.

## Research Patterns

### Market & Audience Research
- Who are the primary, secondary, and tertiary users? What are their demographics, technical literacy, and accessibility needs?
- What platforms/devices do users access from? (desktop, mobile, tablet, assistive tech)
- What are the key user journeys and drop-off points in comparable products?
- What are the regulatory requirements for this audience? (GDPR, CCPA, WCAG, sector-specific)

### Competitive Landscape
- Identify 3–5 direct competitors. For each: feature matrix, UX patterns, pricing model, user sentiment (App Store, G2, Reddit)
- Identify adjacent/aspirational products — products in different domains that serve the same user need
- What is the "hiring" and "firing" trigger? Why do users switch to/from competitors?

### Technology Assessment
- **Framework**: Evaluate based on team skills, performance needs, SEO requirements:
  - React/Next.js — SSR, large ecosystem, high hiring pool
  - Svelte/SvelteKit — smaller bundle, simpler mental model
  - Vue/Nuxt — gentle learning curve, strong documentation
  - Remix — web standards first, nested routing
  - Astro — content-heavy sites, partial hydration
- **Styling**: Tailwind CSS, CSS Modules, styled-components, Panda CSS — evaluate against design system needs
- **State Management**: Server state (TanStack Query, SWR) vs client state (Zustand, Jotai, Redux)
- **Auth**: Evaluate session-based (Better Auth, Lucia) vs token-based (Clerk, Auth0, Supabase Auth)
- **Hosting**: Vercel, Netlify, Cloudflare Pages, AWS Amplify — evaluate against scale, cost, edge requirements
- **Monitoring**: Sentry, Datadog, LogRocket, OpenTelemetry — error tracking, performance, user sessions

### UX & Accessibility
- WCAG 2.2 AA compliance checklist (color contrast, keyboard navigation, screen reader, focus management)
- Mobile-first breakpoint strategy (320px, 768px, 1024px, 1440px minimum)
- Loading states, empty states, error states, edge cases coverage
- Internationalization requirements (i18n, RTL support, date/number formatting)
- Performance budget: LCP < 2.5s, FID < 100ms, CLS < 0.1 (Core Web Vitals)

## Impact Verification

### Leading Indicators (measurable during/after build)
- User activation rate (completed key journey within first session)
- Time-to-value (minutes from signup to first meaningful action)
- Feature adoption (% of users using each strategic feature)
- Error rate (client-side + API errors per session)
- Page load performance (LCP, FID, CLS at p75/p95)
- Accessibility score (Lighthouse a11y audit, axe-core reports)

### Lagging Indicators (measurable post-launch)
- User retention (day 7, day 30, day 90)
- Net Promoter Score or user satisfaction survey
- Task completion rate (% of users who complete their intended goal)
- Support ticket volume and resolution time
- Organic growth rate (referrals, word of mouth)

### Impact-to-Vision Verification
For each vision goal, define the webapp-specific evidence that proves the impact:
- "Democratizes access to X" → measured by: % of users from target underserved demographics, geographic reach
- "Improves efficiency of Y" → measured by: time saved per task, reduction in manual steps
- "Builds community around Z" → measured by: active participants, content contributed, network density

## Domain-Specific Constraints

- **Browser support matrix**: Define minimum supported browsers (Chrome last 2, Firefox last 2, Safari last 2, Edge last 2)
- **Offline capability**: Does the app need to work offline? Service workers, IndexedDB, optimistic updates
- **Real-time requirements**: WebSockets, SSE, polling frequency
- **SEO requirements**: SSR vs CSR vs ISR strategy
- **Rate limiting**: Per-user, per-IP, per-endpoint thresholds
- **Content Security Policy**: Define CSP headers early — constrain script sources, connect sources
- **Cookie consent**: GDPR/ePrivacy cookie consent implementation strategy

## Anti-Patterns Specific to WebApps

- Building a SPA when the content is primarily static (use SSR/SSG instead)
- Over-fetching data (no API response design) — define payload shapes before building endpoints
- Client-side rendering everything (poor SEO, slow FCP) — evaluate per-route rendering strategy
- Ignoring the 404 page, error boundaries, and offline states until post-launch
- Skipping mobile testing because "users are on desktop"
- Using `any` type in TypeScript — loses all safety guarantees
- `console.log` in production — use structured logging with levels
- Hardcoded API URLs — use environment variables with validation

### Human-Psychology Integration

The WebApp primer intersects with `domain-primers/human-factors.md` at these points:

- **Vision phase**: When the webapp's impact goal involves behavior change (adoption, habit formation, reduced churn), load the human-factors primer alongside webapp.
- **First-session experience**: Apply Fogg Behavior Model — the webapp's onboarding must provide high motivation (clear value prop), high ability (no signup, instant use), and an effective prompt (CTA placement).
- **Cognitive load budget**: Every UI element beyond 5 core ones must be justified in spec with impact trace. Hick's Law governs navigation depth — flat navigation with fewer choices outperforms deep hierarchies.
- **Responsive design + cognitive accessibility**: Mobile users have higher cognitive load (smaller screen, divided attention). Breakpoints should simplify, not just resize.
- **Dark patterns audit**: No confirm-shaming buttons, no disguised ads, no forced social sharing. Every engagement mechanism must trace to a vision impact.

