import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http } from '@/services/http';

type Cfg = { method?: string; url?: string };

describe('http retry policy', () => {
  let reqSpy: ReturnType<typeof vi.spyOn>;
  let rndSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    rndSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    reqSpy = vi.spyOn(http as any, 'request');
  });

  afterEach(() => {
    reqSpy.mockRestore();
    rndSpy.mockRestore();
    vi.useRealTimers();
  });

  it('GET 503 + Retry-After=0 → tek retry ve başarı', async () => {
    let calls = 0;

    reqSpy.mockImplementation(async (cfg: any) => {
      calls++;
      if (calls === 1) {
        const err: any = new Error('503');
        err.isAxiosError = true;
        err.config = { ...(cfg || {}), method: 'get' };
        err.response = { status: 503, headers: { 'retry-after': '0' } };
        throw err;
      }
      return { data: { ok: true }, status: 200, statusText: '', headers: {}, config: cfg };
    });

    const p = http.get('/x');
    await vi.runAllTimersAsync();
    const res = await p;

    expect(calls).toBe(2);
    expect(res.data.ok).toBe(true);

    const firstCfg = (reqSpy.mock.calls[0]?.[0] ?? {}) as Cfg;
    const secondCfg = (reqSpy.mock.calls[1]?.[0] ?? {}) as Cfg;

    expect(String(firstCfg.method ?? 'get').toLowerCase()).toBe('get');
    expect(secondCfg.url).toBe(firstCfg.url);
  });
});
