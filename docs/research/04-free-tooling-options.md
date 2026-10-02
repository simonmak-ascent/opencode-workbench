# Free Tooling Options

> Research completed: 2026-07-27 | Phase: #1D

## Tools Already Available in the Workstation

| Tool | Category | Purpose |
|------|----------|---------|
| `pandoc` | Data | Document format conversion |
| `miller` (mlr) | Data | CSV/JSON/TSV processing |
| `jq` | Data | JSON processing |
| `csvkit` | Data | CSV toolkit (csvcut, csvgrep, csvjson, etc.) |
| `sqlite3` | Data | Lightweight SQL database |
| `csvtojson` | Data | CSV to JSON conversion |
| `json2csv` | Data | JSON to CSV conversion |
| `duckdb` | Data | OLAP SQL engine |
| `polars` | Data | Fast DataFrame library |
| `datasette` | Data | SQLite exploration UI |
| `pyarrow` | Data | Arrow columnar format |
| `openpyxl`, `xlrd`, `xlsxwriter` | Data | Excel read/write |
| `tabulate` | Data | Table formatting |
| `vercel` | CLI | Vercel deployment management |
| `surreal` | CLI | SurrealDB client |
| `playwright` | Testing | E2E browser automation |
| `sentry` | Observability | Error monitoring |
| `browserless` | Browser | Headless browser service |
| `figma` | Design | Design token access |

## Additional Free Tools Recommended for Phase #3

### Development & Testing

| Tool | Purpose | Install | Why |
|------|---------|---------|-----|
| `vitest` | Unit/integration testing | `npm install -D vitest` | Fast, compatible with TypeScript, Vite-native |
| `@playwright/test` | E2E testing | Already installed globally | Browser automation for E2E |
| `@modelcontextprotocol/inspector` | MCP debugging | `npx @modelcontextprotocol/inspector` | Interactive tool testing |
| `opossum` | Circuit breaker | `npm install opossum` | Node.js circuit breaker library |
| `p-limit` | Concurrency control | `npm install p-limit` | Promise concurrency limiter |

### Schema & Validation

| Tool | Purpose | Install | Why |
|------|---------|---------|-----|
| `zod` | Schema validation | `npm install zod` | TypeScript-first, runtime validation |
| `ajv` | JSON Schema validation | `npm install ajv` | Standard JSON Schema validator |
| `style-dictionary` | Design token transforms | `npm install -D style-dictionary` | Figma tokens → CSS/Tailwind |

### AI & LLM

| Tool | Purpose | Install | Why |
|------|---------|---------|-----|
| `ai` (Vercel AI SDK) | AI streaming, tools, agents | `npm install ai @ai-sdk/openai` | Streaming, tool calling, multi-turn |
| `@ai-sdk/openai` | OpenAI-compatible provider | `npm install @ai-sdk/openai` | DeepSeek, other OpenAI-compatible APIs |

### Scraping

| Tool | Purpose | Install | Why |
|------|---------|---------|-----|
| `cheerio` | HTML parsing | `npm install cheerio` | jQuery-like HTML traversal |
| `robotstxt-parser` | robots.txt parsing | `npm install robotstxt-parser` | RFC 9309 compliant parsing |
| `puppeteer-extra` + `puppeteer-extra-plugin-stealth` | Stealth enhancements | `npm install puppeteer-extra` | Only if Playwright stock evasions insufficient |

### Monitoring & Logging

| Tool | Purpose | Install | Why |
|------|---------|---------|-----|
| `pino` | Structured logging | `npm install pino` | Fast JSON logger |
| `@sentry/node` | Error monitoring | Already installed globally | Sentry SDK for Node.js |

### Documentation & CI

| Tool | Purpose | Install | Why |
|------|---------|---------|-----|
| `markdownlint` | Markdown linting | `npm install -D markdownlint-cli` | Consistent doc formatting |

## Tools NOT Recommended

| Tool | Reason |
|------|--------|
| `puppeteer` (standalone) | Playwright provides equivalent + better API |
| `axios` | `fetch` (Node 18+) is built-in |
| `moment` / `dayjs` | `Temporal` API available, or date-fns if needed |
| `lodash` (full) | Use native methods; install specific functions only if needed |

## Decision Criteria

When evaluating new tools:
1. **Existing MCP first**: Check if a connected MCP already solves the need
2. **Free and open-source**: Prefer MIT, Apache-2.0 licenses
3. **Active maintenance**: Package updated within last 6 months
4. **TypeScript support**: Native types or DefinitelyTyped
5. **Zero or minimal transitive dependencies**: Audit with `npm audit`
6. **Fits existing stack**: Node.js/TypeScript ecosystem
