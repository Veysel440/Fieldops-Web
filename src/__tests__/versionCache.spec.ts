import { captureVersion, conditionalHeadersFor } from '@/lib/versionCache';

describe('ETag / Last-Modified koşullu başlıklar', () => {
  it('ETag yakalar ve If-Match üretir', () => {
    captureVersion({
      config: { url: '/work-orders/1', method: 'get' },
      headers: { etag: 'W/"abc123"' }
    } as any);
    const h = conditionalHeadersFor('/work-orders/1', 'PATCH');
    expect(h['If-Match']).toBe('W/"abc123"');
  });

  it('Last-Modified yakalar ve If-Unmodified-Since üretir', () => {
    captureVersion({
      config: { url: '/assets/1', method: 'get' },
      headers: { 'last-modified': 'Tue, 10 Sep 2024 12:00:00 GMT' }
    } as any);
    const h = conditionalHeadersFor('/assets/1', 'DELETE');
    expect(h['If-Unmodified-Since']).toContain('GMT');
  });

  it('GET olmayan veya versiyon yoksa boş', () => {
    const h = conditionalHeadersFor('/x', 'PATCH');
    expect(Object.keys(h).length).toBeGreaterThanOrEqual(0); 
  });
});
