import type { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { normalizeAxiosError } from '@/lib/http-error';

function makeErr(opts: {
  status?: number;
  data?: unknown;
  code?: string;
  message?: string;
  withResponse?: boolean;
}): AxiosError {
  const config: AxiosRequestConfig = {};

  const resp: AxiosResponse | undefined =
    opts.withResponse === false
      ? undefined
      : ({
        data: opts.data ?? {},
        status: opts.status ?? 0,
        statusText: '',
        headers: {} as any,
        config,
        request: {} as any,
      } as AxiosResponse);

  return {
    name: 'AxiosError',
    message: opts.message ?? 'x',
    config,
    isAxiosError: true,
    toJSON: () => ({}),
    code: opts.code,
    response: resp,
  } as AxiosError;
}

describe('normalizeAxiosError', () => {
  it.each([
    [{ status: 409 }, 'conflict'],
    [{ status: 412 }, 'conflict'],
    [{ status: 429 }, 'rate_limited'],
    [{ status: 500 }, 'server'],
    [{ status: 503 }, 'server'],
    [{ status: 401 }, 'unauthorized'],
    [{ status: 403 }, 'forbidden'],
    [{ status: 404 }, 'not_found'],
    [{ status: 400 }, 'bad_request'],
  ] as const)('%j -> %s', (input, code) => {
    const n = normalizeAxiosError(makeErr(input));
    expect(n.code).toBe(code);
    expect(n.status).toBe(input.status);
    expect(typeof n.message).toBe('string');
  });

  it('network hatası -> network', () => {
    const n1 = normalizeAxiosError(makeErr({ withResponse: false, code: 'ECONNABORTED', message: 'timeout' }));
    const n2 = normalizeAxiosError(makeErr({ withResponse: false, message: 'Network Error' }));
    expect(n1.code).toBe('network');
    expect(n2.code).toBe('network');
  });

  it('mesaj önceliği: data.message > data.error > err.message', () => {
    const a = normalizeAxiosError(makeErr({ status: 400, data: { message: 'm' }, message: 'x' }));
    const b = normalizeAxiosError(makeErr({ status: 400, data: { error: 'e' }, message: 'x' }));
    const c = normalizeAxiosError(makeErr({ status: 400, data: {}, message: 'x' }));
    expect(a.message).toBe('m');
    expect(b.message).toBe('e');
    expect(c.message).toBe('x');
  });

  it('details alanı: data.details | data.errors | data', () => {
    const d1 = normalizeAxiosError(makeErr({ status: 422, data: { details: { f: ['x'] } } }));
    const d2 = normalizeAxiosError(makeErr({ status: 422, data: { errors: { f: ['y'] } } }));
    const d3 = normalizeAxiosError(makeErr({ status: 418, data: { any: 1 } }));
    expect(d1.details).toEqual({ f: ['x'] });
    expect(d2.details).toEqual({ f: ['y'] });
    expect(d3.details).toEqual({ any: 1 });
  });

  it('unknown: response yok ve eşleşme yoksa', () => {
    const n = normalizeAxiosError(makeErr({ withResponse: false, message: 'weird' }));
    expect(n.code === 'unknown' || n.code === 'network').toBeTruthy();
  });
});
