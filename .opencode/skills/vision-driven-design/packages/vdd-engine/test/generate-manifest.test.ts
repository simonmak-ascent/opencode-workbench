import { describe, it, expect } from 'vitest';
import { generateManifest } from '../src/generate-manifest.js';
import { generateBackend } from '../src/generate-backend.js';
import type { CaptureBundle, InferredModel, SiteDataset } from '../src/clone-types.js';

const dataset: SiteDataset = {
  root: 'https://example.com',
  crawledAt: '2026-09-04T00:00:00.000Z',
  maxPages: 200,
  truncated: false,
  pages: [
    {
      url: 'https://example.com/',
      path: '/',
      title: 'Home',
      description: 'Welcome home',
      lang: 'en',
      headings: ['Hello'],
      paragraphs: ['A long enough paragraph for the home page content.'],
      images: ['https://example.com/logo.png'],
      links: ['https://example.com/about'],
    },
    {
      url: 'https://example.com/donation',
      path: '/donation',
      title: 'Donation',
      description: '',
      lang: 'en',
      headings: ['Donate'],
      paragraphs: ['A long enough paragraph for the donation page content.'],
      images: [],
      links: ['https://example.com/'],
    },
  ],
};

const model: InferredModel = {
  platform: 'wordpress',
  locales: [{ code: 'en', name: 'EN', locale: 'en_US', w3c: 'en-US', homeUrl: 'https://example.com/en/', isDefault: true }],
  entities: [{ name: 'Page', fields: [{ name: 'id', type: 'number', required: true, confidence: 'high' }] }],
  relationships: [{ source: 'Page', target: 'Language', via: 'language', kind: 'belongsTo' }],
};

const capture: CaptureBundle = {
  domain: 'https://example.com',
  html: '<html><body><nav></nav><footer></footer></body></html>',
  css: '@media (max-width: 768px) { body { background: red; } }',
  cssTokens: { '--brand': '#140D14', '--space': '1rem', '--empty': '  ' },
  fonts: ['Source Sans Pro'],
  fontFaces: [{ family: 'Source Sans Pro', src: "url('/fonts/source-sans.woff2') format('woff2')" }],
  breakpoints: [768],
  regions: [
    { name: 'nav', selector: 'nav', html: '<nav>Home</nav>' },
    { name: 'footer', selector: 'footer', html: '<footer>Foot</footer>' },
  ],
  metrics: { headerHeight: 112, logoHeight: 60 },
};

describe('generateManifest (A-008)', () => {
  const backend = generateBackend(model);

  it('emits a full scaffold manifest with stack, locales, collections, deploy', () => {
    const m = generateManifest('https://example.com', dataset, model, backend, capture);
    expect(m.schemaVersion).toBe('1.0');
    expect(m.target).toBe('https://example.com');
    expect(m.stack).toEqual({ frontend: 'nextjs', cms: 'payload', database: 'postgres', styling: 'tailwind', runtime: 'node' });
    expect(m.platform).toBe('wordpress');
    expect(m.locales).toHaveLength(1);
    expect(m.collections.length).toBe(backend.payloadCollections.length);
    expect(m.deploy.target).toBe('docker-swaw');
    expect(m.deploy.database).toBe('postgres');
  });

  it('builds a page map from the dataset', () => {
    const m = generateManifest('https://example.com', dataset, model, backend, capture);
    expect(m.pageMap).toHaveLength(2);
    expect(m.pageMap[0]).toEqual({ path: '/', title: 'Home', lang: 'en', collection: 'pages' });
  });

  it('carries design tokens (filters empty) and fonts', () => {
    const m = generateManifest('https://example.com', dataset, model, backend, capture);
    expect(m.designSystem.colors['--brand']).toBe('#140D14');
    expect(m.designSystem.colors['--empty']).toBeUndefined();
    expect(m.designSystem.tokens['--space']).toBe('1rem');
    expect(m.designSystem.fonts).toContain('Source Sans Pro');
    expect(m.designSystem.layoutRegions.length).toBeGreaterThan(0);
  });

  it('carries full CSS, font faces, and region HTML for faithful reproduction', () => {
    const m = generateManifest('https://example.com', dataset, model, backend, capture);
    expect(m.designSystem.css).toContain('@media');
    expect(m.designSystem.fontFaces).toHaveLength(1);
    expect(m.designSystem.regions.map((r) => r.name)).toEqual(['nav', 'footer']);
    expect(m.designSystem.regions.find((r) => r.name === 'nav')?.html).toBe('<nav>Home</nav>');
    expect(m.designSystem.metrics).toEqual({ headerHeight: 112, logoHeight: 60 });
  });

  it('detects a donation surface from the crawled pages', () => {
    const m = generateManifest('https://example.com', dataset, model, backend, capture);
    expect(m.donation).toEqual({ provider: 'stripe', methods: ['card'] });
  });

  it('honors a stack/deploy override (surreal + vercel)', () => {
    const m = generateManifest('https://example.com', dataset, model, backend, capture, {
      stack: { cms: 'custom', database: 'surreal', styling: 'css' },
      deploy: { target: 'vercel', database: 'surreal', port: 443, composeService: 'app', env: {} },
    });
    expect(m.stack).toEqual({ frontend: 'nextjs', cms: 'custom', database: 'surreal', styling: 'css', runtime: 'node' });
    expect(m.deploy.target).toBe('vercel');
    expect(m.deploy.database).toBe('surreal');
  });
});
