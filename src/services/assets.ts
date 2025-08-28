import type { z } from 'zod';
import { http } from './http';
import { Asset as AssetSchema, PageOf } from '@/schemas';

export type Asset = z.infer<typeof AssetSchema>;

const Page = PageOf(AssetSchema);

export async function listAssets(params: { page?: number; q?: string; size?: number } = {}) {
  const { data } = await http.get('/assets', { params });
  return Page.parse(data);
}

export async function createAsset(b: Omit<Asset, 'id' | 'createdAt'>) {
  const { data } = await http.post('/assets', b);
  return AssetSchema.parse(data);
}
