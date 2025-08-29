import type { AxiosResponse, Method } from 'axios';

type Version = { etag?: string; lastModified?: string };
const map = new Map<string, Version>();

function keyFromUrl(url?: string): string | null {
  if (!url) return null;
  const u = url.split('?')[0];
  return u;
}

export function captureVersion(resp: AxiosResponse<any>): void {
  const url = keyFromUrl(resp.config.url);
  if (!url) return;
  const etag = resp.headers?.etag as string | undefined;
  const lm = resp.headers?.['last-modified'] as string | undefined;
  if (!etag && !lm) return;
  const v = map.get(url) ?? {};
  if (etag) v.etag = etag;
  if (lm) v.lastModified = lm;
  map.set(url, v);
}

export function conditionalHeadersFor(url?: string, method?: Method): Record<string,string> {
  if (!url) return {};
  const m = String(method || '').toUpperCase();
  if (!['PATCH','PUT','DELETE'].includes(m)) return {};
  const v = map.get(keyFromUrl(url) as string);
  if (!v) return {};
  if (v.etag) return { 'If-Match': v.etag };
  if (v.lastModified) return { 'If-Unmodified-Since': v.lastModified };
  return {};
}
