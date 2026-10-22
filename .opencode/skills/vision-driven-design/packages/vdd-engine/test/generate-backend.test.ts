import { describe, it, expect } from 'vitest';
import { generateBackend } from '../src/generate-backend.js';
import type { InferredModel } from '../src/clone-types.js';

const model: InferredModel = {
  platform: 'unknown',
  locales: [],
  entities: [
    {
      name: 'Product',
      fields: [
        { name: 'id', type: 'string', required: true, confidence: 'high' },
        { name: 'title', type: 'string', required: true, confidence: 'high' },
        { name: 'price', type: 'number', required: true, confidence: 'high' },
      ],
    },
  ],
  relationships: [],
};

describe('generateBackend', () => {
  it('generates a migration with rollback per entity', () => {
    const b = generateBackend(model);
    expect(b.migrations).toHaveLength(1);
    expect(b.migrations[0].entity).toBe('Product');
    expect(b.migrations[0].up).toContain('CREATE TABLE products');
    expect(b.migrations[0].up).toContain('id text PRIMARY KEY');
    expect(b.migrations[0].up).toContain('price numeric');
    expect(b.migrations[0].down).toBe('DROP TABLE products;');
  });

  it('generates CRUD routes per entity', () => {
    const b = generateBackend(model);
    expect(b.routes).toHaveLength(5);
    expect(b.routes[0]).toEqual({ entity: 'Product', method: 'GET', path: '/products', summary: 'List Product' });
    expect(b.routes.map((r) => r.method)).toEqual(['GET', 'GET', 'POST', 'PATCH', 'DELETE']);
  });

  it('emits a Payload collection per entity', () => {
    const b = generateBackend(model);
    expect(b.payloadCollections).toHaveLength(1);
    const col = b.payloadCollections[0];
    expect(col.slug).toBe('products');
    expect(col.useAsTitle).toBe('title');
    expect(col.localized).toBe(false);
    const names = col.fields.map((f) => f.name);
    expect(names).toContain('title');
    expect(names).toContain('price');
  });
});
