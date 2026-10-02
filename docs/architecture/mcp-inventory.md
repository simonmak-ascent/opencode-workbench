# MCP Server Inventory

> Generated: 2026-10-02T16:59:03Z
> Source: `opencode.json` (single source of truth)

| Server | Type | Enabled | Auth env | Entry |
|--------|------|---------|----------|-------|
| alibaba-cloud-ops | local | yes | ALIBABA_CLOUD_ACCESS_KEY_ID, ALIBABA_CLOUD_ACCESS_KEY_SECRET | `uvx alibaba-cloud-ops-mcp-server@latest` |
| arxiv | local | yes | — | `uvx arxiv-mcp-server` |
| brave-search | local | yes | BRAVE_API_KEY | `node /home/node/.npm-global/lib/node_modules/@modelcontextprotocol/server-brave-search/dist/index.js` |
| browser-mcp | local | yes | — | `node /home/node/.local/bin/browser-mcp/browser-mcp-server-v2.js` |
| browserless | local | yes | BROWSERLESS_TOKEN | `node /home/node/.local/bin/browserless-mcp/dist/index.js` |
| clerk | remote | yes | — | `https://mcp.clerk.com/mcp` |
| cloudflare | remote | yes | CLOUDFLARE_API_TOKEN | `https://mcp.cloudflare.com/mcp` |
| context7 | remote | yes | — | `https://mcp.context7.com/mcp` |
| design-system | local | yes | — | `node /home/node/.npm-global/lib/node_modules/mcp-design-system-extractor/dist/index.js` |
| designlang | local | yes | — | `npx -y designlang mcp --output-dir /home/node/design-extract-output` |
| difflens | local | yes | — | `npx -y difflens-cli` |
| echarts | local | yes | — | `node /home/node/.npm-global/lib/node_modules/mcp-echarts/build/index.js` |
| esg-hub | local | yes | — | `node /workspaces/esg-hub/mcp-server/dist/index.js` |
| exa | remote | yes | EXA_API_KEY | `https://mcp.exa.ai/mcp?tools=web_search_exa,web_fetch_exa,web_search_advanced_exa` |
| firecrawl | local | yes | FIRECRAWL_API_KEY | `npx -y firecrawl-mcp@3.25.5` |
| gh_grep | remote | yes | — | `https://mcp.grep.app` |
| github | local | yes | SIMONPLMAK_CLOUD_PAT | `/home/node/.local/bin/github-mcp-server stdio` |
| google-search | local | no | GOOGLE_API_KEY, GOOGLE_CSE_ID | `node /home/node/.npm-global/lib/node_modules/@adenot/mcp-google-search/build/index.js` |
| google-workspace | local | no | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET | `docker run -i --rm -v /home/node/.mcp/google-workspace-mcp:/app/config -e GOOGLE_CLIENT_ID={env:GOOGLE_CLIENT_ID} -e GOOGLE_CLIENT_SECRET={env:GOOGLE_CLIENT_SECRET} -e LOG_MODE=strict ghcr.io/aaronsb/google-workspace-mcp:latest` |
| humanity4ai | local | yes | — | `node /workspaces/project_human/mcp-servers/dist/mcp-server.js` |
| mermaid | local | yes | — | `node /home/node/.npm-global/lib/node_modules/mcp-mermaid/build/index.js` |
| ms-365 | local | yes | AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID | `npx @softeria/ms-365-mcp-server` |
| paper-search | local | yes | — | `uvx --with mcp==1.9.4 paper-search-mcp` |
| perplexity | local | yes | PERPLEXITY_API_KEY | `node /home/node/.local/bin/perplexity-agent-mcp/index.js` |
| playwright | local | yes | — | `node /home/node/.npm-global/lib/node_modules/@playwright/mcp/cli.js` |
| postgres | local | yes | DATABASE_URL | `node /home/node/.local/bin/postgres-mcp-shim.mjs` |
| primary-sources | local | yes | COMPANIES_HOUSE_API_KEY, FRED_API_KEY, RESEARCH_CONTACT | `npx -y @simonmak-ascent/primary-sources-mcp@1.0.0` |
| saga | local | yes | — | `node /home/node/.npm-global/lib/node_modules/saga-mcp/dist/index.js` |
| sentry | remote | yes | SENTRY_AUTH_TOKEN | `https://mcp.sentry.dev/mcp` |
| shadcn | local | yes | SIMONPLMAK_CLOUD_PAT | `node /home/node/.npm-global/lib/node_modules/@jpisnice/shadcn-ui-mcp-server/build/index.js` |
| stripe | remote | yes | STRIPE_SECRET_KEY | `https://mcp.stripe.com` |
| surrealdb | local | yes | SURREAL_DATABASE, SURREAL_NAMESPACE, SURREAL_PASSWORD, SURREAL_TOKEN, SURREAL_URL, SURREAL_USERNAME | `node /home/node/.local/bin/surreal-mcp-shim.mjs` |
| swagger-testcase | local | yes | — | `node /home/node/.npm-global/lib/node_modules/swagger-testcase-mcp/dist/index.js` |
| vdd | remote | yes | — | `https://vdd.simonmak.com/api/mcp` |
| vercel | remote | yes | VERCEL_ACCESS_TOKEN | `https://mcp.vercel.com` |

Total: 35 · enabled: 33
