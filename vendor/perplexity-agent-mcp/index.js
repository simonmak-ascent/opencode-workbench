import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const API_URL = 'https://api.perplexity.ai/v1/agent';
const API_KEY = process.env.PERPLEXITY_API_KEY;
const TIMEOUT_MS = Number(process.env.PERPLEXITY_TIMEOUT_MS || 570000);

if (!API_KEY) {
  console.error('PERPLEXITY_API_KEY environment variable is required');
  process.exit(1);
}

const PRESETS = ['fast', 'low', 'medium', 'high', 'xhigh', 'wide-research'];
const CONTEXT_SIZE_TO_PRESET = { low: 'fast', medium: 'low', high: 'medium' };

function messagesToInput(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages array is required');
  }
  if (messages.length === 1) return messages[0].content;
  return messages.map((m) => {
    const type = m.role === 'assistant' ? 'output_text' : 'input_text';
    return { role: m.role, content: [{ type, text: m.content }] };
  });
}

function buildWebSearchTool(args) {
  const tool = { type: 'web_search' };
  if (args.max_results != null) tool.max_results = args.max_results;
  if (args.max_tokens_per_page != null) tool.max_tokens_per_page = args.max_tokens_per_page;
  const filters = {};
  if (Array.isArray(args.search_domain_filter) && args.search_domain_filter.length > 0) {
    filters.search_domain_filter = args.search_domain_filter;
  }
  if (args.search_recency_filter) filters.search_recency_filter = args.search_recency_filter;
  if (Object.keys(filters).length > 0) tool.filters = filters;
  return tool;
}

