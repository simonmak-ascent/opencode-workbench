import { describe, it, expect } from "vitest";
import { renderOpencodeConfig, type RenderContext } from "../src/render";

const base: Record<string, unknown> = {
  model: "deepseek/deepseek-v4-pro",
  plugin: ["./plugins/memory.ts", "./plugins/doc-tools.ts", "opencode-env-protect"],
  mcp: {
    context7: { type: "remote", url: "https://mcp.context7.com/mcp" },
    saga: {
      type: "local",
      command: ["node", "/home/node/.npm-global/lib/node_modules/saga-mcp/dist/index.js"],
      environment: { DB_PATH: "/workspaces/workbench/.saga/.tracker.db" },
    },
    difflens: { type: "local", command: ["npx", "-y", "difflens-cli"] },
  },
};

const ctx: RenderContext = {
  home: "/home/ubuntu",
  workspace: "/srv/workbench",
  npmModules: "/usr/lib/node_modules",
};

describe("renderOpencodeConfig", () => {
  it("rewrites home, workspace, npm-global and plugin paths", () => {
    const { config } = renderOpencodeConfig(base, { ...ctx, enabledMcp: "all" });
    const mcp = config.mcp as Record<string, any>;
    expect(mcp.saga.command[1]).toBe("/usr/lib/node_modules/saga-mcp/dist/index.js");
    expect(mcp.saga.environment.DB_PATH).toBe("/srv/workbench/.saga/.tracker.db");
    expect((config.plugin as string[])[0]).toBe("/home/ubuntu/.config/opencode/plugins/memory.ts");
    expect((config.plugin as string[])[2]).toBe("opencode-env-protect");
  });

  it("drops optional MCP add-ons by default", () => {
    const { config, removedMcp } = renderOpencodeConfig(base, ctx);
    expect(removedMcp).toContain("saga");
    expect(removedMcp).toContain("difflens");
    expect(Object.keys(config.mcp as object)).toContain("context7");
  });

  it("keeps everything when enabledMcp is 'all'", () => {
    const { config, removedMcp } = renderOpencodeConfig(base, { ...ctx, enabledMcp: "all" });
    expect(removedMcp).toEqual([]);
    expect(Object.keys(config.mcp as object)).toEqual(["context7", "saga", "difflens"]);
  });

  it("does not mutate the input config", () => {
    const snapshot = JSON.stringify(base);
    renderOpencodeConfig(base, ctx);
    expect(JSON.stringify(base)).toBe(snapshot);
  });
});
