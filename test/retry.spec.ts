import { http } from '@/services/http';
import axios from 'axios';
import { describe, it, expect, vi } from 'vitest';

it('retries GET on 503 with Retry-After', async () => {
  const spy = vi.spyOn(axios.Axios.prototype, 'request' as any);
  // 1) 503
  spy.mockRejectedValueOnce({ config:{ method:'get' }, response:{ status:503, headers:{ 'retry-after':'0' } }, message:'503' });
  // 2) success
  spy.mockResolvedValueOnce({ data:{ ok:true } });
  const r = await http.get('/x');
  expect(r.data.ok).toBe(true);
  spy.mockRestore();
});
