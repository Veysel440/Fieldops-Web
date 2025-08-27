import { http } from './http';

export type Tokens = { accessToken: string; refreshToken: string };
export type User = { id: number; name: string; email: string; role: 'admin'|'tech'|'viewer' };

export async function loginApi(body: { email: string; password: string }): Promise<Tokens> {
  const { data } = await http.post('/auth/login', body); return data;
}
export async function meApi(): Promise<User> {
  const { data } = await http.get('/auth/me'); return data;
}
export async function refreshApi(refreshToken: string): Promise<Tokens> {
  const { data } = await http.post('/auth/refresh', { refreshToken }); return data;
}
export async function logoutApi(): Promise<void> { await http.post('/auth/logout'); }
