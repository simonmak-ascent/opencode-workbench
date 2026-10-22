// Domain normalization for the `-clone` flag.
// Pure, side-effect-free: accepts a domain in any common form and returns a
// canonical { scheme, host } (or a typed error). No network I/O.

export interface NormalizedUrl {
  scheme: 'https' | 'http';
  host: string;
}

export interface NormalizeError {
  code: 'EMPTY_DOMAIN' | 'INVALID_HOST';
  message: string;
}

const SCHEME_RE = /^(https?):\/\//i;
const HOST_RE = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;

function isValidHost(host: string): boolean {
  if (host === 'localhost') return true;
  if (IPV4_RE.test(host)) return true;
  return HOST_RE.test(host);
}

export function normalizeDomain(input: string): NormalizedUrl | NormalizeError {
  const raw = (input ?? '').trim();
  if (!raw) {
    return {
      code: 'EMPTY_DOMAIN',
      message: 'Domain is required. Accepted forms: https://…, http://…, www.…, or a bare domain.',
    };
  }

  let rest = raw;
  let scheme: 'https' | 'http' = 'https';
  const schemeMatch = rest.match(SCHEME_RE);
  if (schemeMatch) {
    scheme = schemeMatch[1].toLowerCase() === 'http' ? 'http' : 'https';
    rest = rest.slice(schemeMatch[0].length);
  }

  // Strip path / query / fragment — clone targets the origin.
  const authority = rest.split(/[/?#]/)[0] ?? '';
  // Strip credentials (user:pass@host) if present.
  let host = authority.includes('@') ? authority.split('@').pop() ?? '' : authority;
  host = host.toLowerCase().replace(/\.$/, '');
  if (host.startsWith('www.')) host = host.slice(4);

  if (!isValidHost(host)) {
    return {
      code: 'INVALID_HOST',
      message: `"${raw}" is not a valid domain. Accepted forms: https://…, http://…, www.…, or a bare domain.`,
    };
  }

  return { scheme, host };
}
