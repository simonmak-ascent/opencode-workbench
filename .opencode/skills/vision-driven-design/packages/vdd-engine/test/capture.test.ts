import { describe, it, expect, vi, afterEach } from 'vitest';
import { staticCapture } from '../src/capture.js';

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.BROWSERLESS_TOKEN;
});

const HTML = '<html lang="en"><head>' +
  '<link rel="stylesheet" href="/style.css">' +
  '</head><body>' +
  '<header>Header</header><nav>Nav</nav><main>Main</main><footer>Footer</footer>' +
  '<style>body { --inline: #000; }</style>' +
  '</body></html>';

const CSS = ':root { --brand: #140D14; --space: 1rem; }' +
  '@font-face { font-family: "Custom"; src: url(/custom.woff2) format("woff2"); }' +
  'body { font-family: Custom, sans-serif; }' +
  '@media (max-width: 768px) { body { background: red; } }';

describe('staticCapture (no headless browser)', () => {
  it('fetches HTML + linked stylesheets and parses tokens/fonts/breakpoints/regions', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/style.css')) return new Response(CSS, { status: 200, headers: { 'content-type': 'text/css' } });
      return new Response(HTML, { status: 200, headers: { 'content-type': 'text/html' } });
    }));

    const b = await staticCapture('https://example.com');

    expect(b.cssTokens['--brand']).toBe('#140D14');
    expect(b.cssTokens['--space']).toBe('1rem');
    expect(b.css).toContain('@font-face');
    expect(b.fonts).toContain('Custom');
    expect(b.fontFaces).toHaveLength(1);
    expect(b.fontFaces[0].family).toBe('Custom');
    expect(b.breakpoints).toEqual([768]);
    expect(b.regions.map((r) => r.name)).toEqual(['nav', 'header', 'main', 'footer']);
  });
});
