export type ToastPayload = {
  type: 'success' | 'error' | 'info';
  text: string;
  action?: () => void;
  actionLabel?: string;
  durationMs?: number;
};

export type Events = {
  toast: ToastPayload;
  invalidate: { key: Array<string | number> };
  update: { available: true };
};

type Handler<E> = (event: E) => void;

export interface TypedBus<T extends Record<string, any>> {
  on<K extends keyof T & string>(type: K, handler: Handler<T[K]>): void;
  off<K extends keyof T & string>(type: K, handler: Handler<T[K]>): void;
  emit<K extends keyof T & string>(type: K, event: T[K]): void;
  once<K extends keyof T & string>(type: K, handler: Handler<T[K]>): void;
  /** Clear all listeners */
  clear(): void;
  /** Backward compatibility for old code: bus.all.clear() */
  all: { clear(): void };
}

function createBus<T extends Record<string, any>>(): TypedBus<T> {
  const listeners = new Map<string, Set<Function>>();

  function ensure(type: string) {
    let set = listeners.get(type);
    if (!set) { set = new Set(); listeners.set(type, set); }
    return set;
  }

  function on<K extends keyof T & string>(type: K, handler: Handler<T[K]>) {
    ensure(type).add(handler as any);
  }

  function off<K extends keyof T & string>(type: K, handler: Handler<T[K]>) {
    listeners.get(type)?.delete(handler as any);
  }

  function emit<K extends keyof T & string>(type: K, event: T[K]) {
    const set = listeners.get(type);
    if (!set) return;
    for (const fn of Array.from(set)) {
      try { (fn as Handler<T[K]>)(event); } catch { /* swallow */ }
    }
  }

  function once<K extends keyof T & string>(type: K, handler: Handler<T[K]>) {
    const wrap: Handler<T[K]> = (e) => { off(type, wrap); handler(e); };
    on(type, wrap);
  }

  function clear() { listeners.clear(); }

  return { on, off, emit, once, clear, all: { clear } };
}

export const bus = createBus<Events>();
