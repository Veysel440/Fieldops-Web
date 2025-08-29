import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, vi } from 'vitest';
import { useOfflineQueue } from '@/stores/offlineQueue';
vi.mock('idb-keyval', ()=>({ set: vi.fn(), get: vi.fn().mockResolvedValue([]), del: vi.fn() }));

vi.mock('@/services/http', ()=>({ http:{ request: vi.fn().mockRejectedValue(new Error('net')), post: vi.fn() } }));

vi.stubGlobal('navigator', { onLine: true, serviceWorker: { ready: Promise.resolve({}) } });

describe('offline queue retry cap (tek pass, sırada kalır)', () => {
  it('processAll hata → öğe sırada bırakılır ve loop olmaz', async () => {
    setActivePinia(createPinia());
    const q = useOfflineQueue();
    await q.load();
    await q.enqueue({ req:{ url:'/wo', method:'POST', data:{a:1} } });
    expect(q.size).toBe(1);
    await q.processAll();
    expect(q.size).toBe(1);
  });
});
