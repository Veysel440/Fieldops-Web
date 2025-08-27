import { ref, onMounted, onUnmounted } from 'vue';

export function useOnline() {
  const online = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const sync = () => { online.value = navigator.onLine; };
  onMounted(() => {
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
  });
  onUnmounted(() => {
    window.removeEventListener('online', sync);
    window.removeEventListener('offline', sync);
  });
  return { online };
}
