import { beforeAll } from 'vitest';


beforeAll(() => {
  (global as any).navigator = { onLine: true, serviceWorker: { ready: Promise.resolve({}), addEventListener(){} } };
  (global as any).window = { localStorage, addEventListener(){} } as any;
});
let vi;
vi.stubGlobal('navigator', { onLine: true, serviceWorker: { ready: Promise.resolve({ sync:{ register: vi.fn() } }), addEventListener: ()=>{} } });
vi.stubGlobal('window', { localStorage, addEventListener: ()=>{} } as any);
