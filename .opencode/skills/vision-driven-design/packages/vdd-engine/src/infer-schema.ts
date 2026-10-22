// A-004 — Schema inference (pure, deterministic).
// Two strategies:
//  1. WordPress-aware: when the crawl detected a WordPress CMS (via the REST
//     `/wp-json/` probe), reconstruct the content model from content types,
//     taxonomies, and Polylang locales — the real editorial model.
//  2. Generic fallback: infer entities/fields from recorded network JSON.
// Output is always an *inferred* model, not a recovered original schema.

import type {
  CmsContentType,
  CmsDescriptor,
  EvidenceBundle,
  InferredEntity,
  InferredField,
  InferredModel,
  InferredRelationship,
} from './clone-types.js';

function toType(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  const t = typeof v;
  return t === 'object' ? 'object' : t;
}

function singularize(word: string): string {
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (/(s|x|z|ch|sh)es$/.test(word)) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function entityNameFromOperation(operation: string): string {
  const path = operation.replace(/^(GET|POST|PUT|PATCH|DELETE)\s+/, '');
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return 'Entity';
  const cleaned = singularize(last.replace(/[{}]/g, ''));
  if (!cleaned) return 'Entity';
  return capitalize(cleaned);
}

// --- WordPress-aware inference ---

const CORE_CONTENT_SLUGS = new Set(['post', 'page', 'attachment', 'nav_menu_item']);

// Internal plugin/builder post types and taxonomies (Divi, Elementor, Gutenberg,
// ACF, WP plumbing) that are not editorial content — emitting a Payload
// collection for each over-segments the model for a marketing/content site.
const INTERNAL_TYPE_SLUGS = new Set([
  'et_pb_layout', 'et_footer_layout', 'et_body_layout', 'et_header_layout',
  'et_template', 'et_theme_builder', 'et_pb_global_colors', 'et_code_snippet',
  'dmach_post', 'dmach_tax',
  'wp_block', 'wp_navigation', 'wp_global_styles', 'wp_template', 'wp_template_part',
  'wp_font_family', 'wp_font_face', 'revision', 'custom_css', 'customize_changeset',
  'oembed_cache', 'user_request', 'acf-field-group', 'acf-field',
  'elementor_library', 'astra-advanced-hook', 'wpcf7_contact_form', 'brb_collection',
  'wp_stream_alert', 'shop_order', 'shop_coupon', 'shop_webhook',
]);

const INTERNAL_TAXONOMY_SLUGS = new Set([
  'nav_menu', 'post_format', 'link_category', 'wp_theme', 'wp_pattern_category',
  'wp_template_part_area', 'elementor_library_type', 'elementor_library_category',
  'fl-builder-template-category', 'et_theme_builder', 'et_template_category',
  'acf-taxonomy', 'product_shipping_class', 'product_type', 'product_visibility',
]);

function wpEntityName(ct: CmsContentType): string {
  switch (ct.slug) {
    case 'page': return 'Page';
    case 'post': return 'Post';
    case 'attachment': return 'Media';
    case 'nav_menu_item': return 'NavMenuItem';
    default:
      return capitalize(singularize(ct.name || ct.slug));
  }
}

function slugToPascal(slug: string): string {
  return slug
    .split(/[_-]/)
    .filter(Boolean)
    .map(capitalize)
    .join('');
}

function taxonomyEntityName(taxonomySlug: string): string {
  return slugToPascal(taxonomySlug);
}

function isContentTaxonomy(slug: string): boolean {
  return !slug.startsWith('wp_') && slug !== 'nav_menu' && !INTERNAL_TAXONOMY_SLUGS.has(slug);
}

function field(name: string, type: string, required = false): InferredField {
  return { name, type, required, confidence: 'high' };
}

function contentFields(): InferredField[] {
  return [
    field('id', 'number', true),
    field('slug', 'string', true),
    field('title', 'string', true),
    field('content', 'string'),
    field('status', 'string'),
    field('language', 'string'),
    field('date', 'string'),
    field('modified', 'string'),
  ];
}

function fieldsFor(slug: string): InferredField[] {
  switch (slug) {
    case 'page':
      return [...contentFields(), field('parent', 'number')];
    case 'post':
      return contentFields();
    case 'attachment':
      return [
        field('id', 'number', true),
        field('slug', 'string', true),
        field('title', 'string', true),
        field('sourceUrl', 'string'),
        field('mimeType', 'string'),
      ];
    case 'nav_menu_item':
      return [
        field('id', 'number', true),
        field('title', 'string', true),
        field('url', 'string'),
        field('menuOrder', 'number'),
        field('parent', 'number'),
        field('objectId', 'number'),
        field('objectType', 'string'),
      ];
    default:
      return contentFields();
  }
}

function isContentType(slug: string): boolean {
  return (CORE_CONTENT_SLUGS.has(slug) || !slug.startsWith('wp_')) && !INTERNAL_TYPE_SLUGS.has(slug);
}

function inferWordpress(cms: CmsDescriptor): InferredModel {
  const entities: InferredEntity[] = [];
  const relationships: InferredRelationship[] = [];
  const entityNames = new Set<string>();

  // Custom post types (Divi Machine et al.) may be absent from /types but
  // referenced by a taxonomy's `types` field — derive them so the model is
  // complete (e.g. `experiences`, `corporate_solutions`, `empowers`, `evolves`).
  const contentTypes: CmsContentType[] = [...cms.contentTypes];
  const knownSlugs = new Set(cms.contentTypes.map((ct) => ct.slug));
  for (const tax of cms.taxonomies) {
    for (const typeSlug of tax.types) {
      if (knownSlugs.has(typeSlug)) continue;
      if (typeSlug.startsWith('wp_') || typeSlug === 'nav_menu' || INTERNAL_TYPE_SLUGS.has(typeSlug)) continue;
      knownSlugs.add(typeSlug);
      contentTypes.push({
        slug: typeSlug,
        name: slugToPascal(typeSlug),
        restBase: typeSlug,
        hierarchical: false,
        hasArchive: true,
        taxonomies: [tax.slug],
      });
    }
  }

  for (const ct of contentTypes) {
    if (!isContentType(ct.slug)) continue;
    const name = wpEntityName(ct);
    if (entityNames.has(name)) continue;
    entityNames.add(name);
    entities.push({ name, fields: fieldsFor(ct.slug) });

    if (ct.hierarchical) {
      relationships.push({ source: name, target: name, via: 'parent', kind: 'belongsTo' });
    }
    if (ct.slug !== 'attachment' && ct.slug !== 'nav_menu_item') {
      relationships.push({ source: name, target: 'Language', via: 'language', kind: 'belongsTo' });
    }
  }

  // taxonomy entities (e.g. Category, ProjectCategory, ProjectTag)
  for (const tax of cms.taxonomies) {
    if (!isContentTaxonomy(tax.slug)) continue;
    const name = taxonomyEntityName(tax.slug);
    if (entityNames.has(name)) continue;
    entityNames.add(name);
    entities.push({
      name,
      fields: [
        field('id', 'number', true),
        field('slug', 'string', true),
        field('name', 'string', true),
        field('count', 'number'),
      ],
    });
  }

  // content → taxonomy (N:M) and nav_menu_item → Page
  for (const ct of contentTypes) {
    if (!isContentType(ct.slug)) continue;
    const source = wpEntityName(ct);
    for (const tax of ct.taxonomies) {
      if (!isContentTaxonomy(tax)) continue;
      relationships.push({ source, target: taxonomyEntityName(tax), via: tax, kind: 'manyToMany' });
    }
  }
  if (entityNames.has('NavMenuItem')) {
    relationships.push({ source: 'NavMenuItem', target: 'Page', via: 'objectId', kind: 'belongsTo' });
  }

  return {
    platform: 'wordpress',
    locales: cms.languages,
    entities,
    relationships,
  };
}

// --- Generic fallback ---

function inferFromEvidence(evidence: EvidenceBundle): InferredModel {
  const samplesByEntity: Record<string, unknown[][]> = {};
  for (const rec of evidence.records) {
    const name = entityNameFromOperation(rec.operation);
    if (!samplesByEntity[name]) samplesByEntity[name] = [];
    for (const s of rec.samples) {
      if (Array.isArray(s)) samplesByEntity[name].push(s);
      else samplesByEntity[name].push([s]);
    }
  }

  const entityNames = Object.keys(samplesByEntity);
  const entities: InferredEntity[] = [];

  for (const name of entityNames) {
    const all = samplesByEntity[name];
    const flat = all.flat().filter((o): o is Record<string, unknown> => !!o && typeof o === 'object' && !Array.isArray(o));
    const total = flat.length;
    const acc: Record<string, { types: Set<string>; count: number }> = {};
    for (const obj of flat) {
      for (const [k, v] of Object.entries(obj)) {
        if (!acc[k]) acc[k] = { types: new Set(), count: 0 };
        acc[k].types.add(toType(v));
        acc[k].count++;
      }
    }
    const fields: InferredField[] = Object.entries(acc).map(([k, v]) => ({
      name: k,
      type: v.types.size === 1 ? [...v.types][0] : 'unknown',
      required: v.count === total,
      confidence: v.count >= total * 0.75 ? 'high' : 'low',
    }));
    entities.push({ name, fields });
  }

  const relationships: InferredRelationship[] = [];
  for (const ent of entities) {
    for (const f of ent.fields) {
      const lower = f.name.toLowerCase();
      if (lower.endsWith('id') && lower !== 'id') {
        const target = capitalize(f.name.slice(0, -2));
        if (entityNames.includes(target)) {
          relationships.push({ source: ent.name, target, via: f.name, kind: 'belongsTo' });
        }
      }
    }
  }

  return { platform: 'unknown', locales: [], entities, relationships };
}

export function inferSchema(evidence: EvidenceBundle, cms?: CmsDescriptor): InferredModel {
  if (cms?.platform === 'wordpress' && cms.contentTypes.length > 0) {
    return inferWordpress(cms);
  }
  return inferFromEvidence(evidence);
}
