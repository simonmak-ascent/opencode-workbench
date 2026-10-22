// A-008 — Scaffold manifest generation (pure, deterministic).
// Bundles the crawled dataset, inferred model, generated backend collections,
// and captured design system into a single machine-readable `CloneManifest`
// that a host-side skill (`vdd-clone`) consumes to scaffold a real Next.js +
// Payload + Postgres site. No build step, no framework coupling here.

import type {
  CaptureBundle,
  CloneManifest,
  DeployConfig,
  DesignSystem,
  GeneratedBackend,
  InferredModel,
  LayoutRegion,
  PageMapEntry,
  SiteDataset,
} from './clone-types.js';

const COLOR_RE = /^(#|rgba?\(|hsla?\()/i;

export interface ManifestOptions {
  stack?: Partial<CloneManifest['stack']>;
  deploy?: Partial<DeployConfig>;
}

function colorTokens(capture?: CaptureBundle): Record<string, string> {
  if (!capture) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(capture.cssTokens)) {
    const val = v.trim();
    if (val && COLOR_RE.test(val)) out[k] = val;
  }
  return out;
}

// Every non-empty custom property (color, spacing, radius, shadow, …) so the
// scaffold can re-emit the full token set into :root, not just colors.
function allTokens(capture?: CaptureBundle): Record<string, string> {
  if (!capture) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(capture.cssTokens)) {
    const val = v.trim();
    if (val) out[k] = val;
  }
  return out;
}

function detectRegions(capture?: CaptureBundle): LayoutRegion[] {
  const regions: LayoutRegion[] = [
    { name: 'nav', selector: 'header nav, nav', role: 'site navigation' },
    { name: 'footer', selector: 'footer', role: 'site footer' },
    { name: 'hero', selector: 'main section:first-of-type', role: 'hero / primary call-to-action' },
  ];
  if (!capture?.html) return regions;
  const html = capture.html;
  if (/<nav[\s>]/i.test(html)) regions[0].selector = 'nav';
  if (/<footer[\s>]/i.test(html)) regions[1].selector = 'footer';
  return regions;
}

function collectionForPath(path: string): string {
  if (/\/project\//i.test(path)) return 'projects';
  if (/\/media\//i.test(path)) return 'media';
  return 'pages';
}

export function generateManifest(
  target: string,
  dataset: SiteDataset,
  model: InferredModel,
  backend: GeneratedBackend,
  capture?: CaptureBundle,
  options: ManifestOptions = {},
): CloneManifest {
  const designSystem: DesignSystem = {
    colors: colorTokens(capture),
    tokens: allTokens(capture),
    fonts: capture?.fonts ?? [],
    fontFaces: capture?.fontFaces ?? [],
    breakpoints: capture?.breakpoints ?? [320, 768, 1440],
    layoutRegions: detectRegions(capture),
    css: capture?.css ?? '',
    regions: capture?.regions ?? [],
    metrics: capture?.metrics ?? {},
  };

  const pageMap: PageMapEntry[] = dataset.pages.map((p) => ({
    path: p.path,
    title: p.title,
    lang: p.lang,
    collection: collectionForPath(p.path),
  }));

  const hasDonation = dataset.pages.some((p) => /donation|checkout|payme|fps/i.test(p.path));

  const stack: CloneManifest['stack'] = {
    frontend: 'nextjs',
    cms: 'payload',
    database: 'postgres',
    styling: 'tailwind',
    runtime: 'node',
    ...options.stack,
  };
  const deploy: DeployConfig = {
    target: 'docker-swaw',
    database: 'postgres',
    composeService: 'app',
    port: 3000,
    env: {
      DATABASE_URI: 'postgres://clone:clone@postgres:5432/clone',
      PAYLOAD_SECRET: '<generate-32-byte-random>',
    },
    ...options.deploy,
  };

  return {
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    target,
    stack,
    platform: model.platform,
    locales: model.locales,
    collections: backend.payloadCollections,
    relationships: model.relationships,
    designSystem,
    pageMap,
    dataset: { path: 'vdd/clone-dataset.json', pageCount: dataset.pages.length, truncated: dataset.truncated },
    deploy,
    donation: hasDonation ? { provider: 'stripe', methods: ['card'] } : undefined,
  };
}
