# Web Scraper Best Practices (2026)

> Research completed: 2026-07-27 | Phase: #1C | Sources: 97+

## Executive Summary

Durable, replayable scraping pipeline: queue → HTTP/browser worker → immutable snapshot → deterministic parser → validation → diff engine → SurrealDB storage → alerts. Prefer HTTP over browsers. Separate acquisition from extraction. Version every parser and schema.

---

## 1. Architecture

```text
Schedule/API → Scheduler → Durable job queue → Per-origin admission control
                                                      │
                        ┌─────────────────────────────┴──────────────────────┐
                        │                                                    │
                 HTTP fetch worker                                  Browser worker
                 (cheap/static pages)                     (Playwright + Browserless)
                        │                                                    │
                        └──────────────────────┬──────────────────────────────┘
                                               │
                                    Raw immutable snapshot
                              HTML + screenshot + headers + metadata
                                               │
                        ┌──────────────────────┴──────────────────────────────┐
                        │                                                      │
                 Deterministic parser                                AI fallback/parser
            JSON-LD → CSS → XPath/regex                    Schema-constrained LLM
                        │                                                      │
                        └──────────────────────┬──────────────────────────────┘
                                               │
                                   Validation & normalization
                                               │
                                  Diff/change-detection engine
                                               │
                         SurrealDB ─→ alerts ─→ downstream consumers
                                               │
                            Sentry + metrics + logs + dead-letter queue
```

**Core principles**:
1. HTTP first, browser only when JS rendering/auth required
2. Queue every crawl — never trigger browsers from web requests
3. Per-origin controls: concurrency, rate, budget, circuits
4. Every stage replayable: immutable snapshots → re-parse without re-fetch
5. Separate acquisition from extraction — different failures, different retries
6. Version parsers and schemas: every record has `snapshot_id`, `parser_version`, `schema_version`
7. Anti-bot responses = stop signals (circuit open), not evasion triggers

---

## 2. Playwright Headless Scraping & Stealth

**Locator priority**: `getByRole` > `getByLabel` > `getByTestId` > semantic CSS > scoped XPath > text/regex

**Production pattern**:
```ts
const browser = await chromium.launch({
  headless: true,
  args: ["--disable-dev-shm-usage"],
});

const context = await browser.newContext({
  userAgent: "Mozilla/5.0 ... Chrome/138.0.0.0 Safari/537.36",
  viewport: { width: 1920, height: 1080 },
  locale: "en-US",
  timezoneId: "America/New_York",
  serviceWorkers: "block",
});

// Block media/fonts; keep CSS for visibility-dependent interactions
await page.route("**/*", route => {
  if (["media", "font"].includes(route.request().resourceType())) return route.abort();
  route.continue();
});
```

**Stealth = fingerprint consistency**, not evasion:
- Keep browser version, user agent, viewport, OS, locale, timezone aligned
- Reuse one browser context per logical session (cookies, localStorage, IP stable)
- A few tested profiles > random fingerprint generation
- Test headless vs headed (rendering APIs differ)
- NEVER rotate identity mid-session
- Use `stealth` flag only when explicitly needed (e.g., Browserless `/stealth` endpoint)

---

## 3. Browserless: Cloud Browsers & Concurrency

**Connection**: CDP is primary stable mechanism. Playwright native endpoints support Chromium, Firefox, WebKit.

