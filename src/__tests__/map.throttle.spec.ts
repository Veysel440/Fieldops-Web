import { describe, it, expect, vi } from 'vitest';
import { throttle } from '@/lib/throttle';

describe('bbox throttle', () => {
  it('çok çağrıyı tek çalıştırmaya indirger', async () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const t = throttle(spy, 200);
    t(1); t(2); t(3);
    expect(spy).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(210);
    expect(spy).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
