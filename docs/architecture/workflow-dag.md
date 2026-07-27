# Workflow DAG

> Phase: #2 | Created: 2026-07-27
> Directed acyclic graph of all agents and their dependencies.

## Three Parallel Tracks

### Track 1: AI-Enabled Web App

```
User: "Build AI Web App" → Supervisor → ResearchAgent → DesignAgent →
  PromptAgent → ConfigAgent → BuildAgent → TestAgent → DeployAgent → Production
                                                  ↑
                                         ToolingAgent
```

**Dependencies**:
- ResearchAgent: none
- DesignAgent: ResearchAgent output (design system best practices)
- PromptAgent: DesignAgent output (component specs → prompt scope)
- ConfigAgent: PromptAgent output (prompt config → env/config requirements)
- ToolingAgent: ConfigAgent output (capability gaps → tool search)
- BuildAgent: ConfigAgent + ToolingAgent output
- TestAgent: BuildAgent output (preview_url)
- DeployAgent: TestAgent output (passed + report)

### Track 2: MCP Server / Agent Skills

```
User: "Create MCP Skill" → Supervisor → SkillAuthorAgent → SkillValidatorAgent → SkillPublisherAgent → Release
```

**Dependencies**:
- SkillAuthorAgent: none
- SkillValidatorAgent: SkillAuthorAgent output (spec to validate)
- SkillPublisherAgent: SkillValidatorAgent output (must pass validation)

### Track 3: Web Scraper

```
User: "Configure Scraper" → Supervisor → ScrapeConfigAgent → ScrapeExecutorAgent →
  ScrapeStorageAgent → ScrapeAlertAgent → Alert
```

**Dependencies**:
- ScrapeConfigAgent: none
- ScrapeExecutorAgent: ScrapeConfigAgent output (selector map, rate limits)
- ScrapeStorageAgent: ScrapeExecutorAgent output (extracted data)
- ScrapeAlertAgent: ScrapeStorageAgent output (change_detected + diff)

## Supervisor Decision Matrix

| User Input | Track | First Agent |
|-----------|-------|------------|
| "build a chat app" / "create AI features" | Web App | ResearchAgent |
| "create an MCP server" / "write a skill" | MCP Skills | SkillAuthorAgent |
| "scrape a website" / "monitor changes" | Web Scraper | ScrapeConfigAgent |
| "deploy to production" | Web App (resume) | DeployAgent |
| "test the preview" | Web App (resume) | TestAgent |

## State Transitions

Every agent produces a state transition in SurrealDB:

```json
{
  "taskId": "task-01K0...",
  "agentName": "ResearchAgent",
  "phase": "research",
  "status": "completed" | "failed" | "needs_review",
  "inputHash": "sha256-of-input",
  "outputRef": "artifact-987",
  "startedAt": "2026-07-27T10:00:00Z",
  "completedAt": "2026-07-27T10:02:30Z",
  "retryAttempt": 0,
  "errors": []
}
```

## Idempotency

Before executing, every agent queries:
```sql
SELECT * FROM task_state
WHERE agent_name = $agentName
  AND input_hash = $inputHash
  AND status = "completed"
LIMIT 1;
```

Cache hit → return cached output.
Cache miss → execute → persist result.

## Parallelism

- **Within a track**: sequential (each depends on prior output)
- **Across tracks**: fully parallel (tracks are independent)
- **Supervisor**: dispatches all three tracks simultaneously when all are requested

## Failure Modes

| Failure | Behavior |
|---------|----------|
| Agent error (retryable) | Retry up to 3× with exponential backoff |
| Agent error (permanent) | Mark task failed, notify supervisor |
| Tool timeout | Retry once, then fail |
| Missing dependency | Block agent, queue pending task |
| Validation failure | Return to previous agent with error details |
| Circuit open (external API) | Wait for reset timeout, retry once |
