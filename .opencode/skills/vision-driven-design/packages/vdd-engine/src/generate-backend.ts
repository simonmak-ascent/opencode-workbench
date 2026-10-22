// A-005 — Backend generation (pure, deterministic).
// Emits, from the inferred model:
//  1. `payloadCollections` — a Payload CMS collection spec (the functional
//     backend: collections, fields, localization, relationships).
//  2. `migrations` — SQL DDL (audit/rollback artifact).
//  3. `routes` — CRUD route specs (REST contract artifact).

import type {
  GeneratedBackend,
  InferredEntity,
  InferredField,
  InferredModel,
  InferredRelationship,
  Migration,
  PayloadCollection,
  PayloadField,
  RouteSpec,
} from './clone-types.js';

function collectionSlug(name: string): string {
  if (name === 'Media') return 'media';
  if (name === 'NavMenuItem') return 'nav-menu-items';
  const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  if (kebab.endsWith('y')) return kebab.slice(0, -1) + 'ies';
  return kebab + 's';
}

function sqlTable(name: string): string {
  return collectionSlug(name).replace(/-/g, '_');
}

function camel(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function sqlType(t: string): string {
  switch (t) {
    case 'number': return 'numeric';
    case 'boolean': return 'boolean';
    case 'object':
    case 'array': return 'jsonb';
    default: return 'text';
  }
}

function hasLanguageRel(entity: InferredEntity, relationships: InferredRelationship[]): boolean {
  return relationships.some((r) => r.source === entity.name && r.target === 'Language');
}

function useAsTitle(fields: InferredField[]): string {
  const names = new Set(fields.map((f) => f.name));
  if (names.has('title')) return 'title';
  if (names.has('name')) return 'name';
  if (names.has('slug')) return 'slug';
  return 'id';
}

function scalarToPayload(f: InferredField, localized: boolean): PayloadField | null {
  switch (f.name) {
    case 'id':
    case 'language':
    case 'parent':
    case 'objectId':
      return null;
    case 'slug':
      return { name: 'slug', type: 'text', required: f.required, localized };
    case 'title':
    case 'name':
      return { name: f.name, type: 'text', required: f.required, localized };
    case 'content':
      return { name: 'content', type: 'richText', required: false, localized };
    case 'description':
      return { name: 'description', type: 'textarea', required: false, localized };
    case 'status':
      return { name: 'status', type: 'select', required: false, localized: false, options: ['draft', 'published', 'archived'] };
    case 'date':
    case 'modified':
      return { name: f.name, type: 'date', required: false, localized: false };
    case 'sourceUrl':
    case 'url':
    case 'mimeType':
      return { name: f.name, type: 'text', required: false, localized: false };
    case 'count':
    case 'menuOrder':
      return { name: f.name, type: 'number', required: false, localized: false };
    case 'objectType':
      return { name: 'objectType', type: 'select', required: false, localized: false, options: ['page', 'project'] };
    default:
      if (f.type === 'number') return { name: f.name, type: 'number', required: f.required, localized: false };
      if (f.type === 'boolean') return { name: f.name, type: 'boolean', required: f.required, localized: false };
      return { name: f.name, type: 'text', required: f.required, localized: false };
  }
}

function relationshipFields(entity: InferredEntity, model: InferredModel): PayloadField[] {
  const out: PayloadField[] = [];
  for (const rel of model.relationships) {
    if (rel.source !== entity.name) continue;
    if (rel.target === 'Language') continue;
    if (rel.kind === 'manyToMany') {
      out.push({
        name: camel(rel.target),
        type: 'relationship',
        required: false,
        localized: false,
        relationTo: collectionSlug(rel.target),
        hasMany: true,
      });
    } else if (rel.kind === 'belongsTo') {
      if (rel.target === entity.name) {
        out.push({
          name: 'parent',
          type: 'relationship',
          required: false,
          localized: false,
          relationTo: collectionSlug(entity.name),
          hasMany: false,
        });
      } else {
        out.push({
          name: camel(rel.target),
          type: 'relationship',
          required: false,
          localized: false,
          relationTo: collectionSlug(rel.target),
          hasMany: false,
        });
      }
    }
  }
  return out;
}

export function generateBackend(model: InferredModel): GeneratedBackend {
  const migrations: Migration[] = model.entities.map((e) => {
    const cols = e.fields
      .map((f) => `  ${f.name} ${sqlType(f.type)}${f.name === 'id' ? ' PRIMARY KEY' : ''}${f.required ? ' NOT NULL' : ''}`)
      .join(',\n');
    const table = sqlTable(e.name);
    const up = `CREATE TABLE ${table} (\n${cols}\n);`;
    const down = `DROP TABLE ${table};`;
    return { entity: e.name, up, down };
  });

  const routes: RouteSpec[] = model.entities.flatMap((e) => {
    const base = '/' + collectionSlug(e.name);
    return [
      { entity: e.name, method: 'GET', path: base, summary: `List ${e.name}` },
      { entity: e.name, method: 'GET', path: `${base}/:id`, summary: `Get ${e.name}` },
      { entity: e.name, method: 'POST', path: base, summary: `Create ${e.name}` },
      { entity: e.name, method: 'PATCH', path: `${base}/:id`, summary: `Update ${e.name}` },
      { entity: e.name, method: 'DELETE', path: `${base}/:id`, summary: `Delete ${e.name}` },
    ];
  });

  const localeCodes = model.locales.map((l) => l.code);

  const payloadCollections: PayloadCollection[] = model.entities.map((e) => {
    const localized = hasLanguageRel(e, model.relationships);
    const fields: PayloadField[] = [];
    for (const f of e.fields) {
      const pf = scalarToPayload(f, localized);
      if (pf) fields.push(pf);
    }
    if (localized) {
      fields.push({ name: 'language', type: 'select', required: false, localized: false, options: localeCodes });
    }
    for (const rf of relationshipFields(e, model)) fields.push(rf);
    return {
      slug: collectionSlug(e.name),
      label: e.name,
      localized,
      useAsTitle: useAsTitle(e.fields),
      fields,
    };
  });

  return { migrations, routes, payloadCollections };
}