```ts
const endpoint = `wss://production-sfo.browserless.io?token=${token}`;
const browser = await chromium.connectOverCDP(endpoint);
// ALWAYS close in finally() — leaked sessions occupy paid concurrency
```

**Concurrency model**:
- `CONCURRENT`: active sessions; `QUEUED`: waiting; `TIMEOUT`: max session duration
- `/pressure` endpoint reports running, queued, maxConcurrent, maxQueued
- Client concurrency should be below purchased capacity
- Use distributed semaphore (Redis) across workers, not process-local p-limit

**Admission control**:
```ts
async function hasBrowserCapacity(): Promise<boolean> {
  const p = await fetch(`/pressure?token=...`);
  return p.running < Math.floor(p.maxConcurrent * 0.9)
    && p.queued < Math.floor(p.maxQueued * 0.5);
}
```

---

## 4. Rate Limiting, Backoff & Circuit Breakers

**Separate controls**: global capacity, per-domain concurrency, per-domain request rate, per-account rate, daily crawl budget, circuit state.

**Retry (idempotent only)**:
```ts
const RETRYABLE = new Set([408, 425, 429, 500, 502, 503, 504]);
// Exponential backoff: min(60s, 1s * 2^attempt) with full jitter
// Honor Retry-After (seconds or HTTP-date)
```

**Do NOT auto-retry**: 401/403, CAPTCHA, robots.txt disallow, selector failures, 404/410, malformed URLs.

**Circuit breaker** (`opossum` pattern): block after repeated failures → half-open test → close on success. One breaker per origin and failure class.

---

## 5. Data Extraction Hierarchy

1. **Official API / data export** (always preferred)
2. **Embedded structured data**: JSON-LD `<script type="application/ld+json">`
3. **Stable semantic CSS**: `[itemprop="price"]`, `[data-sku="..."]`, `[data-testid="..."]`
4. **Playwright role/label locators**: `getByRole("heading")`, `getByLabel("...")`
5. **Scoped XPath**: for structural relationships only
6. **Text/regex normalization**
7. **LLM-assisted extraction**: for heterogeneous long-tail sites or repair
8. **Human review**: as final safety net

**Validation**: Zod schema + business rules (currency matches locale, sale < list price, record count within historical bounds, no duplicate IDs).

**AVOID**: `body > div:nth-child(3) > div.a8f19 > span:nth-child(2)` — depends on presentation/generated classes/position.

---

## 6. AI-Assisted Parsing

**Use LLMs for**: heterogeneous long-tail sites, initial selector discovery, parser repair after layout change, semantic extraction from prose, change classification.

**NOT for**: stable high-volume sources (use deterministic parser).

**Safe pattern**:
1. Isolate relevant DOM subtree (remove scripts, styles, nav, ads, hidden content)
2. Supply strict JSON schema
3. Return `null` when evidence absent
4. Request evidence snippets/offsets
5. Validate structurally + domain rules
6. Reject low-confidence records
7. Store model, prompt version, input hash, token cost

**Prompt injection defense**: treat webpage text as untrusted data, delimit it clearly, disallow page content from choosing tools/URLs/credentials.

---

## 7. Change Detection

**Level 1 — Transport**: `ETag`, `Last-Modified`, conditional requests → `304 Not Modified`

**Level 2 — Normalized content**: Remove scripts, styles, timestamps, CSRF tokens, random IDs, ads, whitespace → SHA-256

**Level 3 — Semantic diff**: Compare normalized structured records field-by-field. JSON Patch for objects, line/word diff for prose.

**Alert pipeline**:
```
Schedule → SurrealDB fetch targets → Split batch → Scraper webhook →
IF success → normalize + hash → fetch previous snapshot → IF hash differs →
calculate semantic diff → IF severity threshold met → Slack/Email/PagerDuty →
archive snapshot + update baseline
```

**Never update baseline until**: fetch succeeded + not a CAPTCHA/login + extraction passed validation + snapshot committed.

---

## 8. Raw HTML → Structured SurrealDB

**Storage**: Compressed HTML/screenshots in immutable object storage, hashes + metadata in SurrealDB. Do NOT store multi-megabyte HTML bodies directly in the database.

**Schema**:
```sql
DEFINE TABLE target SCHEMAFULL;
DEFINE FIELD url, canonical_url, origin, enabled, fetch_mode, compliance, schedule ON target;

DEFINE TABLE snapshot SCHEMAFULL CHANGEFEED 30d;
DEFINE FIELD target, fetched_at, status, final_url, headers, raw_sha256, normalized_hash, html_uri ON snapshot;

DEFINE TABLE extraction SCHEMAFULL CHANGEFEED 30d;
DEFINE FIELD snapshot, target, parser_version, schema_version, method, payload, valid, errors ON extraction;

