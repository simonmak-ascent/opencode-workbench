---
name: memory-usage
description: Store and retrieve information across OpenCode sessions using the persistent memory plugin — remember project decisions, preferences, facts, and context
---

## When to Use
- Remembering important project decisions for future sessions
- Storing user preferences that should persist
- Saving API patterns, architecture decisions, or credentials patterns
- Recalling context from previous conversations
- Building up knowledge about a project over time

## Memory File
Stored at: `~/.opencode-memory.json`
Zero dependencies — pure JSON, always available.

## Available Tools

### `remember` — Store a memory
```
remember(
  key: "surreal-db-schema",
  value: "The main table is 'reports', namespace is 'esg_hub'...",
  category: "project",
  tags: ["esg-hub", "database", "surrealdb"]
)
```

### `recall` — Retrieve a memory
```
recall(query: "surreal-db-schema")     # exact key lookup
recall(query: "database")              # keyword search
recall(query: "auth", category: "project", limit: 5)
```

### `list_memories` — Browse all memories
```
list_memories()                        # all memories
list_memories(category: "project")    # by category
list_memories(tag: "esg-hub")         # by tag
```

### `forget` — Delete a memory
```
forget(key: "old-key")
```

## Categories to Use
| Category | For |
|----------|-----|
| `project` | Project-specific decisions and config |
| `preference` | User preferences and style choices |
| `decision` | Architecture and design decisions |
| `fact` | Facts, data, research findings |
| `credential_pattern` | Patterns for accessing services (not passwords) |
| `general` | Anything else |

## When to Remember
Proactively store:
- Any architecture decision made
- Database schema details
- API endpoint patterns
- User-stated preferences
- Important facts discovered during research
- Project structure insights
