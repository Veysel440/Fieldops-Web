import { ref } from 'vue';
import { registerSW } from 'virtual:pwa-register';

const needRefresh = ref(false);
const offlineReady = ref(false);
let _update: ((reload?: boolean) => void) | null = null;

export function usePwaUpdater() {
  if (!_update) {
    _update = registerSW({
      immediate: true,
      onNeedRefresh: () => { needRefresh.value = true; },
      onOfflineReady: () => { offlineReady.value = true; }
    });
  }
  function updateNow() { _update?.(true); }
  return { needRefresh, offlineReady, updateNow };
}
