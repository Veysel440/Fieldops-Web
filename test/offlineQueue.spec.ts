import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, vi } from 'vitest';
import { useOfflineQueue } from '@/stores/offlineQueue';
import { http } from '@/services/http';

vi.mock('@/services/http', () => ({ http: { request: vi.fn().mockResolvedValue({}) , post: vi.fn().mockResolvedValue({}) } }));
vi.stubGlobal('navigator', { onLine: true, serviceWorker: { ready: Promise.resolve({ sync: { register: vi.fn() } }) } });

describe('offlineQueue', () => {
  it('enqueues and processes', async () => {
    setActivePinia(createPinia());
    const q = useOfflineQueue();
    q.enqueue({ req: { url:'/work-orders', method:'POST', data:{ a:1 } } });
    expect(q.size).toBe(1);
    await q.processAll();
    expect(q.size).toBe(0);
  });
});
