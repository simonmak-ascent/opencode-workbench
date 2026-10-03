import { describe, it, expect } from "vitest";
import { COMPONENTS, UNINSTALL_SCRIPTS, uninstallScript } from "../src/components";

describe("component uninstall coverage", () => {
  const ids = new Set(COMPONENTS.map((c) => c.id));

  it("only names real components", () => {
    for (const id of Object.keys(UNINSTALL_SCRIPTS)) {
      expect(ids.has(id), `unknown component in UNINSTALL_SCRIPTS: ${id}`).toBe(true);
    }
  });

  it("covers the documented teardown subset", () => {
    for (const id of [
      "opencode",
      "pnpm",
      "uv",
      "npm-mcps",
      "vendored-mcps",
      "research-mcps",
      "github-mcp",
      "skills",
      "plugins",
      "docker-containers",
      "playwright-browsers",
      "sandbox",
    ]) {
      expect(typeof uninstallScript(id), `missing uninstall for ${id}`).toBe("string");
    }
  });

  it("returns undefined for non-automated components", () => {
    for (const id of ["git", "curl", "node"]) {
      expect(uninstallScript(id)).toBeUndefined();
    }
  });

  it("every uninstall script avoids secret values and status files", () => {
    for (const [id, script] of Object.entries(UNINSTALL_SCRIPTS)) {
      expect(script).not.toMatch(/\.env\.workbench/);
      expect(script, `${id} must not delete opencode.json`).not.toMatch(/opencode\.json/);
    }
  });
});
