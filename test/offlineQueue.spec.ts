import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useOfflineQueue } from '@/stores/offlineQueue';


const httpReq = vi.fn().mockResolvedValue({ data: {} });
const httpPost = vi.fn().mockResolvedValue({ data: {} });
vi.mock('@/services/http', () => ({ http: { request: httpReq, post: httpPost } }));

const files = new Map<string, Blob>();
const idb = {
  set: vi.fn((k: string, v: any) => { files.set(k, v); return Promise.resolve(); }),
  get: vi.fn((k: string) => Promise.resolve(files.get(k))),
  del: vi.fn((k: string) => { files.delete(k); return Promise.resolve(); }),
};
vi.mock('idb-keyval', () => idb);

vi.stubGlobal('navigator', {
  onLine: true,
  serviceWorker: {
    ready: Promise.resolve({ sync: { register: vi.fn() }, controller: { postMessage: vi.fn() } }),
  },
});

beforeEach(() => {
  setActivePinia(createPinia());
  httpReq.mockClear(); httpPost.mockClear();
  idb.set.mockClear(); idb.get.mockClear(); idb.del.mockClear();
  files.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('offlineQueue', () => {
  it('enqueue → processAll (normal isteği gönderir ve temizler)', async () => {
    const q = useOfflineQueue();
    await q.load();

    await q.enqueue({ req: { url: '/work-orders', method: 'POST', data: { a: 1 } } });
    expect(q.size).toBe(1);

    await q.processAll();

    expect(httpReq).toHaveBeenCalledTimes(1);
    const args = httpReq.mock.calls[0][0];
    expect(args.url).toBe('/work-orders');
    expect(args.method).toBe('POST');
    expect(args.data).toEqual({ a: 1 });
    expect(q.size).toBe(0);
  });

  it('enqueueUpload → processAll (FormData ile upload eder ve IDB temizlenir)', async () => {
    const q = useOfflineQueue();
    await q.load();

    const file = new File([new Blob(['x'])], 'a.txt', { type: 'text/plain' });
    await q.enqueueUpload({ entity: 'workOrder', id: 7 }, file);

    expect(q.size).toBe(1);
    expect(idb.set).toHaveBeenCalledTimes(1);

    await q.processAll();

    expect(httpPost).toHaveBeenCalledTimes(1);
    const [url, body] = httpPost.mock.calls[0];
    expect(url).toBe('/attachments');
    expect(body).toBeInstanceOf(FormData);

    const fd = body as FormData;
    const names = Array.from(fd.keys());
    expect(names).toEqual(expect.arrayContaining(['file', 'entity', 'id']));
    expect(q.size).toBe(0);
    expect(idb.del).toHaveBeenCalledTimes(1);
  });
});
