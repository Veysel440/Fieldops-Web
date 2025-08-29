import { http } from './http';
import { WorkOrder as WorkOrderSchema } from '@/schemas';
import type { z } from 'zod';

export async function getWorkOrder(id: number) {
  const { data } = await http.get(`/work-orders/${id}`);
  return WorkOrderSchema.parse(data);
}

export async function patchWorkOrder(body: Partial<WorkOrder> & { id: number }) {
  const { data } = await http.patch(`/work-orders/${body.id}`, body, { conditional: true });
  return WorkOrderSchema.parse(data);
}


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
