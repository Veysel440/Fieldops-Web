/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;
type Ctx = { url: URL; request: Request; event: ExtendableEvent };

// App-shell
self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST as any);

// SPA navigation fallback
registerRoute(new NavigationRoute(async () => fetch('/index.html')));

// API GET cache (aynı origin /api/**)
registerRoute(
  ({ url, request }: Ctx) =>
    url.origin === self.location.origin &&
    url.pathname.startsWith('/api') &&
    request.method === 'GET',
  new StaleWhileRevalidate({
    cacheName: 'api-get',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 3600 }),
    ],
  }),
);

// MapLibre demotiles
registerRoute(
  ({ url }: Ctx) => url.hostname.includes('demotiles.maplibre.org'),
  new CacheFirst({
    cacheName: 'map-tiles',
    plugins: [new ExpirationPlugin({ maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 7 })],
  }),
);

// BG Sync tetikleyici: client kuyruğunu çalıştır
async function notifyClients() {
  const all = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  for (const c of all) c.postMessage({ type: 'FIELDOPS_SYNC' });
}

self.addEventListener('sync', (e: any) => {
  if (e.tag === 'fieldops-sync') e.waitUntil(notifyClients());
});
self.addEventListener('periodicsync', (e: any) => {
  if (e.tag === 'fieldops-periodic') e.waitUntil(notifyClients());
});
