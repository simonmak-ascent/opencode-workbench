import { describe, it, expect } from "vitest";
import { CORE_NPM_MCPS, componentById } from "../src/components";
import { PROBE_SCRIPT } from "../src/probe";

describe("opencode CLI component", () => {
  const c = componentById("opencode")!;

  it("installs the OpenCode 2 channel", () => {
    // https://opencode.ai/install is the v1 installer and refuses 2.x outright,
    // so it can never satisfy a "latest OpenCode" claim. See the v2 endpoint.
    expect(c.install).toContain("https://opencode.ai/v2/install");
    expect(c.preview).toContain("https://opencode.ai/v2/install");
    expect(c.install).not.toMatch(/opencode\.ai\/install(?!\/)/);
  });

  it("detects by major version, not mere presence", () => {
    // A v1 binary is present but cannot run this workbench; presence-only
    // detection left such boxes "ok" forever and never upgraded them.
    expect(c.detect).toContain("--version");
    expect(c.detect).not.toMatch(/^command -v opencode >\/dev\/null 2>&1 \|\|/);
  });
});

describe("plugins component", () => {
  const c = componentById("plugins")!;

  it("compares installed plugins against the repo", () => {
    // Loading once and reporting "present" afterwards meant a corrected plugin
    // never reached an existing box.
    expect(c.detect).toContain("cmp -s");
    expect(c.detect).toContain("WB_REPO");
  });

  it("falls back to presence when the repo is not on the target", () => {
    // A box that has not cloned yet has no WB_REPO; detect must still answer.
    expect(c.detect).toMatch(/memory\.ts/);
    expect(c.detect).toMatch(/doc-tools\.ts/);
  });
});

describe("skills component", () => {
  const c = componentById("skills")!;

  it("compares the tree against the repo instead of counting files", () => {
    // A non-empty directory used to count as current forever.
    expect(c.detect).toContain("diff -r");
    expect(c.detect).toContain("WB_REPO");
  });

  it("still answers when the repo is not on the target", () => {
    expect(c.detect).toContain("SKILL.md");
  });
});

describe("npm-mcps component", () => {
  const c = componentById("npm-mcps")!;

  it("checks every core package, not a sample", () => {
    // Two of nine was the old check, so seven could be missing and undetected.
    for (const p of CORE_NPM_MCPS) {
      expect(c.detect, `detect must cover ${p}`).toContain(p);
    }
  });
});

describe("probe reports the opencode version", () => {
  it("emits opencodeVersion alongside opencodeBin", () => {
    expect(PROBE_SCRIPT).toContain('"opencodeVersion"');
    expect(PROBE_SCRIPT).toContain("--version");
  });
});
