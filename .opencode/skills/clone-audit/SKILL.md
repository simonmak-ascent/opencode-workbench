---
name: clone-audit
description: >
  Audit a clone/rebuild website against its original for visual, style, content, link,
  accessibility, and SEO fidelity. Use when the user asks to "audit the clone", "run the
  audit", "compare with the original", "find gaps", or before/after fidelity fixes.
  Covers the free toolchain in scripts/: audit-visual (Playwright + pixelmatch),
  audit-links (crawler), audit-a11y (axe-core).
---

# Clone Website Audit

## Toolchain (all free, lives in `scripts/`)

| Script | What it does | Output |
|---|---|---|
| `pnpm audit:visual` | Screenshot pairs orig vs clone per page×viewport, pixelmatch diff %, computed-style diff of h1/h4/p | `design/audit/<date>/report.json` + `*-orig.png`/`*-clone.png`/`*-diff.png` |
| `pnpm audit:links` | Crawls the clone (SSO-cookie aware), checks every unique href | `design/audit/<date>/links.json` |
| `pnpm audit:a11y` | axe-core on key pages both locales | `design/audit/<date>/a11y.json` |
| `pnpm audit` | All three | |

## How to run

1. All runs happen on the **SWAS box** (via `cs run`), never locally.
2. Get the latest preview URL from `vercel_list_deployments`, then a share token from `vercel_get_access_to_vercel_url`.
3. Run, e.g.:
   `node scripts/audit-visual.mjs --base <preview-url> --share <token> [--pages valuation,contact] [--viewports 1440,820,390] [--threshold 0.1]`

## Reading results (avoid false positives)

- **Full-page diff % is noisy by design.** Known noise sources: hero slider frame differences, cookie banner placement (original bottom bar vs clone box), reCAPTCHA area, JPEG vs Next/image WebP compression, side-area DOM on original. Before treating a high % as a gap, open the `*-diff.png` and look at *where* the red pixels are.
- Diff classification: >10% = investigate, 2–10% = usually cosmetic noise, <2% = pass.
- **Canonical/hreflang tags** point to `ascent-partners.com` (future production domain) — the link checker flags these; they are expected, not broken links.
- Bot-block false positives on external links: LinkedIn (999), adb/oecd/iea/bloomberg (403), Google+ (429) — work in real browsers.
- Inherited dead links in old post content match the original's dead links — fidelity, not bugs.

## Fix loop

1. Triage `report.json`: classify each finding as `auto_fixable` vs judgment call; add intentional deviations to the allowlist below.
2. Fix in batches by surface: CSS/globals → components → content/DB → env/config.
3. `cs run "pnpm check && pnpm build"` on SWAS, push, verify on the per-deployment preview URL.
4. Re-run only the affected audit checks (`--pages`) to close rows.

## Intentional deviations (allowlist — never report these)

- zh contact page 404s on the original; clone has a working zh page (improvement).
- Original's side menu is inaccessible (no opener); clone exposes it on mobile/tablet only.
- Desktop sidebar trigger: none on both (clone: mobile-only).
- Cookie banner: floating box (clone) vs bottom bar (original) — tracked as low-severity.
- `force-dynamic` SSR on clone vs static original — architecture, not a visual gap.

## Environment prerequisites (env-gated features)

- reCAPTCHA: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` + `RECAPTCHA_SECRET_KEY`
- Contact email: `RESEND_API_KEY` + `CONTACT_NOTIFY_EMAIL`
- Instagram feed: `INSTAGRAM_ACCESS_TOKEN`
Unset = feature silently disabled; audit checks should expect absence, not failure.
