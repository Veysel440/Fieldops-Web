import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any[] };

// app-shell
self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

// offline sayfayı da precache’e ekle
self.__WB_MANIFEST = (self.__WB_MANIFEST || []);
self.__WB_MANIFEST.push({ url: '/offline.html', revision: null });
precacheAndRoute(self.__WB_MANIFEST as any);

// SPA navigation fallback: online index, olmazsa offline
registerRoute(new NavigationRoute(async () => {
  try {
    return await fetch('/index.html', { cache: 'no-store' });
  } catch {
    const c = await caches.open('workbox-precache-v2');
    const res = await c.match('/offline.html');
    return res ?? new Response('Offline', { status: 503 });
  }
}));

// API GET cache
registerRoute(
  ({ url, request }) => url.origin === self.location.origin && url.pathname.startsWith('/api') && request.method === 'GET',
  new StaleWhileRevalidate({
    cacheName: 'api-get',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] }), new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 3600 })]
  })
);

// MapLibre tiles
registerRoute(
  ({ url }) => url.hostname.includes('demotiles.maplibre.org'),
  new CacheFirst({ cacheName: 'map-tiles', plugins: [new ExpirationPlugin({ maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 7 })] })
);

// Client’lara kuyruğu tetikle sinyali
async function notifyClients() {
  const all = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  for (const c of all) c.postMessage({ type: 'FIELDOPS_SYNC' });
}

self.addEventListener('sync', (e: any) => { if (e.tag === 'fieldops-sync') e.waitUntil(notifyClients()); });
self.addEventListener('periodicsync', (e: any) => { if (e.tag === 'fieldops-periodic') e.waitUntil(notifyClients()); });
