# Restart & Recovery

> Phase: #2 | Created: 2026-07-27
> How the workflow resumes after any system restart, crash, or rebuild.

## State Persistence

All workflow state is stored in SurrealDB tables:

| Table | What it stores | Recovery use |
|-------|---------------|-------------|
| `task_state` | Per-agent status, input hash, output ref, timestamps | Checkpoint — what's been done |
| `research_cache` | ResearchAgent cached findings | Skip repeated research |
| `design_artifacts` | DesignAgent output (tokens, components) | Reuse generated design |
| `build_artifacts` | BuildAgent output (preview URLs, commits) | Resume from built state |
| `test_results` | TestAgent output (pass/fail, reports) | Skip passed tests |
| `deployments` | DeployAgent output (production URLs) | Verify deployed state |
| `mcp_skills` | SkillAuthorAgent output | Reuse skill specs |
| `mcp_validations` | SkillValidatorAgent output | Skip validated skills |
| `mcp_releases` | SkillPublisherAgent output | Check published status |
| `scrape_configs` | ScrapeConfigAgent output | Reuse scraper configs |
| `scrape_results` | ScrapeExecutorAgent output | Skip completed scrapes |
| `scraped_records` | ScrapeStorageAgent output | Skip persisted records |
| `scrape_alerts` | ScrapeAlertAgent output | Check if alerts sent |
| `operations` | Idempotency ledger | Deduplicate all side effects |

## Resumption Protocol

On every session start:

1. **Read WORKFLOW_STATE.md** — get current phase, task ID, and last completed agent
2. **Load task chain from SurrealDB**:
   ```sql
   SELECT * FROM task_state WHERE correlationId = $correlationId ORDER BY completedAt DESC
   ```
3. **For each track**:
   - Find the last agent with `status = "completed"`
   - The next agent in the DAG is the next step
   - Skip any agent whose `inputHash` already has a completed result
4. **Resume** from the incomplete agent
5. **Re-verify** env vars, MCP availability, external service health

## Startup Checklist

```bash
# 1. Verify Docker containers
docker ps | grep -E "pg-memory|browserless"

# 2. Verify SurrealDB connection
surreal sql --conn http://localhost:8000 --user opencode --pass opencode --ns workbench --db workflow \
  "SELECT count() FROM task_state;"

# 3. Verify MCP servers
opencode --check-mcp  # or equivalent

# 4. Read checkpoint
head -20 WORKFLOW_STATE.md

# 5. Resume
opencode  # loads SYSTEM_PROMPT.md, reads WORKFLOW_STATE.md, resumes
```

## Recovery from Failure States

| Scenario | Recovery Action |
|----------|----------------|
| Agent timed out | Check `startedAt` — if > deadline, mark failed, increment retry count |
| Agent crashed mid-execution | Task remains `pending` — supervisor re-dispatches |
| External API down | Circuit breaker open — supervisor polls `/pressure` or waits `resetTimeout` |
| SurrealDB unavailable | Wait for Docker container restart; retry with backoff |
| Missing env var | Fail immediately with descriptive error; do not retry |
| Corrupted artifact | Re-execute the agent that produced it (idempotent by input hash) |
| Codespace deleted | Full rebuild from repo + secrets → setup.sh → resume from WORKFLOW_STATE.md |

## Restoration from Scratch

If SurrealDB state is lost along with the codespace:

1. Recreate codespace: `gh codespace create --repo ... --machine basicLinux32gb`
2. Setup runs automatically (3-5 min)
3. Manual steps: `npx playwright install chrome`, `opencode mcp auth vercel`
4. Read WORKFLOW_STATE.md to determine last phase
5. Re-execute from the beginning of the current phase (idempotent agents will skip completed work)
6. All agent outputs are reproducible from inputs — no unique non-reproducible state

## Data Durability

| Data | Storage | Survives Codespace Delete? |
|------|---------|---------------------------|
| Code | GitHub repo | YES |
| WORKFLOW_STATE.md | GitHub repo | YES |
| Configs | GitHub repo | YES |
| Agent state | SurrealDB (Docker volume) | NO — must be rebuilt |
| Artifacts | Object store (recommended external) | Depends on provider |
| Research cache | SurrealDB | NO — can be regenerated |
| Build previews | Vercel (external) | YES |
| Deployment history | Vercel (external) | YES |
| Sentry data | Sentry (external) | YES |

**Critical**: Core workflow state must be reconstructible from repo files alone. SurrealDB adds speed and cache convenience but must not be the only source of truth.
