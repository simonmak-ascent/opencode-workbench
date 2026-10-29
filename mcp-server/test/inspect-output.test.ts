import { describe, it, expect } from "vitest";
import { PROBE_SCRIPT } from "../src/probe";
import { inspectOutput } from "../src/tools";

/**
 * The MCP SDK validates a tool's `structuredContent` against its declared
 * output schema, and rejects unknown fields:
 *
 *   Structured content does not match the tool's output schema:
 *   data must NOT have additional properties
 *
 * `inspect_target` returns whatever the probe emitted, so any probe field that
 * is not declared fails the whole call — in production, not at build time. This
 * guard keeps the schema and the probe in step.
 */
describe("inspect_target output schema", () => {
  it("declares every top-level field the probe emits", () => {
    const body = PROBE_SCRIPT;
    const jsonStart = body.lastIndexOf("{");
    // The probe prints one JSON object; collect its top-level keys.
    const keys = [...body.matchAll(/^ {2}"([a-zA-Z]+)":/gm)].map((m) => m[1]!);
    expect(keys.length).toBeGreaterThan(10);

    const declared = new Set(Object.keys(inspectOutput.shape));
    const missing = keys.filter((k) => !declared.has(k));
    expect(missing, `probe emits fields the schema does not declare: ${missing.join(", ")}`).toEqual([]);
    expect(jsonStart).toBeGreaterThan(0);
  });

  it("accepts a probe-shaped object", () => {
    const sample = {
      user: "root",
      home: "/root",
      workspaceDefault: "/workspaces/workbench",
      configDir: "/root/.config/opencode",
      osId: "ubuntu",
      osIdLike: "debian",
      osName: "Ubuntu",
      osVersion: "24.04",
      kernel: "Linux 6.8",
      arch: "x86_64",
      packageManager: "apt-get",
      nodeVersion: "v22.0.0",
      npmPrefix: "/usr",
      npmModules: "/usr/lib/node_modules",
      shell: "/bin/bash",
      opencodeBin: "/usr/bin/opencode",
      opencodeVersion: "2.2.1",
      skillsCount: "76",
      dockerRunning: false,
      envPresent: "DEEPSEEK_API_KEY",
      has: { git: true, opencode: true },
    };
    expect(() => inspectOutput.parse(sample)).not.toThrow();
  });
});
