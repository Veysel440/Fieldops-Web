import { expect, vi } from 'vitest';
import { axe } from 'vitest-axe';
import type { AxeResults } from 'axe-core';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (q: string) => ({
    matches: false,
    media: q,
    onchange: null as ((ev: MediaQueryListEvent) => void) | null,
    addListener(_: (ev: MediaQueryListEvent) => void): void {},
    removeListener(_: (ev: MediaQueryListEvent) => void): void {},
    addEventListener(_: string, __: EventListener): void {},
    removeEventListener(_: string, __: EventListener): void {},
    dispatchEvent(_: Event): boolean { return false; },
  }),
});

class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock as unknown as typeof ResizeObserver);

class IntersectionObserverMock {
  constructor(_: IntersectionObserverCallback, __?: IntersectionObserverInit) {}
  observe(_: Element): void {}
  unobserve(_: Element): void {}
  disconnect(): void {}
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock as unknown as typeof IntersectionObserver);

if (!(globalThis as any).crypto?.randomUUID) {
  (globalThis as any).crypto = {
    ...(globalThis as any).crypto,
    randomUUID: () => Math.random().toString(36).slice(2),
  };
}


declare module 'vitest' {
  interface Assertion<T = any> { toHaveNoViolations(): Promise<void> }
  interface AsymmetricMatchersContaining { toHaveNoViolations(): void }
}

expect.extend({
  async toHaveNoViolations(received: unknown) {
    const results: AxeResults =
      typeof HTMLElement !== 'undefined' && received instanceof HTMLElement
        ? await axe(received)
        : (received as AxeResults);

    const violations = results.violations ?? [];
    const pass = violations.length === 0;

    const msg =
      violations.map((v: AxeResults['violations'][number]) => {
        const nodes = v.nodes.map((n) => `  • ${n.target.join(' ')}`).join('\n');
        return `${v.id}: ${v.help}\n${nodes}`;
      }).join('\n\n') || 'No accessibility violations';

    return { pass, message: () => (pass ? msg : `Axe violations:\n${msg}`) };
  },
});


vi.mock('@/stores/pinia', async () => {
  const { createPinia } = await import('pinia');
  const pinia = createPinia();
  return { pinia };
});

vi.mock('@/stores/auth', async () => {
  const { defineStore } = await import('pinia');
  const useAuthStore = defineStore('auth', {
    state: () => ({
      isAuthed: false as boolean,
      role: null as null | string,
      accessToken: '' as string,
      user: null as any,
    }),
    actions: {
      async login() { this.isAuthed = true; this.accessToken = 'test'; this.role ??= 'admin'; },
      async logout() { this.isAuthed = false; this.accessToken = ''; this.role = null; this.user = null; },
      setAccessToken(t: string) { this.accessToken = t; this.isAuthed = !!t; },
    },
  });
  return { useAuthStore };
});


vi.mock('@/lib/bus', () => {
  const listeners = new Map<string, Set<Function>>();
  return {
    bus: {
      on(ev: string, cb: Function) {
        if (!listeners.has(ev)) listeners.set(ev, new Set());
        listeners.get(ev)!.add(cb);
      },
      off(ev: string, cb: Function) { listeners.get(ev)?.delete(cb); },
      emit(ev: string, payload: unknown) { listeners.get(ev)?.forEach(cb => cb(payload)); },
      clear() { listeners.clear(); },
      all: { clear() { listeners.clear(); } },
    },
  };
});
