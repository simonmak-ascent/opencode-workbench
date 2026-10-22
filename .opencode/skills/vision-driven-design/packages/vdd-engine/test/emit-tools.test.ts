import { describe, it, expect } from 'vitest';
import { emitTools } from '../src/emit-tools.js';
import type { InferredModel } from '../src/clone-types.js';

describe('emitTools', () => {
  it('emits capture/infer/verify/scaffold tools in snake_case', () => {
    const model: InferredModel = { platform: 'unknown', locales: [], entities: [{ name: 'Product', fields: [] }], relationships: [] };
    const tools = emitTools(model);
    expect(tools.length).toBeGreaterThanOrEqual(4);
    for (const t of tools) {
      expect(t.name).toMatch(/^[a-z][a-z0-9_]*$/);
    }
    expect(tools.map((t) => t.name)).toContain('clone_infer_schema');
    expect(tools.map((t) => t.name)).toContain('clone_generate_backend');
    expect(tools.map((t) => t.name)).toContain('clone_scaffold_site');
  });
});