async function callAgentApi({ preset, model, input, instructions, tools, reasoning, max_steps, max_output_tokens }) {
  const body = { input };
  if (preset) body.preset = preset;
  if (model) body.model = model;
  if (instructions) body.instructions = instructions;
  if (tools) body.tools = tools;
  if (reasoning) body.reasoning = reasoning;
  if (max_steps != null) body.max_steps = max_steps;
  if (max_output_tokens != null) body.max_output_tokens = max_output_tokens;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Agent API error ${response.status}: ${text}`);
  }
  return response.json();
}

function formatResponse(data) {
  const output = Array.isArray(data.output) ? data.output : [];
  const textParts = [];
  const citations = [];
  let seen = 0;
  for (const item of output) {
    if (item.type === 'message' && Array.isArray(item.content)) {
      for (const c of item.content) {
        if ((c.type === 'output_text' || c.type === 'text') && c.text) textParts.push(c.text);
      }
    } else if (item.type === 'search_results' && Array.isArray(item.results)) {
      for (const r of item.results) {
        seen += 1;
        const line = `[${seen}] ${r.title || 'Untitled'} — ${r.url || ''}${r.date ? ` (${r.date})` : ''}`;
        citations.push(line);
      }
    }
  }
  const sections = [];
  sections.push(textParts.join('\n\n') || '(no text output)');
  if (citations.length > 0) sections.push(`Sources:\n${citations.join('\n')}`);
  if (data.usage) {
    const cost = data.usage.cost?.total_cost;
    const tokens = data.usage.total_tokens;
    const meta = [`model: ${data.model || 'unknown'}`, `tokens: ${tokens}`];
    if (cost != null) meta.push(`cost: $${Number(cost).toFixed(5)}`);
    sections.push(meta.join(' | '));
  }
  return sections.join('\n\n');
}

function ok(text) {
  return { content: [{ type: 'text', text }] };
}

function fail(err) {
  return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
}

const searchProps = {
  max_results: { type: 'number', description: 'Maximum number of results to return (default: 10)' },
  max_tokens_per_page: { type: 'number', description: 'Maximum tokens to extract per webpage (default: 1024)' },
  search_domain_filter: {
    type: 'array', items: { type: 'string' },
    description: "Restrict search results to specific domains (e.g., ['wikipedia.org']). Use '-' prefix for exclusion.",
  },
  search_recency_filter: {
    type: 'string', enum: ['hour', 'day', 'week', 'month', 'year'],
    description: 'Filter search results by recency',
  },
};

const messagesProp = {
  messages: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        role: { type: 'string', enum: ['system', 'user', 'assistant'] },
        content: { type: 'string' },
      },
      required: ['role', 'content'],
    },
    description: 'Array of conversation messages',
  },
};

const TOOLS = [
  {
    name: 'perplexity_search',
    description: 'Search the web and return a ranked list of results with titles, URLs, snippets, and dates. Best for: finding specific URLs, checking recent news, verifying facts, discovering sources. No AI synthesis. For AI-generated answers with citations, use perplexity_ask instead.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query string' },
        country: { type: 'string', description: "ISO 3166-1 alpha-2 country code for regional results (e.g., 'US', 'GB')" },
        ...searchProps,
      },
      required: ['query'],
    },
  },
  {
    name: 'perplexity_ask',
    description: "Answer a question using web-grounded AI. Best for: quick factual questions, summaries, explanations, and general Q&A. Returns a text response with citations. Supports filtering by recency (hour/day/week/month/year), domain restrictions, and search context size. For in-depth multi-source research, use perplexity_research instead. For step-by-step reasoning and analysis, use perplexity_reason instead.",
    inputSchema: {
      type: 'object',
      properties: {
        ...messagesProp,
        search_context_size: {
          type: 'string', enum: ['low', 'medium', 'high'],
          description: "Controls how much web context is retrieved. 'low' (default) is fastest, 'high' provides more comprehensive results.",
        },
        preset: { type: 'string', enum: PRESETS, description: 'Agent API preset override (takes precedence over search_context_size)' },
        model: { type: 'string', description: "Model override (e.g., 'openai/gpt-5.6-sol', 'anthropic/claude-sonnet-4-6')" },
        ...searchProps,
      },
      required: ['messages'],
    },
  },
  {
    name: 'perplexity_reason',
    description: 'Analyze a question using step-by-step reasoning with web grounding. Best for: math, logic, comparisons, complex arguments, and tasks requiring chain-of-thought. Returns a reasoned response with citations. Supports filtering by recency, domain restrictions, and search context size. For quick factual questions, use perplexity_ask instead. For comprehensive multi-source research, use perplexity_research instead.',
    inputSchema: {
      type: 'object',
      properties: {
        ...messagesProp,
        search_context_size: {
          type: 'string', enum: ['low', 'medium', 'high'],
          description: "Controls how much web context is retrieved. 'low' (default) is fastest, 'high' provides more comprehensive results.",
        },
        reasoning_effort: {
          type: 'string', enum: ['minimal', 'low', 'medium', 'high', 'xhigh', 'max'],
          description: "Reasoning effort override (default: 'high')",
        },
        model: { type: 'string', description: 'Model override' },
        strip_thinking: { type: 'boolean', description: 'Accepted for compatibility; reasoning traces are never included in output' },
        ...searchProps,
      },
      required: ['messages'],
    },
  },
  {
    name: 'perplexity_research',
    description: 'Conduct deep, multi-source research on a topic. Best for: literature reviews, comprehensive overviews, investigative queries needing many sources. Returns a detailed response with citations. Significantly slower than other tools (30+ seconds). For quick factual questions, use perplexity_ask instead. For logical analysis and reasoning, use perplexity_reason instead.',
    inputSchema: {
      type: 'object',
      properties: {
        ...messagesProp,
        reasoning_effort: {
          type: 'string', enum: ['minimal', 'low', 'medium', 'high', 'xhigh', 'max'],
          description: 'Controls depth of deep research reasoning. Higher values produce more thorough analysis.',
        },
        preset: { type: 'string', enum: PRESETS, description: "Agent API preset override (default: 'high')" },
        model: { type: 'string', description: 'Model override' },
        strip_thinking: { type: 'boolean', description: 'Accepted for compatibility; reasoning traces are never included in output' },
      },
      required: ['messages'],
    },
  },
];

async function handleSearch(args) {
  const tools = [buildWebSearchTool(args)];
  if (args.country) tools[0].filters = { ...(tools[0].filters || {}), country: args.country };
  const data = await callAgentApi({
    preset: 'fast',
    input: `Return only the ranked list of search results for this query, no synthesized answer: ${args.query}`,
    tools,
    max_steps: 1,
  });
  const output = Array.isArray(data.output) ? data.output : [];
  const sr = output.find((i) => i.type === 'search_results');
  if (!sr || !Array.isArray(sr.results) || sr.results.length === 0) {
    return ok(formatResponse(data));
  }
  const lines = sr.results.map((r, i) => `${i + 1}. ${r.title || 'Untitled'}\n   URL: ${r.url || ''}\n   ${r.snippet ? `Snippet: ${r.snippet}\n   ` : ''}Date: ${r.date || 'unknown'}`);
  return ok(lines.join('\n\n'));
}

async function handleAsk(args) {
  const preset = args.preset || CONTEXT_SIZE_TO_PRESET[args.search_context_size || 'low'];
  const data = await callAgentApi({
    preset,
    model: args.model,
    input: messagesToInput(args.messages),
    tools: [buildWebSearchTool(args)],
  });
  return ok(formatResponse(data));
}

async function handleReason(args) {
  const preset = CONTEXT_SIZE_TO_PRESET[args.search_context_size || 'high'];
  const data = await callAgentApi({
    preset,
    model: args.model,
    input: messagesToInput(args.messages),
    tools: [buildWebSearchTool(args)],
    reasoning: { effort: args.reasoning_effort || 'high' },
  });
  return ok(formatResponse(data));
}

async function handleResearch(args) {
  const data = await callAgentApi({
    preset: args.preset || 'high',
    model: args.model,
    input: messagesToInput(args.messages),
    reasoning: args.reasoning_effort ? { effort: args.reasoning_effort } : undefined,
    max_output_tokens: 128000,
  });
  return ok(formatResponse(data));
}

const server = new Server({ name: 'perplexity-agent-mcp', version: '1.0.0' });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  try {
    switch (name) {
      case 'perplexity_search': return await handleSearch(args);
      case 'perplexity_ask': return await handleAsk(args);
      case 'perplexity_reason': return await handleReason(args);
      case 'perplexity_research': return await handleResearch(args);
      default: throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return fail(err);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
