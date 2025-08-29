import axios, { AxiosError, AxiosHeaders, type AxiosRequestConfig } from 'axios';
import * as Sentry from '@sentry/vue';
import { useAuthStore } from '@/stores/auth';
import { bus } from '@/lib/bus';
import { env } from '@/lib/env';

export const http = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 15_000,
  maxRedirects: 0,
  withCredentials: true,
});

type RetryCfg = AxiosRequestConfig & {
  _retryCount?: number;
  _retryMax?: number;
  _csrfRetried?: boolean;
};

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split('; ')
    .find((x) => x.startsWith(name + '='))
    ?.split('=')[1];
}

function addCsrfHeader(cfg: AxiosRequestConfig) {
  const method = String(cfg.method || 'get').toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return;
  const token = getCookie('XSRF-TOKEN');
  if (!token) return;
  (cfg.headers as AxiosHeaders).set('X-CSRF-Token', decodeURIComponent(token));
}

function parseRetryAfter(v?: string | null): number | null {
  if (!v) return null;
  const s = Number(v);
  if (Number.isFinite(s)) return s * 1000;
  const d = Date.parse(v);
  return Number.isNaN(d) ? null : Math.max(0, d - Date.now());
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

http.interceptors.request.use((cfg) => {
  // Header’ları kesin AxiosHeaders yap
  cfg.headers = AxiosHeaders.from(cfg.headers ?? {});
  const h = cfg.headers as AxiosHeaders;

  const t = useAuthStore().accessToken;
  if (t) h.set('Authorization', `Bearer ${t}`);

  // Request-Id
  const rid =
    (globalThis.crypto as any)?.randomUUID?.() ??
    Math.random().toString(36).slice(2);
  h.set('X-Request-Id', rid);

  // Varsayılan retry tavanı
  (cfg as RetryCfg)._retryMax ??= 3;

  // CSRF
  addCsrfHeader(cfg);

  return cfg;
});

let refreshing: Promise<void> | null = null;

http.interceptors.response.use(undefined, async (err: AxiosError) => {
  const auth = useAuthStore();
  const cfg = (err.config ?? {}) as RetryCfg;
  const status = err.response?.status;
  const code = (err.response?.data as any)?.code;

  // CSRF süresi doldu → bir kez token yenile ve yeniden dene
  if (status === 419 && !cfg._csrfRetried) {
    cfg._csrfRetried = true;
    await http.get('/auth/csrf');
    addCsrfHeader(cfg);
    return http(cfg);
  }

  // 401 → refresh cookie ile access token yenile (revoked değilse)
  if (status === 401 && !cfg._retryCount && code !== 'revoked') {
    cfg._retryCount = 1;
    if (!refreshing) {
      refreshing = (async () => {
        try {
          const r = await http.post('/auth/refresh', null);
          const newAccess = (r.data as any)?.accessToken;
          if (newAccess) auth.setAccessToken(newAccess);
        } finally {
          refreshing = null;
        }
      })();
    }
    await refreshing;
    return http(cfg);
  }

  // Revoked → tüm oturumları kapat
  if (status === 401 && code === 'revoked') {
    await auth.logout(true);
    bus.emit('toast', { type: 'info', text: 'Oturum sonlandırıldı.' });
  }

  // GET retry politikası: 429 / 5xx / ağ hatası
  const method = String(cfg.method ?? 'get').toUpperCase();
  const isNetwork =
    err.code === 'ECONNABORTED' || (err.message ?? '').includes('Network');
  const shouldRetry = status === 429 || (status != null && status >= 500) || isNetwork;

  if (method === 'GET' && shouldRetry) {
    cfg._retryCount = (cfg._retryCount ?? 0) + 1;
    if (cfg._retryCount <= (cfg._retryMax ?? 3)) {
      const retryAfter = parseRetryAfter(
        (err.response?.headers as any)?.['retry-after'] as any
      );
      const base = retryAfter ?? 200 * 2 ** (cfg._retryCount - 1);
      const jitter = Math.floor(Math.random() * 100);
      await sleep(Math.min(base + jitter, 5000));
      return http(cfg);
    }
  }

  // Log + kullanıcı bildirimi
  Sentry.captureException(err);
  const msg =
    (err.response?.data as any)?.message ?? err.message ?? 'İstek hatası';
  bus.emit('toast', { type: 'error', text: String(msg) });

  return Promise.reject(err);
});
