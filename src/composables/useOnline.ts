import { ref, readonly, onMounted, onUnmounted } from 'vue';

type Opts = {
  probeUrl?: string;
  intervalMs?: number;
  timeoutMs?: number;
};

export function useOnline(opts: Opts = {}) {
  const isClient = typeof window !== 'undefined' && typeof navigator !== 'undefined';
  const online = ref<boolean>(isClient ? navigator.onLine : true);

  const sync = () => { if (isClient) online.value = navigator.onLine; };

  let timer: number | undefined;

  async function probe() {
    if (!isClient || !opts.probeUrl) return;
    const controller = new AbortController();
    const t = window.setTimeout(() => controller.abort(), opts.timeoutMs ?? 4000);
    try {
      await fetch(opts.probeUrl, {
        method: 'HEAD',
        cache: 'no-store',
        credentials: 'omit',
        mode: 'no-cors',
        signal: controller.signal,
      });
      if (!online.value && navigator.onLine) online.value = true;
    } catch {
      // Probe fail → online’ı doğrudan false’a çekme.
      // Captive portal vb. durumlarda yanlış negatif olmaması için yalnızca sync()’e güven.
    } finally {
      clearTimeout(t);
    }
  }

  function waitUntilOnline(): Promise<void> {
    if (online.value) return Promise.resolve();
    return new Promise((res) => {
      const listener = () => {
        sync();
        if (navigator.onLine) {
          window.removeEventListener('online', listener);
          res();
        }
      };
      window.addEventListener('online', listener, { once: true });
    });
  }

  onMounted(() => {
    window.addEventListener('online', sync, { passive: true });
    window.addEventListener('offline', sync, { passive: true });
    document.addEventListener('visibilitychange', sync as any, { passive: true } as any);

    if (opts.intervalMs && opts.probeUrl) {
      timer = window.setInterval(probe, opts.intervalMs) as unknown as number;
    }
  });

  onUnmounted(() => {
    window.removeEventListener('online', sync);
    window.removeEventListener('offline', sync);
    document.removeEventListener('visibilitychange', sync as any);
    if (timer) window.clearInterval(timer);
  });

  return {
    online: readonly(online),
    probe,
    waitUntilOnline,
  };
}
