import { describe, it, expect, vi } from 'vitest';
import * as assetsSvc from '@/services/assets';
import { http } from '@/services/http';

vi.spyOn(http, 'get').mockResolvedValue({ data: { data: [{ id: 1, code: 123 }], total: 1 } as any });

describe('services: zod parse', () => {
  it('assets -> parse hatasında throw', async () => {
    await expect(assetsSvc.listAssets({} as any)).rejects.toThrow(/Invalid/);
  });
});
