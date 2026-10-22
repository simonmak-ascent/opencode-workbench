# Clone Workflow — Website Cloning (`vdd e2e -clone <domain>`)

The `clone` phase turns a live website into a **deployable dynamic clone** that
serves the full crawled dataset — not a single-page screenshot.

## Pipeline

```
A-001  normalize        → https://<host>   (https/http/www/bare in, canonical origin out)
A-002  crawl            → dataset          (root + sitemap + same-origin link BFS)
A-003  capture+evidence → design tokens, JSON responses (Playwright, best-effort)
A-004  schema inference → entities/relationships (from JSON evidence)
A-005  backend          → SQL migrations + CRUD route specs
A-006  dynamic site     → vdd/clone-site/ (SPA serving the dataset)
A-007  AI tools         → clone_capture_site / clone_record_evidence / …
```

## Crawling (A-002)

- **Seeds**: the origin root plus every URL in `sitemap.xml` / `sitemap_index.xml`.
- **Growth**: breadth-first over same-origin `<a href>` links.
- **Cap**: `maxPages` (default 200) — `truncated` is set when more pages remain.
- **Transport**: **Browserless-first** — `POST {BROWSERLESS_HOST}/content?token={BROWSERLESS_TOKEN}`
  (JS-rendered HTML) with a plain-`fetch` fallback, so server-rendered sites still
  crawl when Browserless is down or absent.
  - `BROWSERLESS_HOST` (default `http://localhost:3000`)
  - `BROWSERLESS_TOKEN`

### Dataset schema (`vdd/clone-dataset.json`)

```json
{
  "root": "https://example.com",
  "crawledAt": "2026-09-04T00:00:00.000Z",
  "maxPages": 200,
  "truncated": false,
  "pages": [
    {
      "url": "https://example.com/",
      "path": "/",
      "title": "Home",
      "description": "…",
      "lang": "en",
      "headings": ["…"],
      "paragraphs": ["…"],
      "images": ["https://example.com/logo.png"],
      "links": ["https://example.com/about"]
    }
  ]
}
```

## Dynamic site (A-006) — `vdd/clone-site/`

A dependency-free single-page app (zero build step):

| File | Purpose |
|------|---------|
| `index.html` | SPA shell |
| `app.js` | hash router — renders index + every page from the dataset |
| `data/pages.json` | the full crawled dataset |
| `style.css` | captured design tokens + shell styles |
| `vercel.json` | static deploy config |

It loads `data/pages.json` at runtime and renders a nav grouped by top-level
path segment, a page index, and per-page details (title, description, headings,
paragraphs, images, links).

## Deploying the live clone

```bash
vdd e2e -clone https://example.com          # writes vdd/clone-site/ + vdd/clone-dataset.json
vercel deploy vdd/clone-site --prod          # or drag the folder into Vercel/Netlify/GH Pages
```

The `clone` phase returns `output.site` (file list) and `output.deploy` (deploy
instructions); the host agent deploys `vdd/clone-site/` and reports the live URL.

## Testing

Unit tests (`packages/vdd-engine/test/`) use an injected `fetcher` / mocked
`fetch` + a stubbed Playwright launch, so the crawl and site generation are
deterministic with no network or browser.
