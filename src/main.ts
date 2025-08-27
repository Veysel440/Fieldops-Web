import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import router from './router';
import { i18n } from './i18n';
import App from './App.vue';
import { queryClient } from './lib/queryClient';
import { vRole } from './directives/role';

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } }
});
persistQueryClient({
  queryClient: qc,
  persister: createSyncStoragePersister({ storage: window.localStorage }),
  maxAge: 1000 * 60 * 60
});

const app = createApp(App);
app.use(createPinia()).use(VueQueryPlugin, { queryClient }).use(router).use(i18n);
app.directive('role', vRole);
app.mount('#app');
