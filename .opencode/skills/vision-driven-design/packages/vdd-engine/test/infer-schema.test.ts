import { describe, it, expect } from 'vitest';
import { inferSchema } from '../src/infer-schema.js';
import type { CmsDescriptor, EvidenceBundle } from '../src/clone-types.js';

const evidence: EvidenceBundle = {
  records: [
    {
      operation: 'GET /api/products',
      method: 'GET',
      url: 'GET /api/products',
      samples: [
        [
          { id: '1', title: 'Chair', price: 99.5, categoryId: 'c1' },
          { id: '2', title: 'Table', price: 150 },
        ],
      ],
      sampleCount: 2,
    },
    {
      operation: 'GET /api/categories',
      method: 'GET',
      url: 'GET /api/categories',
      samples: [[{ id: 'c1', name: 'Furniture' }]],
      sampleCount: 1,
    },
  ],
};

describe('inferSchema', () => {
  it('infers entities from operation signatures (singularized)', () => {
    const model = inferSchema(evidence);
    expect(model.entities.map((e) => e.name)).toEqual(['Product', 'Category']);
  });

  it('infers field types, required-ness, and confidence', () => {
    const model = inferSchema(evidence);
    const product = model.entities.find((e) => e.name === 'Product');
    expect(product).toBeDefined();
    const id = product!.fields.find((f) => f.name === 'id');
    expect(id?.type).toBe('string');
    expect(id?.required).toBe(true);
    expect(id?.confidence).toBe('high');
    const price = product!.fields.find((f) => f.name === 'price');
    expect(price?.type).toBe('number');
    const categoryId = product!.fields.find((f) => f.name === 'categoryId');
    expect(categoryId?.required).toBe(false);
    expect(categoryId?.confidence).toBe('low');
  });

  it('infers belongsTo relationships from *Id fields', () => {
    const model = inferSchema(evidence);
    expect(model.relationships).toContainEqual({ source: 'Product', target: 'Category', via: 'categoryId', kind: 'belongsTo' });
  });

  it('returns an empty model for no evidence', () => {
    expect(inferSchema({ records: [] })).toEqual({ platform: 'unknown', locales: [], entities: [], relationships: [] });
  });

  it('reconstructs the WordPress content model from a CMS descriptor', () => {
    const cms: CmsDescriptor = {
      platform: 'wordpress',
      detectedAt: '2026-09-04T00:00:00.000Z',
      restBase: 'https://example.com/wp-json',
      contentTypes: [
        { slug: 'page', name: 'Pages', restBase: 'pages', hierarchical: true, hasArchive: false, taxonomies: [] },
        { slug: 'post', name: 'Posts', restBase: 'posts', hierarchical: false, hasArchive: true, taxonomies: ['category'] },
        { slug: 'project', name: 'Projects', restBase: 'project', hierarchical: false, hasArchive: true, taxonomies: ['project_category'] },
      ],
      taxonomies: [
        { slug: 'category', name: 'Categories', restBase: 'categories', types: ['post'] },
        { slug: 'project_category', name: 'Project Categories', restBase: 'project_category', types: ['project'] },
      ],
      languages: [{ code: 'en', name: 'EN', locale: 'en_US', w3c: 'en-US', homeUrl: 'https://example.com/en/', isDefault: true }],
    };
    const model = inferSchema({ records: [] }, cms);
    expect(model.platform).toBe('wordpress');
    expect(model.locales).toHaveLength(1);
    const names = model.entities.map((e) => e.name);
    expect(names).toContain('Page');
    expect(names).toContain('Post');
    expect(names).toContain('Project');
    expect(names).toContain('Category');
    expect(names).toContain('ProjectCategory');
    expect(model.relationships).toContainEqual({ source: 'Project', target: 'ProjectCategory', via: 'project_category', kind: 'manyToMany' });
    expect(model.relationships).toContainEqual({ source: 'Page', target: 'Language', via: 'language', kind: 'belongsTo' });
  });

  it('prunes internal plugin/builder post types and taxonomies', () => {
    const cms: CmsDescriptor = {
      platform: 'wordpress',
      detectedAt: '2026-09-04T00:00:00.000Z',
      restBase: 'https://example.com/wp-json',
      contentTypes: [
        { slug: 'page', name: 'Pages', restBase: 'pages', hierarchical: true, hasArchive: false, taxonomies: [] },
        { slug: 'project', name: 'Projects', restBase: 'project', hierarchical: false, hasArchive: true, taxonomies: ['category'] },
        { slug: 'et_pb_layout', name: 'Divi Layouts', restBase: 'et_pb_layout', hierarchical: false, hasArchive: false, taxonomies: [] },
        { slug: 'wp_block', name: 'Blocks', restBase: 'wp_blocks', hierarchical: false, hasArchive: false, taxonomies: [] },
        { slug: 'elementor_library', name: 'Templates', restBase: 'elementor_library', hierarchical: false, hasArchive: false, taxonomies: ['elementor_library_type'] },
      ],
      taxonomies: [
        { slug: 'category', name: 'Categories', restBase: 'categories', types: ['project'] },
        { slug: 'elementor_library_type', name: 'Template Types', restBase: 'elementor_library_type', types: ['elementor_library'] },
      ],
      languages: [{ code: 'en', name: 'EN', locale: 'en_US', w3c: 'en-US', homeUrl: 'https://example.com/en/', isDefault: true }],
    };
    const model = inferSchema({ records: [] }, cms);
    expect(model.entities.map((e) => e.name)).toEqual(['Page', 'Project', 'Category']);
  });
});
