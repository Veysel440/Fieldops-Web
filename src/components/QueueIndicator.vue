<script setup lang="ts">
import { computed } from 'vue';
import { useOfflineQueue } from '@/stores/offlineQueue';
import { useOnline } from '@/composables/useOnline';

const q = useOfflineQueue();
const { online } = useOnline();
const size = computed(() => q.size);
function syncNow(){ q.processAll(); }
</script>

<template>
  <button class="px-2 py-1 rounded border flex items-center gap-2"
          :title="online ? 'Kuyruğu senkronize et' : 'Offline'"
          @click="syncNow" :disabled="!online">
    <span>Queue</span>
    <span class="text-xs px-1 rounded bg-gray-200">{{ size }}</span>
  </button>
</template>
