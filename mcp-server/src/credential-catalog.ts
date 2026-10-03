/**
 * Credential catalog — the *names* and acquisition guidance for every secret the
 * profile references. This module never holds, reads, or returns secret values;
 * it maps a variable name to a label, purpose, provider URL and an acquisition
 * method (paste / oauth / cli / instruction).
 */

export type AcquireMethod = "paste" | "oauth" | "cli" | "instruction";

export interface CredentialSpec {
  var: string;
  label: string;
  purpose: string;
  /** Direct URL to create/obtain the key, when one exists. */
  url?: string;
  method: AcquireMethod;
  /** Exact non-interactive command, when one exists. */
  command?: string;
  /** True when the value is optional (a subset of tools degrade without it). */
  optional?: boolean;
}

export const REQUIRED_CREDENTIALS: CredentialSpec[] = [
  {
    var: "DEEPSEEK_API_KEY",
    label: "DeepSeek API key",
    purpose: "Preferred primary model provider.",
    url: "https://platform.deepseek.com/api_keys",
    method: "paste",
  },
  {
    var: "OPENCODE_API_KEY",
    label: "OpenCode Zen API key",
    purpose: "Free model floor when no other provider key is present.",
    url: "https://opencode.ai/auth",
    method: "oauth",
    command: "opencode auth login",
  },
  {
    var: "BRAVE_API_KEY",
    label: "Brave Search API key",
    purpose: "brave-search MCP (fast web search).",
    url: "https://api.search.brave.com/app/keys",
    method: "paste",
  },
  {
    var: "PERPLEXITY_API_KEY",
    label: "Perplexity API key",
    purpose: "perplexity MCP (synthesised research).",
    url: "https://www.perplexity.ai/settings/api",
    method: "paste",
  },
  {
    var: "SENTRY_AUTH_TOKEN",
    label: "Sentry auth token",
    purpose: "sentry MCP (error monitoring).",
    url: "https://sentry.io/settings/account/api/auth-tokens/",
    method: "paste",
  },
  {
    var: "FIRECRAWL_API_KEY",
    label: "Firecrawl API key",
    purpose: "firecrawl MCP (site scraping/extraction).",
    url: "https://www.firecrawl.dev/app/api-keys",
    method: "paste",
  },
  {
    var: "EXA_API_KEY",
    label: "Exa API key",
    purpose: "exa MCP (semantic web search).",
    url: "https://dashboard.exa.ai/api-keys",
    method: "paste",
  },
  {
    var: "CLOUDFLARE_API_TOKEN",
    label: "Cloudflare API token",
    purpose: "cloudflare MCP.",
    url: "https://dash.cloudflare.com/profile/api-tokens",
    method: "instruction",
  },
  {
    var: "STRIPE_SECRET_KEY",
    label: "Stripe restricted key",
    purpose: "stripe MCP (billing).",
    url: "https://dashboard.stripe.com/apikeys",
    method: "instruction",
  },
  {
    var: "SIMONMAK_ASCENT_PAT",
    label: "GitHub personal access token",
    purpose: "github + shadcn MCP.",
    url: "https://github.com/settings/tokens",
    method: "cli",
    command: "gh auth login",
  },
  {
    var: "DATABASE_URL",
    label: "PostgreSQL connection string",
    purpose: "postgres MCP + memory database.",
    method: "instruction",
  },
  {
    var: "VERCEL_ACCESS_TOKEN",
    label: "Vercel access token",
    purpose: "vercel MCP (deployments).",
    url: "https://vercel.com/account/tokens",
    method: "oauth",
    command: "opencode mcp auth vercel",
  },
  {
    var: "AZURE_CLIENT_ID",
    label: "Azure app client id",
    purpose: "ms-365 MCP.",
    url: "https://portal.azure.com/",
    method: "instruction",
  },
  {
    var: "AZURE_CLIENT_SECRET",
    label: "Azure app client secret",
    purpose: "ms-365 MCP.",
    url: "https://portal.azure.com/",
    method: "instruction",
  },
  {
    var: "AZURE_TENANT_ID",
    label: "Azure tenant id",
    purpose: "ms-365 MCP.",
    url: "https://portal.azure.com/",
    method: "instruction",
  },
  {
    var: "GOOGLE_CLIENT_ID",
    label: "Google OAuth client id",
    purpose: "google-workspace MCP.",
    url: "https://console.cloud.google.com/apis/credentials",
    method: "instruction",
  },
  {
    var: "GOOGLE_CLIENT_SECRET",
    label: "Google OAuth client secret",
    purpose: "google-workspace MCP.",
    url: "https://console.cloud.google.com/apis/credentials",
    method: "instruction",
  },
  {
    var: "ALIBABA_CLOUD_ACCESS_KEY_ID",
    label: "Alibaba Cloud access key id",
    purpose: "alibaba-cloud-ops MCP.",
    url: "https://ram.console.aliyun.com/manage/ak",
    method: "instruction",
  },
  {
    var: "ALIBABA_CLOUD_ACCESS_KEY_SECRET",
    label: "Alibaba Cloud access key secret",
    purpose: "alibaba-cloud-ops MCP.",
    url: "https://ram.console.aliyun.com/manage/ak",
    method: "instruction",
  },
  {
    var: "FRED_API_KEY",
    label: "FRED API key",
    purpose: "primary-sources MCP: fred_series (optional).",
    url: "https://fredaccount.stlouisfed.org/apikeys",
    method: "paste",
    optional: true,
  },
  {
    var: "COMPANIES_HOUSE_API_KEY",
    label: "UK Companies House API key",
    purpose: "primary-sources MCP: companies_house_* (optional).",
    url: "https://developer.company-information.service.gov.uk/manage-account",
    method: "paste",
    optional: true,
  },
  {
    var: "RESEARCH_CONTACT",
    label: "Research contact string",
    purpose: "User-Agent contact for primary-source APIs (optional).",
    method: "paste",
    optional: true,
  },
];

export function credentialByVar(name: string): CredentialSpec | undefined {
  return REQUIRED_CREDENTIALS.find((c) => c.var === name);
}

export interface CredentialStatus extends CredentialSpec {
  present: boolean;
}

/** Classify a credential for a target given the set of present env var names. */
export function credentialStatus(spec: CredentialSpec, presentEnv: ReadonlySet<string>): CredentialStatus {
  return { ...spec, present: presentEnv.has(spec.var) };
}
