import { describe, it, expect } from "vitest";
import { renderOpencodeConfig, OPTIONAL_MCP_IDS, type RenderContext } from "../src/render";
import { requiredEnvVars, authMethod, assessMcp } from "../src/mcp-auth";

const base: Record<string, unknown> = {
  model: "deepseek/deepseek-v4-pro",
  small_model: "deepseek/deepseek-v4-flash",
  mcp: {
    context7: { type: "remote", url: "https://mcp.context7.com/mcp" },
    vdd: { type: "remote", url: "https://vdd.simonmak.com/api/mcp", oauth: false },
    perplexity: {
      type: "local",
      command: ["node", "/home/node/.local/bin/perplexity-agent-mcp/index.js"],
      environment: { PERPLEXITY_API_KEY: "{env:PERPLEXITY_API_KEY}" },
    },
    postgres: {
      type: "local",
      command: ["node", "/home/node/.local/bin/postgres-mcp-shim.mjs"],
      environment: { DATABASE_URL: "{env:DATABASE_URL}" },
    },
  },
};

const ctx: RenderContext = { home: "/home/u", workspace: "/srv/wb", npmModules: "/usr/lib/node_modules" };

describe("model selection (Zen floor)", () => {
  it("prefers deepseek when its key is present", () => {
    const r = renderOpencodeConfig(base, { ...ctx, presentEnv: new Set(["DEEPSEEK_API_KEY"]) });
    expect(r.model).toBe("deepseek/deepseek-v4-pro");
    expect(r.providerMode).toBe("deepseek");
  });

  it("falls back to the opencode zen free floor", () => {
    const r = renderOpencodeConfig(base, { ...ctx, presentEnv: new Set(["OPENCODE_API_KEY"]) });
    expect(r.model).toBe("zen/zen-medium");
    expect(r.providerMode).toBe("zen");
  });

  it("reports degraded when no model key is present", () => {
    const r = renderOpencodeConfig(base, { ...ctx, presentEnv: new Set() });
    expect(r.providerMode).toBe("degraded");
  });
});

describe("mcp degradation", () => {
  it("disables keyed servers whose credentials are missing", () => {
    const r = renderOpencodeConfig(base, { ...ctx, presentEnv: new Set() });
    const mcp = r.config.mcp as Record<string, Record<string, unknown>>;
    expect(mcp.perplexity?.enabled).toBe(false);
    expect(r.degraded.map((d) => d.id)).toContain("perplexity");
  });

  it("keeps keyless servers untouched", () => {
    const r = renderOpencodeConfig(base, { ...ctx, presentEnv: new Set() });
    expect(r.degraded.map((d) => d.id)).not.toContain("context7");
  });

  it("no longer treats vdd as an optional add-on", () => {
    expect(OPTIONAL_MCP_IDS as readonly string[]).not.toContain("vdd");
    const r = renderOpencodeConfig(base, { ...ctx, presentEnv: new Set(["OPENCODE_API_KEY"]) });
    expect(r.removedMcp).not.toContain("vdd");
  });

  it("disables a keyed server only when its env is absent", () => {
    const r = renderOpencodeConfig(base, { ...ctx, presentEnv: new Set(["PERPLEXITY_API_KEY"]) });
    const mcp = r.config.mcp as Record<string, Record<string, unknown>>;
    expect(mcp.perplexity?.enabled).toBeUndefined();
    expect(mcp.postgres?.enabled).toBe(false);
  });
});

describe("mcp-auth classification", () => {
  it("extracts env placeholders without values", () => {
    expect(requiredEnvVars(base.mcp.perplexity)).toEqual(["PERPLEXITY_API_KEY"]);
  });

  it("classifies auth methods", () => {
    expect(authMethod(base.mcp.vdd as Record<string, unknown>)).toBe("key"); // oauth:false
    expect(authMethod({ type: "remote", url: "x" } as Record<string, unknown>)).toBe("oauth");
    expect(authMethod({ type: "local", command: ["x"] } as Record<string, unknown>)).toBe("none");
  });

  it("does not degrade on optional env vars", () => {
    const h = assessMcp(
      "primary-sources",
      { type: "local", environment: { RESEARCH_CONTACT: "{env:RESEARCH_CONTACT}" } } as Record<string, unknown>,
      new Set(),
    );
    expect(h.degraded).toBe(false);
  });
});
