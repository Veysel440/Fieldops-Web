<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useOfflineQueue } from '@/stores/offlineQueue';
const q = useOfflineQueue();
const { size, processing } = storeToRefs(q);
</script>

<template>
  <div class="px-2 py-1 text-sm border rounded" :title="processing ? 'İşleniyor' : 'Bekliyor'">
    Kuyruk: {{ size }}
    <button class="ml-2 underline" @click="q.processAll()">Gönder</button>
  </div>
</template>
