import { describe, it, expect, vi } from 'vitest';
import * as customers from '@/services/customers';
import { http } from '@/services/http';

vi.mock('@/services/http', () => ({
  http: { get: vi.fn() }
}));

describe('customers.listCustomers', () => {
  it('parses response with zod', async () => {
    (http.get as any).mockResolvedValueOnce({ data: { data: [{ id:1, name:'Acme', createdAt:'2025-01-01' }], total:1 } });
    const r = await customers.listCustomers({ page:1 });
    expect(r.data[0].name).toBe('Acme');
  });

  it('throws on invalid payload', async () => {
    (http.get as any).mockResolvedValueOnce({ data: { wrong: true } });
    await expect(customers.listCustomers({} as any)).rejects.toBeTruthy();
  });
});
