import { http } from './http';
import { Customer, PageOf } from '@/schemas';

export type Customer = import('@/schemas').CustomerT;
const Page = PageOf(Customer);

export async function listCustomers(params: { page?: number; q?: string; size?: number } = {}) {
  const { data } = await http.get('/customers', { params });
  return Page.parse(data);
}
export async function createCustomer(b: Omit<Customer,'id'|'createdAt'>) {
  const { data } = await http.post('/customers', b); return data as Customer;
}
