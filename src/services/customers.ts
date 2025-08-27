import { http } from './http';
export type Customer = { id:number; name:string; phone?:string; email?:string; address?:string; createdAt:string };

export async function listCustomers(params: { page?: number; q?: string } = {}) {
  const { data } = await http.get('/customers', { params });
  return data as { data: Customer[]; total: number };
}
export async function createCustomer(b: Omit<Customer,'id'|'createdAt'>) {
  const { data } = await http.post('/customers', b); return data as Customer;
}
