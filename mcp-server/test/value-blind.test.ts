import { describe, it, expect } from "vitest";
import { REQUIRED_CREDENTIALS, credentialByVar, credentialStatus } from "../src/credentials";
import { renderOpencodeConfig, type RenderContext } from "../src/render";
import { extractEnvVars, renderEnvTemplate } from "../src/profile";

const SENTINEL = "SENTINEL_DO_NOT_LEAK_9f3a1c";

describe("value-blind guarantees", () => {
  it("the credential catalog holds names and guidance only", () => {
    const blob = JSON.stringify(REQUIRED_CREDENTIALS);
    expect(blob).not.toContain(SENTINEL);
    for (const c of REQUIRED_CREDENTIALS) {
      expect(typeof c.var).toBe("string");
      expect(c.var).toMatch(/^[A-Z0-9_]+$/);
      // no field may contain an assigned value
      for (const v of Object.values(c)) {
        if (typeof v === "string") expect(v).not.toMatch(/=\S{8,}/);
      }
    }
  });

  it("credentialStatus exposes presence, never a value", () => {
    const spec = credentialByVar("DEEPSEEK_API_KEY")!;
    const status = credentialStatus(spec, new Set(["DEEPSEEK_API_KEY"]));
    expect(status.present).toBe(true);
    const blob = JSON.stringify(status);
    expect(blob).not.toContain(SENTINEL);
    expect(Object.keys(status)).not.toContain("value");
  });

  it("renderer only ever emits {env:} placeholders, never a value", () => {
    const base = {
      model: "deepseek/deepseek-v4-pro",
      mcp: {
        x: { type: "local", command: ["node", "x.js"], environment: { API_KEY: "{env:API_KEY}" } },
      },
    };
    const ctx: RenderContext = { home: "/home/u", workspace: "/w", npmModules: "/m", presentEnv: new Set(["API_KEY"]) };
    const { config } = renderOpencodeConfig(base, ctx);
    const blob = JSON.stringify(config);
    expect(blob).toContain("{env:API_KEY}");
    expect(blob).not.toContain(SENTINEL);
  });

  it("the env template lists names only", () => {
    const tpl = renderEnvTemplate(["DEEPSEEK_API_KEY", "BRAVE_API_KEY"]);
    expect(tpl).toContain("DEEPSEEK_API_KEY=");
    expect(tpl.split("\n").every((line) => !line.includes("=") || line.endsWith("="))).toBe(true);
  });

  it("extractEnvVars returns names, not values", () => {
    expect(extractEnvVars({ a: "{env:A}", b: "{env:B}" })).toEqual(["A", "B"]);
  });
});
