import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { normalizeAxiosError } from '@/lib/http-error';

function makeErr(opts: {
  status: 409 | 412;
  data?: unknown;
  message?: string;
}): AxiosError {
  const config: AxiosRequestConfig = {};
  const response = {
    data: opts.data ?? {},
    status: opts.status,
    statusText: '',
    headers: {} as any,
    config,
    request: {} as any,
  } as AxiosResponse;

  return {
    name: 'AxiosError',
    message: opts.message ?? 'x',
    config,
    isAxiosError: true,
    toJSON: () => ({}),
    response,
  } as AxiosError;
}

describe('WorkOrder conflict handling', () => {
  it.each<[409 | 412, string]>([
    [409, 'Revision mismatch'],
    [412, 'Precondition failed'],
  ])('%s -> conflict, mesaj korunur', (status, msg) => {
    const n = normalizeAxiosError(makeErr({ status, data: { message: msg } }));
    expect(n.code).toBe('conflict');
    expect(n.status).toBe(status);
    expect(n.message).toContain(msg);
  });

  it('details alanı aktarılır (ör. etag karşılaştırması)', () => {
    const details = { currentEtag: 'W/"abc"', yourEtag: 'W/"def"' };
    const n = normalizeAxiosError(makeErr({ status: 409, data: { details } }));
    expect(n.code).toBe('conflict');
    expect(n.details).toEqual(details);
    expect(typeof n.message).toBe('string');
  });

  it('body.message yoksa err.message’a düşer', () => {
    const n = normalizeAxiosError(makeErr({ status: 409, data: {} as any, message: 'conflict' }));
    expect(n.message).toBe('conflict');
  });
});
