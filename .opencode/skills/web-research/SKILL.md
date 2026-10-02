---
name: web-research
description: Conduct comprehensive web research using Brave Search, Google Search, and Perplexity in a systematic multi-source strategy to produce well-sourced findings
---

## When to Use
- Research tasks requiring current, real-world information
- Fact-checking and source verification
- Market research, competitor analysis, industry trends
- Any question requiring up-to-date web data

## Research Strategy (in order)

### Step 1 — Quick Fact-Finding
Use `brave-search` for fast real-time results:
- Best for: news, recent events, quick facts
- 2,000 free queries/month
- Tool: `brave_web_search`, `brave_local_search`

### Step 2 — Deep Extraction
Use `google-search` for comprehensive content:
- Best for: in-depth articles, official sources
- Tools: `google_search`, `deep_search`, `deep_search_news`

### Step 3 — Synthesized Answers
Use `perplexity` for AI-synthesized research:
- Best for: complex questions needing multi-source synthesis
- Tool: `perplexity_ask`, `perplexity_research`, `perplexity_reason`

### Step 4 — Code Examples
Use `gh_grep` for code patterns:
- Best for: how developers solve specific problems
- Tool: search GitHub codebases

## Recommended Pattern
```
1. brave_web_search("your query") — get 5-10 results
2. google deep_search on top 2-3 URLs for full content
3. perplexity_ask if synthesis needed
4. Cite all sources in output
```

## Output Format
Always include:
- Source URLs
- Date of information
- Confidence level (high/medium/low)
- Contradictions found across sources
