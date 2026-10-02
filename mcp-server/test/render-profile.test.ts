import { describe, it, expect } from "vitest";
import { componentById, defaultComponentIds, COMPONENTS } from "../src/components";
import { extractEnvVars, renderEnvTemplate } from "../src/profile";

describe("components", () => {
  it("has unique ids", () => {
    const ids = COMPONENTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("default profile includes required and core, excludes optional", () => {
    const ids = defaultComponentIds();
    expect(ids).toContain("node");
    expect(ids).toContain("opencode");
    expect(ids).toContain("npm-mcps");
    expect(ids).not.toContain("docker");
    expect(ids).not.toContain("data-tools");
  });

  it("looks up a component by id", () => {
    expect(componentById("opencode")?.tier).toBe("required");
    expect(componentById("nope")).toBeUndefined();
  });
});

describe("profile helpers", () => {
  it("extracts and dedupes {env:} placeholders", () => {
    const vars = extractEnvVars({
      a: "{env:A}",
      b: ["{env:B}", { c: "{env:A}" }],
      d: "no placeholder",
    });
    expect(vars).toEqual(["A", "B"]);
  });

  it("renders a names-only env template", () => {
    const tpl = renderEnvTemplate(["DEEPSEEK_API_KEY", "BRAVE_API_KEY"]);
    expect(tpl).toContain("DEEPSEEK_API_KEY=");
    expect(tpl).toContain("BRAVE_API_KEY=");
    expect(tpl).toContain("chmod 600");
  });
});
