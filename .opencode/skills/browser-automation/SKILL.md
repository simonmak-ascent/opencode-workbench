---
name: browser-automation
description: Automate web browsers for scraping, interaction, form filling, and E2E testing using Playwright for standard tasks and Browserless for heavy headless operations
---

## When to Use
- Web scraping dynamic JavaScript-rendered pages
- Automating web form submissions
- E2E testing web applications
- Taking screenshots of web pages
- Downloading files from web interfaces

## Tool Selection Guide

### Use `playwright` MCP for:
- Standard web navigation and interaction
- E2E test verification
- Page screenshots
- Form filling and clicking
- Pages accessible without anti-bot measures

### Use `browserless` MCP for:
- Heavy scraping with anti-detection
- PDF generation from URLs
- Lighthouse performance audits
- Multiple concurrent sessions
- Sites with bot detection

## Browserless Connection
- Host: localhost:3000 (SWAS runtime — browserless runs on the SWAS box)
- Token: [ENV:BROWSERLESS_TOKEN was redacted]
- Protocol: http
- Note: The browserless-mcp package has a known bug with MCP protocol response formatting. Use `playwright` MCP for screenshots and scraping as a workaround.

## ESG Hub MCP
- Endpoint: https://esg-hub.ascent.partners
- Note: Some endpoints may return internal errors (e.g., search). Use list_esg_pages and get_esg_page for reliable access.

## Common Playwright Patterns
```
# Navigate and extract
playwright_navigate(url)
playwright_snapshot()     # Get accessible DOM
playwright_click(ref)
playwright_type(ref, text)
playwright_screenshot()

# Forms
playwright_fill_form(fields)
playwright_select_option(ref, values)
```

## Browserless Patterns
```
# Initialize connection first
browserless_initialize({
  host: "localhost", port: 3000,
  token: "browserless-local-token", protocol: "http"
})

# Then use browser operations
```

## Anti-Detection Note
Browserless has built-in stealth mode. Use it when:
- Playwright gets blocked
- Site shows CAPTCHA
- Need to scrape rate-limited sites
