import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

export const http = axios.create({ baseURL: import.meta.env.VITE_API_URL });

http.interceptors.request.use((cfg) => {
  const t = useAuthStore().tokens?.accessToken;
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

let refreshing: Promise<void> | null = null;
http.interceptors.response.use(undefined, async (err) => {
  const auth = useAuthStore();
  const orig = err.config;
  if (err.response?.status === 401 && !orig._retry && auth.tokens?.refreshToken) {
    orig._retry = true;
    if (!refreshing) refreshing = auth.tryRefresh().finally(() => (refreshing = null));
    await refreshing;
    return http(orig);
  }
  return Promise.reject(err);
});
