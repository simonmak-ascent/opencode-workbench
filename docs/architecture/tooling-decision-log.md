# Tooling Decision Log

> Phase: #2 | Created: 2026-07-27
> Records all tooling decisions with rationale and alternatives considered.

## Existing Tooling (Pre-Phase Decisions)

### opencode CLI
- **Version**: 1.18.5
- **Rationale**: Required — this is the runtime environment
- **Alternatives**: Continue (VS Code), Cursor, GitHub Copilot Chat

### DeepSeek V4 Pro (via opencode)
- **Rationale**: Primary AI model — 1M context, strong reasoning, cost-effective
- **Alternatives**: Claude Sonnet 4.5 (via OpenRouter), GPT-5.5 (via OpenRouter), Gemini 2.5 Pro

---

## Phase #0-3 Tooling Decisions

### vitest (recommended)
- **Decision**: Use for unit and contract tests
- **Rationale**: Fast, TypeScript-native, compatible with MCP SDK testing
- **Alternatives**: Jest (heavier, slower), Mocha (less TypeScript integration)
- **Status**: Proposed — install in Phase #3

### zod (recommended)
- **Decision**: Use for all runtime schema validation
- **Rationale**: TypeScript-first, composable, used by AI SDK and MCP SDK
- **Alternatives**: yup, io-ts, ajv
- **Status**: Proposed — install in Phase #3

### cheerio (recommended)
- **Decision**: Use for HTML parsing in scraper
- **Rationale**: Lightweight jQuery-like API, well-maintained, fast
- **Alternatives**: jsdom (heavier), linkedom (limited compatibility)
- **Status**: Proposed — install in Phase #3

### opossum (recommended)
- **Decision**: Use for circuit breaker pattern
- **Rationale**: Production-grade, well-tested, Prometheus metrics, event system
- **Alternatives**: cockatiel (lighter), custom (more code to maintain)
- **Status**: Proposed — install in Phase #3

### p-limit (recommended)
- **Decision**: Use for concurrency control in scraper
- **Rationale**: Simple, well-tested, zero dependencies
- **Alternatives**: bottleneck (more features), async-sema (less maintained)
- **Status**: Proposed — install in Phase #3

### pino (recommended)
- **Decision**: Use for structured JSON logging
- **Rationale**: Fastest Node.js logger, JSON native, Sentry integration
- **Alternatives**: winston (heavier), bunyan (unmaintained), console.log (no structure)
- **Status**: Proposed — install in Phase #3

### @modelcontextprotocol/inspector (recommended)
- **Decision**: Use for MCP server interactive testing
- **Rationale**: Official MCP tool, interactive debugging
- **Alternatives**: Custom test harness (more work)
- **Status**: Already available via `npx`

### style-dictionary (recommended)
- **Decision**: Use for Figma token → CSS/Tailwind transformation
- **Rationale**: Industry standard, multi-platform output, version-controlled token pipeline
- **Alternatives**: Theo (abandoned), custom script (more code)
- **Status**: Proposed — install in Phase #3

### markdownlint-cli (recommended)
- **Decision**: Use for documentation formatting consistency
- **Rationale**: Enforces consistent Markdown, CI-friendly
- **Alternatives**: remark-lint (more configurable), prettier (covers Markdown)
- **Status**: Proposed — install in Phase #3

---

## Rejected Tooling

### Puppeteer (standalone)
- **Rejected because**: Playwright provides equivalent API + better locators, auto-wait, multi-browser support
- **Use Playwright instead**

### axios
- **Rejected because**: Node 18+ has native `fetch` — no need for additional HTTP client
- **Use fetch instead**

### moment / dayjs
- **Rejected because**: Temporal API available, date-fns is lighter if needed
- **Use date-fns if needed, otherwise Temporal**

### lodash (full)
- **Rejected because**: Native methods (Array.map, Object.entries, etc.) cover most use cases
- **Install individual lodash functions only if specifically needed**

### Express / Fastify
- **Rejected because**: Next.js Route Handlers and n8n webhooks cover API needs
- **No standalone API server needed in current architecture**
