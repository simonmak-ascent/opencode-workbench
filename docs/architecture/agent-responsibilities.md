# Agent Responsibilities

> Phase: #2 | Created: 2026-07-27
> Defines all agents across the three workflow tracks.

## Track: AI-Enabled Web App

### ResearchAgent
- **Responsibility**: Gather and synthesize best practices for a given topic
- **Tools**: `perplexity`, `brave_search`, `context7`
- **Input**: `{ topic: string, depth: "shallow"|"deep" }`
- **Output**: `{ findings: Markdown, sources: URL[], confidence: 0-1 }`
- **Persistence**: SurrealDB table `research_cache`

### DesignAgent
- **Responsibility**: Convert Figma designs to Tailwind tokens and component code
- **Tools**: `figma`, `context7`
- **Input**: `{ component_spec: string, design_system: FigmaFileID }`
- **Output**: `{ tailwind_tokens: JSON, component_jsx: string }`
- **Persistence**: SurrealDB table `design_artifacts`

### PromptAgent
- **Responsibility**: Generate structured prompts for specific tasks
- **Tools**: `context7`, `github`
- **Input**: `{ scope: string, objective: string }`
- **Output**: `{ prompt_md: string, prompt_json: object }`
- **Persistence**: SurrealDB table `prompt_artifacts`

### ConfigAgent
- **Responsibility**: Generate project configurations (Next.js, Sentry, Clerk, etc.)
- **Tools**: `github`, `context7`
- **Input**: `{ target: string, requirements: string[] }`
- **Output**: `{ config_files: string[], config_summary: string }`
- **Persistence**: SurrealDB table `config_artifacts`

### ToolingAgent
- **Responsibility**: Research and recommend free tools for capability gaps
- **Tools**: `brave_search`, `context7`, `github`
- **Input**: `{ capability_gap: string }`
- **Output**: `{ proposed_tools: object[], install_steps: string[] }`
- **Persistence**: SurrealDB table `tooling_artifacts`

### BuildAgent
- **Responsibility**: Build and deploy preview to Vercel
- **Tools**: `github`, `vercel`, `sentry`
- **Input**: `{ component_jsx: string, route: string, env_vars: Record }`
- **Output**: `{ preview_url: string, commit_sha: string, sentry_dsn: string }`
- **Persistence**: SurrealDB table `build_artifacts`

### TestAgent
- **Responsibility**: Run E2E tests against preview deployment
- **Tools**: `playwright`, `sentry`
- **Input**: `{ preview_url: string, test_spec: string }`
- **Output**: `{ passed: boolean, report: string, errors: SentryEvent[] }`
- **Persistence**: SurrealDB table `test_results`

### DeployAgent
- **Responsibility**: Promote preview to production
- **Tools**: `vercel`, `github`, `sentry`
- **Input**: `{ preview_url: string, passed: boolean }`
- **Output**: `{ production_url: string, release_id: string }`
- **Persistence**: SurrealDB table `deployments`

---

## Track: MCP Server / Agent Skills

### SkillAuthorAgent
- **Responsibility**: Create MCP skill specifications and SKILL.md files
- **Tools**: `context7`, `github`
- **Input**: `{ skill_name: string, tool_calls: ToolDef[] }`
- **Output**: `{ mcp_skill_json: MCPSkillSpec, readme: string }`
- **Persistence**: SurrealDB table `mcp_skills`

### SkillValidatorAgent
- **Responsibility**: Validate MCP skills via contract tests
- **Tools**: `playwright`, `sentry`
- **Input**: `{ mcp_skill_json: MCPSkillSpec }`
- **Output**: `{ valid: boolean, errors: string[], contract_test_results: string }`
- **Persistence**: SurrealDB table `mcp_validations`

### SkillPublisherAgent
- **Responsibility**: Publish validated skills to GitHub releases and register n8n webhooks
- **Tools**: `github`, `n8n`, `sentry`
- **Input**: `{ mcp_skill_json: MCPSkillSpec, valid: boolean }`
- **Output**: `{ github_release: string, n8n_webhook_registered: boolean }`
- **Persistence**: SurrealDB table `mcp_releases`

---

## Track: Web Scraper

### ScrapeConfigAgent
- **Responsibility**: Research target sites and generate scraping configurations
- **Tools**: `perplexity`, `brave_search`
- **Input**: `{ target_url: string, extraction_schema: JSONSchema }`
- **Output**: `{ selector_map: Record, rate_limit: number, stealth_config: JSON }`
- **Persistence**: SurrealDB table `scrape_configs`

### ScrapeExecutorAgent
- **Responsibility**: Execute scraping jobs via Playwright/Browserless
- **Tools**: `playwright`, `browserless`
- **Input**: `{ scrape_config: ScrapeConfig, target_url: string }`
- **Output**: `{ raw_html: string, extracted_data: JSON, screenshot_url: string }`
- **Persistence**: SurrealDB table `scrape_results`

### ScrapeStorageAgent
- **Responsibility**: Persist extracted data to SurrealDB and detect changes
- **Tools**: `surrealdb`, `n8n`
- **Input**: `{ extracted_data: JSON, schema: JSONSchema }`
- **Output**: `{ record_ids: string[], change_detected: boolean }`
- **Persistence**: SurrealDB table `scraped_records`

### ScrapeAlertAgent
- **Responsibility**: Send alerts via n8n when changes are detected
- **Tools**: `n8n`, `sentry`
- **Input**: `{ change_detected: boolean, diff: string }`
- **Output**: `{ alert_sent: boolean, webhook_response: JSON }`
- **Persistence**: SurrealDB table `scrape_alerts`

---

## Cross-Cutting Principles

1. **One responsibility per agent** — if an agent does two things, split it
2. **Structured input/output** — every agent uses typed JSON interfaces
3. **Idempotency** — every agent checks prior results by input hash before executing
4. **Shared memory** — SurrealDB is the persistent state store; agents never pass state through long chains
5. **Observability** — every agent emits Sentry traces with `agent_name` and `phase` tags
6. **Supervisor owns routing** — workers return results, never decide global flow
