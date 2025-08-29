import type { AxiosError } from 'axios';

export type NormalizedError = {
  code: string;
  message: string;
  status?: number;
  details?: any;
};

export function normalizeAxiosError(err: AxiosError): NormalizedError {
  const status = err.response?.status;
  const data: any = err.response?.data ?? {};
  const code =
    status === 401 ? 'unauthorized' :
      status === 403 ? 'forbidden' :
        status === 404 ? 'not_found' :
          status === 409 || status === 412 ? 'conflict' :
            status === 429 ? 'rate_limited' :
              status && status >= 500 ? 'server' :
                err.code === 'ECONNABORTED' || (err.message ?? '').includes('Network') ? 'network' :
                  status && status >= 400 ? 'bad_request' :
                    'unknown';

  const msg =
    data.message ?? data.error ?? err.message ?? 'İstek hatası';
  const details = data.details ?? data.errors ?? data;

  return { code, message: String(msg), status, details };
}
