import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { PHASES } from '../src/engine.js';
import type { VddContext, VddPhaseInput } from '../src/types.js';

const TACTICS = 'V-001 → S-002 → T-003';

async function put(root: string, rel: string, chain: string): Promise<void> {
  const path = join(root, rel);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `# ${rel}\n\n> Impact Chain: ${chain}\n`);
}

async function writeFeature(root: string, feature: string, n: number): Promise<void> {
  const spec = `SP-0${n}0`;
  const plan = `PL-0${n}1`;
  await put(root, `vdd/specs/${feature}/spec.md`, `${TACTICS} → ${spec}`);
  await put(root, `vdd/specs/${feature}/plan.md`, `${TACTICS} → ${spec} → ${plan}`);
  await put(root, `vdd/specs/${feature}/data-model.md`, `${TACTICS} → ${spec} → DM-0${n}`);
  await put(root, `vdd/specs/${feature}/contracts/primary-endpoint.md`, `${TACTICS} → ${spec} → CE-0${n}`);
  await put(root, `vdd/specs/${feature}/tasks.md`, `${TACTICS} → ${spec} → ${plan} → TK-0${n}2`);
}

describe('validate', () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'vdd-validate-'));
    await put(root, 'constitution.md', 'Phase 0 — Constitution (immutable)');
    await put(root, 'vdd/vision.md', 'V-001');
    await put(root, 'vdd/strategy.md', 'V-001 → S-002');
    await put(root, 'vdd/tactics.md', TACTICS);
    await writeFeature(root, 'alpha', 2);
    await writeFeature(root, 'beta', 7);
    // A hand-authored report that validate must never overwrite.
    await writeFile(join(root, 'vdd', 'impact-report.md'), 'HAND AUTHORED — DO NOT CLOBBER\n');
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('discovers every feature, not a hardcoded feature-1', async () => {
    const result = await PHASES.validate({} as VddPhaseInput, { projectRoot: root, mode: 'auto' } as VddContext);
    expect(result.success).toBe(true);
    const output = result.output as { features: string[]; drift: unknown[]; uncovered: unknown[] };
    expect(output.features).toEqual(['alpha', 'beta']);
    expect(output.drift).toEqual([]);
    expect(output.uncovered).toEqual([]);
  });

  it('writes a generated report and never overwrites the hand-authored one', async () => {
    const result = await PHASES.validate({} as VddPhaseInput, { projectRoot: root, mode: 'auto' } as VddContext);
    expect(result.artifact).toBe(join(root, 'vdd', 'impact-report.generated.md'));
    const handAuthored = await readFile(join(root, 'vdd', 'impact-report.md'), 'utf-8');
    expect(handAuthored).toContain('DO NOT CLOBBER');
    const generated = await readFile(join(root, 'vdd', 'impact-report.generated.md'), 'utf-8');
    expect(generated).toContain('| alpha |');
    expect(generated).toContain('| beta |');
  });
});
