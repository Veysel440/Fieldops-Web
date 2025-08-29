import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import localforage from 'localforage';

import App from './App.vue';
import router from './router';
import { i18n } from './i18n';
import { queryClient } from '@/lib/queryClient';
import { vRole } from '@/directives/role';
import { registerSW } from 'virtual:pwa-register';
import { useOfflineQueue, setupOfflineQueue } from '@/stores/offlineQueue';
import { useAuthStore } from '@/stores/auth';
import { bus } from '@/lib/bus';
import { ch } from '@/lib/channel';
import { normalizeAxiosError } from '@/lib/http-error';
import '@/styles/a11y.css';

localforage.config({ name: 'fieldops', storeName: 'tq-cache' });

const app = createApp(App);

app.config.errorHandler = (e) => {
  const text = (() => {
    try { return normalizeAxiosError(e as any).message; }
    catch { return (e as any)?.message ?? 'Hata'; }
  })();
  bus.emit('toast', { type: 'error', text });
};

app.use(createPinia());
app.use(VueQueryPlugin, { queryClient });
app.use(router);
app.use(i18n);
app.directive('role', vRole);


persistQueryClient({
  queryClient,
  persister: createAsyncStoragePersister({ storage: localforage }),
  maxAge: 1000 * 60 * 60,
});

setupOfflineQueue();

ch.on((msg) => {
  if (msg.type === 'FIELDOPS_SYNC') useOfflineQueue().processAll();
  else if (msg.type === 'FIELDOPS_INVALIDATE') queryClient.invalidateQueries({ queryKey: msg.key });
  else if (msg.type === 'LOGOUT') useAuthStore().logout(true);
});


const updateSW = registerSW({
  immediate: true,
  onNeedRefresh: () =>
    bus.emit('toast', { type: 'info', text: 'Yeni sürüm hazır. Yenile için tıkla.', action: () => updateSW(true) }),
});


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (ev) => {
    const t = ev.data?.type;
    if (t === 'FIELDOPS_SYNC') useOfflineQueue().processAll();
    if (t === 'FIELDOPS_INVALIDATE' && Array.isArray(ev.data.key)) {
      queryClient.invalidateQueries({ queryKey: ev.data.key });
    }
  });
}

app.mount('#app');

(window as any).FieldOpsUpdate = () => updateSW(true);
