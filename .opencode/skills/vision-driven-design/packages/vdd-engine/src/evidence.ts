// A-003 — Network evidence recorder (browser, Playwright).
// Records JSON request/response bodies grouped by operation signature.

import type { EvidenceBundle, EvidenceRecord } from './clone-types.js';

export async function recordEvidence(domain: string, options?: { timeoutMs?: number }): Promise<EvidenceBundle> {
  let pw: typeof import('playwright');
  try {
    pw = await import('playwright');
  } catch {
    throw new Error('Playwright is not installed. Run `pnpm add -D playwright && npx playwright install chromium`.');
  }

  const browser = await pw.chromium.launch();
  const collected = new Map<string, unknown[]>();
  try {
    const page = await browser.newPage();
    page.on('response', async (res) => {
      const ct = res.headers()['content-type'] || '';
      if (!ct.includes('json')) return;
      try {
        const body = await res.json();
        const method = res.request().method();
        const pathname = new URL(res.url()).pathname;
        const op = `${method} ${pathname}`;
        if (!collected.has(op)) collected.set(op, []);
        collected.get(op)!.push(body);
      } catch {
        // non-JSON or parse failure — skip
      }
    });
    await page.goto(domain, { timeout: options?.timeoutMs ?? 60000, waitUntil: 'networkidle' });

    const records: EvidenceRecord[] = [...collected.entries()].map(([op, samples]) => ({
      operation: op,
      method: op.split(' ')[0],
      url: op,
      samples,
      sampleCount: samples.length,
    }));
    return { records };
  } finally {
    await browser.close();
  }
}
