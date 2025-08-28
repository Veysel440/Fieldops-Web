import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import router from './router';
import { i18n } from './i18n';
import App from './App.vue';
import { queryClient } from './lib/queryClient';
import { vRole } from './directives/role';
import { registerSW } from 'virtual:pwa-register';
import { useOfflineQueue } from '@/stores/offlineQueue';
import { bus } from '@/lib/bus';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh: () => bus.emit('toast', { type:'info', text:'Yeni sürüm hazır. Yenile için tıkla.' }),
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

persistQueryClient({
  queryClient,
  persister: createSyncStoragePersister({ storage: window.localStorage }),
  maxAge: 1000 * 60 * 60,
});

const app = createApp(App);
app.use(createPinia());
app.use(VueQueryPlugin, { queryClient });
app.use(router);
app.use(i18n);
app.directive('role', vRole);
app.mount('#app');


(window as any).FieldOpsUpdate = () => updateSW(true);
