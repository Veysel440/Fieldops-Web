import { http } from './http';

export type WorkOrder = {
  id: number; code: string; status: 'open'|'in_progress'|'done';
  customerId: number; assetId?: number; title: string; desc?: string;
  lat?: number; lng?: number; createdAt: string;
};

export async function listWorkOrders(params: { page?: number; q?: string }) {
  const { data } = await http.get('/work-orders', { params });
  return data as { data: WorkOrder[]; total: number };
}

export async function createWorkOrder(body: Omit<WorkOrder, 'id'|'createdAt'>) {
  const { data } = await http.post('/work-orders', body);
  return data as WorkOrder;
}
