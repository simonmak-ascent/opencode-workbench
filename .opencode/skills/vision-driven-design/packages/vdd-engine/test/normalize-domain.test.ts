import { describe, it, expect } from 'vitest';
import { normalizeDomain } from '../src/normalize-domain.js';

describe('normalizeDomain', () => {
  it('AC-1: preserves https scheme and strips leading www', () => {
    expect(normalizeDomain('https://www.example.com')).toEqual({ scheme: 'https', host: 'example.com' });
  });

  it('AC-2: bare domain defaults to https', () => {
    expect(normalizeDomain('example.com')).toEqual({ scheme: 'https', host: 'example.com' });
  });

  it('AC-3: preserves http scheme and strips path/query', () => {
    expect(normalizeDomain('http://example.com/products?sort=asc')).toEqual({ scheme: 'http', host: 'example.com' });
  });

  it('AC-4: strips www but preserves other subdomains', () => {
    expect(normalizeDomain('https://www.example.com')).toEqual({ scheme: 'https', host: 'example.com' });
    expect(normalizeDomain('https://app.example.com')).toEqual({ scheme: 'https', host: 'app.example.com' });
  });

  it('AC-E1: rejects empty input', () => {
    const r = normalizeDomain('');
    expect('code' in r).toBe(true);
    if ('code' in r) expect(r.code).toBe('EMPTY_DOMAIN');
  });

  it('AC-E2: rejects invalid host', () => {
    const r = normalizeDomain('not a valid url');
    expect('code' in r).toBe(true);
    if ('code' in r) expect(r.code).toBe('INVALID_HOST');
  });

  it('allows localhost by default (maximum flexibility)', () => {
    expect(normalizeDomain('localhost')).toEqual({ scheme: 'https', host: 'localhost' });
  });
});
