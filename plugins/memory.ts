/**
 * memory.ts — Persistent memory plugin for OpenCode.
 *
 * Uses a local JSON store at ~/.opencode-memory.json for
 * fast, zero-dependency cross-session memory.
 *
 * Tools exposed:
 *   remember      — store a key/value with optional tags and category
 *   recall        — retrieve memories by key or keyword search
 *   forget        — delete a specific memory entry
 *   list_memories — list all stored memories (filtered by category/tag)
 *
 * SCHEMA NOTE: Only string/number/boolean arg types are used to stay
 * compatible with OpenCode's Zod v4 JSON-Schema converter.
 * Tags are passed as a comma-separated string.
 */

import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import * as fs from "fs"
import * as path from "path"

const MEMORY_FILE = path.join(process.env.HOME ?? "/root", ".opencode-memory.json")

interface MemoryEntry {
  key:       string
  value:     string
  category:  string
  tags:      string[]
  createdAt: string
  updatedAt: string
}

function loadMemory(): Record<string, MemoryEntry> {
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf-8"))
    }
  } catch {
    // corrupt file — start fresh
  }
  return {}
}

function saveMemory(store: Record<string, MemoryEntry>): void {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(store, null, 2), "utf-8")
}

function parseTags(tagsStr: string | undefined): string[] {
  if (!tagsStr || tagsStr.trim() === "") return []
  return tagsStr.split(",").map(t => t.trim()).filter(Boolean)
}

function scoreMatch(entry: MemoryEntry, query: string): number {
  const q = query.toLowerCase()
  let score = 0
  if (entry.key.toLowerCase().includes(q))      score += 4
  if (entry.value.toLowerCase().includes(q))    score += 3
  if (entry.category.toLowerCase().includes(q)) score += 2
  if (entry.tags.some(t => t.toLowerCase().includes(q))) score += 1
  return score
}

export const MemoryPlugin: Plugin = async () => {
  return {
    tool: {

      remember: tool({
        description:
          "Store information in persistent memory for recall in future sessions. " +
          "Use to remember project decisions, user preferences, important facts, " +
          "API endpoints, credential patterns, and any context worth preserving. " +
          "Tags should be a comma-separated string e.g. 'esg-hub, database, auth'.",
        args: {
          key:      tool.schema.string().describe("Unique key/name for this memory"),
          value:    tool.schema.string().describe("The information to store"),
          category: tool.schema.string().optional().describe(
            "Category: project, preference, decision, fact, credential_pattern, general"
          ),
          tags: tool.schema.string().optional().describe(
            "Comma-separated tags e.g. 'esg-hub, database, auth'"
          ),
        },
        async execute({ key, value, category = "general", tags }) {
          const store    = loadMemory()
          const now      = new Date().toISOString()
          const tagList  = parseTags(tags)
          const existing = store[key]
          store[key] = {
            key,
            value,
            category,
            tags: tagList,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
          }
          saveMemory(store)
          const action = existing ? "Updated" : "Stored"
          return `${action} memory: "${key}" [${category}]${tagList.length ? ` (${tagList.join(", ")})` : ""}`
        },
      }),

      recall: tool({
        description:
          "Retrieve stored memories by exact key or keyword search. " +
          "Returns the best matching entries sorted by relevance. " +
          "Use this before starting any task to check for relevant prior context.",
        args: {
          query:    tool.schema.string().describe("Exact key OR search keywords"),
          category: tool.schema.string().optional().describe("Filter by category"),
          tag:      tool.schema.string().optional().describe("Filter by a single tag"),
          limit:    tool.schema.number().optional().describe("Max results to return (default 5)"),
        },
        async execute({ query, category, tag, limit = 5 }) {
          const store   = loadMemory()
          const entries = Object.values(store)

          // Exact key match first
          if (store[query]) {
            const e = store[query]
            return `[${e.category}] **${e.key}**\n${e.value}\nTags: ${e.tags.join(", ") || "none"}\nUpdated: ${e.updatedAt}`
          }

          // Filter then rank
          let filtered = entries
          if (category) filtered = filtered.filter(e => e.category === category)
          if (tag)      filtered = filtered.filter(e => e.tags.includes(tag))

          const ranked = filtered
            .map(e => ({ entry: e, score: scoreMatch(e, query) }))
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)

          if (ranked.length === 0) {
            return `No memories found matching "${query}"`
          }

          return ranked
            .map(({ entry: e }) =>
              `[${e.category}] **${e.key}**\n${e.value}\nTags: ${e.tags.join(", ") || "none"}`
            )
            .join("\n\n---\n\n")
        },
      }),

      forget: tool({
        description: "Delete a specific memory entry by its exact key.",
        args: {
          key: tool.schema.string().describe("The exact key of the memory to delete"),
        },
        async execute({ key }) {
          const store = loadMemory()
          if (!store[key]) return `No memory found with key "${key}"`
          delete store[key]
          saveMemory(store)
          return `Deleted memory: "${key}"`
        },
      }),

      list_memories: tool({
        description:
          "List all stored memories. Optionally filter by category or tag. " +
          "Useful for reviewing stored context before starting a complex task.",
        args: {
          category: tool.schema.string().optional().describe(
            "Filter by category: project, preference, decision, fact, credential_pattern, general"
          ),
          tag: tool.schema.string().optional().describe("Filter by a single tag"),
        },
        async execute({ category, tag }) {
          const store   = loadMemory()
          let entries   = Object.values(store)
          if (category) entries = entries.filter(e => e.category === category)
          if (tag)      entries = entries.filter(e => e.tags.includes(tag))

          if (entries.length === 0) {
            return category || tag
              ? `No memories found for ${category ? `category="${category}"` : ""}${tag ? ` tag="${tag}"` : ""}`
              : "Memory store is empty."
          }

          // Group by category
          const grouped: Record<string, MemoryEntry[]> = {}
          for (const e of entries) {
            ;(grouped[e.category] ??= []).push(e)
          }

          return Object.entries(grouped)
            .map(([cat, items]) =>
              `**${cat.toUpperCase()}**\n` +
              items
                .map(e => `  • ${e.key} — ${e.value.slice(0, 80)}${e.value.length > 80 ? "…" : ""}`)
                .join("\n")
            )
            .join("\n\n")
        },
      }),

    },
  }
}
