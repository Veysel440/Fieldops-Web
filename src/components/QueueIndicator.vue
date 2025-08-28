<script setup lang="ts">
import { computed } from 'vue';
import { useOfflineQueue } from '@/stores/offlineQueue';
import { useOnline } from '@/composables/useOnline';

const q = useOfflineQueue();
const { online } = useOnline();

const size = computed(() => q.size);
const processing = computed(() => q.processing);
const disabled = computed(() => !online.value || processing.value);

function syncNow() { if (!disabled.value) q.processAll(); }
</script>

<template>
  <button
    class="px-2 py-1 rounded border flex items-center gap-2 text-sm"
    :title="online ? (processing ? 'Senkron yapılıyor' : 'Kuyruğu senkronize et') : 'Offline'"
    :aria-busy="processing ? 'true' : 'false'"
    :disabled="disabled"
    @click="syncNow"
  >
    <span>Queue</span>
    <span class="text-xs px-1 rounded" :class="online ? 'bg-gray-200' : 'bg-amber-200'">
      {{ size }}
    </span>
    <svg v-if="processing" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="3" opacity=".25"/><path d="M22 12a10 10 0 0 1-10 10" stroke-width="3"/></svg>
  </button>
</template>
