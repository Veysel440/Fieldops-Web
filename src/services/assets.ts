import { http } from './http';
export type Asset = { id:number; code:string; name:string; customerId:number; lat?:number; lng?:number; createdAt:string };

export async function listAssets(params: { page?: number; q?: string } = {}) {
  const { data } = await http.get('/assets', { params });
  return data as { data: Asset[]; total: number };
}
export async function createAsset(b: Omit<Asset,'id'|'createdAt'>) {
  const { data } = await http.post('/assets', b); return data as Asset;
}
