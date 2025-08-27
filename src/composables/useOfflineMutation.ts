import { useMutation } from '@tanstack/vue-query';
import type { UseMutationOptions } from '@tanstack/vue-query';
import { useOfflineQueue } from '@/stores/offlineQueue';
import { http } from '@/services/http';

type Method = 'POST'|'PUT'|'PATCH'|'DELETE';
type Opt<T> = UseMutationOptions<T, unknown, any, unknown>;

export function useOfflineMutation<T>(url: string, method: Method, invalidate?: (string|number)[], opt?: Opt<T>) {
  const queue = useOfflineQueue();
  const m = useMutation<T, unknown, any>({
    mutationFn: async (data: any) => {
      if (!navigator.onLine) {
        queue.enqueue({ req: { url, method, data }, invalidate: invalidate as string[] });

        return { queued: true, ...data } as unknown as T;
      }
      const { data: res } = await http.request<T>({ url, method, data });
      return res;
    },
    ...opt
  });
  return m;
}