DEFINE TABLE change SCHEMAFULL;
DEFINE FIELD target, previous, current, changed_fields, diff, severity, detected_at, alerted_at ON change;
```

**Deterministic IDs**: `sha256(targetId + fetchedAt + rawHtmlHash)` for snapshots. `sha256(snapshotId + parserVersion + schemaVersion)` for extractions. Idempotent upserts.

---

## 9. Legal & Ethical Compliance

**Compliance record per target**: robots allowed, ToS URL/hash, contractual permission, data categories, personal data presence, lawful basis, retention, approved purpose.

**robots.txt** (RFC 9309): lowercase path, product token matching, most specific rule wins, cache ≤ 24h, network failures = complete disallow. Truthful user agent (not Googlebot).

**Terms**: Record and hash ToS before scraping. Check automated access/data reuse/commercial restrictions. Stop after cease-and-desist.

**Personal data (EU)**: Document purpose, necessity, minimization, retention, security, deletion rights, legal basis. Conduct DPIA for high-risk/large-scale processing.

**Operational safeguards**: exclude sensitive fields, hash/tokenize identities, encrypt raw artifacts, short retention for raw HTML with personal data, deletion/source-correction workflows.

---

## 10. Anti-Bot Countermeasures

**Proxies**: One sticky proxy per browser session. Match proxy region to locale/timezone. Track success rate, latency, block rate per endpoint. Rotate between sessions, not between requests. Do NOT use proxy rotation to circumvent blocks.

**User-agent pools**: Small set of internally consistent profiles. Deterministic assignment per session. Reject profiles whose browser version doesn't match installed runtime.

**CAPTCHA**: Detect it → stop automatic retries → preserve screenshot + headers → open circuit → use official API or request permission → route to human review only if authorized. Do NOT auto-solve.

---

## 11. Sentry Monitoring

**Cron monitoring**:
```ts
Sentry.withMonitor("catalog-scrape", async () => { ... }, {
  schedule: { type: "crontab", value: "*/15 * * * *" },
  checkinMargin: 5, maxRuntime: 12,
  failureIssueThreshold: 2, recoveryThreshold: 2,
});
```

**Job tracing**: tags for `stage`, `target`, `origin`, `retryable`. Context for `jobId`, `attempt`, `parserVersion`, `browserProfile`.

**Metrics**: jobs scheduled/completed/retried/dead-lettered, queue depth + oldest-job age, fetch latency by origin/mode, HTTP status distribution, 403/429/CAPTCHA/timeout rates, Browserless utilization, raw + normalized change rates, selector-empty rate, schema-validation rate, LLM token cost + validation failure rate, circuit-open duration.

**Alerts**:
- Critical: missed schedule, queue age > 2× interval, valid extraction <80%, DB write failures, CAPTCHA spike
- Warning: selector-empty >5%, Browserless queue >50%, p95 browser duration > target, LLM fallback rate doubles, silently empty output (No records changed for active source)

---

## Production Checklist

- [ ] Target registry with owner, purpose, robots policy, ToS, rate limits, retention
- [ ] HTTP first; browser only when required
- [ ] Durable queues with idempotent job IDs
- [ ] Per-origin concurrency and rate limits
- [ ] Honor Retry-After; capped full-jitter retries
- [ ] Circuit breakers for sustained 429/5xx/CAPTCHA
- [ ] Consistent browser fingerprint; session-stable
- [ ] Browser sessions closed in `finally`
- [ ] JSON-LD → CSS → XPath → LLM extraction hierarchy
- [ ] Schema + business rule validation
- [ ] Immutable snapshots with parser/schema provenance
- [ ] Normalize volatile content before hashing
- [ ] Diff structured records, not raw HTML
- [ ] Baseline updated only after successful validation + commit
- [ ] SCHEMAFULL SurrealDB with deterministic upserts
- [ ] Severity-ranked alerts
- [ ] Sentry monitors for schedules, queue age, block rates, extraction yield, silent failures
- [ ] CAPTCHA = stop + review, not evasion escalation
