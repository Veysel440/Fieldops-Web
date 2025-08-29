<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { normalizeAxiosError } from '@/lib/http-error';
import { bus } from '@/lib/bus';

const err = ref<Error | null>(null);
const reload = () => window.location.reload();
function reset() { err.value = null; }

onErrorCaptured((e) => {
  err.value = e instanceof Error ? e : new Error(String(e));
  try {
    const n = normalizeAxiosError(e as any);
    bus.emit('toast', { type: 'error', text: n.message });
  } catch {
    bus.emit('toast', { type: 'error', text: String(err.value?.message ?? 'Hata') });
  }
  return false;
});
</script>

<template>
  <div v-if="err" class="p-6">
    <h2 class="text-lg font-semibold mb-2">Bir hata oluştu</h2>
    <p class="text-sm text-gray-600 mb-4">Sayfayı yenilemeyi deneyebilirsiniz.</p>
    <div class="flex gap-2">
      <button class="border rounded px-3 py-1" @click="reset()">Tekrar dene</button>
      <button class="border rounded px-3 py-1" @click="reload">Yenile</button>
    </div>
  </div>
  <slot v-else />
</template>
