import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig
} from 'axios';
import * as Sentry from '@sentry/vue';
import { useAuthStore } from '@/stores/auth';
import { bus } from '@/lib/bus';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  maxRedirects: 0
});

type RetryCfg = AxiosRequestConfig & { _retryCount?: number; _retryMax?: number };

http.interceptors.request.use((cfg) => {
  cfg.headers = AxiosHeaders.from(cfg.headers ?? {});
  const headers = cfg.headers as AxiosHeaders;

  const t = useAuthStore().tokens?.accessToken;
  if (t) headers.set('Authorization', `Bearer ${t}`);
  headers.set(
    'X-Request-Id',
    (crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2)
  );

  (cfg as RetryCfg)._retryMax = (cfg as RetryCfg)._retryMax ?? 3;
  return cfg;
});

let refreshing: Promise<void> | null = null;

function parseRetryAfter(v?: string | null): number | null {
  if (!v) return null;
  const s = Number(v);
  if (Number.isFinite(s)) return s * 1000;
  const d = Date.parse(v);
  return Number.isNaN(d) ? null : Math.max(0, d - Date.now());
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

http.interceptors.response.use(undefined, async (err: AxiosError) => {
  const auth = useAuthStore();
  const cfg = (err.config ?? {}) as RetryCfg;
  const status = err.response?.status;

  if (status === 401 && !cfg._retryCount && auth.tokens?.refreshToken) {
    if (!refreshing) refreshing = auth.tryRefresh().finally(() => (refreshing = null));
    await refreshing;
    return http(cfg);
  }

  const method = String(cfg.method ?? 'get').toUpperCase();
  const shouldRetryStatus = status === 429 || (status != null && status >= 500);
  const isNetwork = err.code === 'ECONNABORTED' || (err.message ?? '').includes('Network');

  if (method === 'GET' && (shouldRetryStatus || isNetwork)) {
    cfg._retryCount = (cfg._retryCount ?? 0) + 1;
    if (cfg._retryCount <= (cfg._retryMax ?? 3)) {
      const retryAfter = parseRetryAfter(err.response?.headers?.['retry-after'] as any);
      const base = retryAfter ?? 200 * 2 ** (cfg._retryCount - 1);
      const jitter = Math.floor(Math.random() * 100);
      await sleep(Math.min(base + jitter, 5000));
      return http(cfg);
    }
  }

  Sentry.captureException(err);
  const msg = (err.response?.data as any)?.message ?? err.message ?? 'İstek hatası';
  bus.emit('toast', { type: 'error', text: msg });
  return Promise.reject(err);
});
