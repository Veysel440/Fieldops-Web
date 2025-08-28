<script setup lang="ts">
import { usePwaUpdater } from '@/composables/usePwaUpdater';
const { needRefresh, updateNow } = usePwaUpdater();
</script>

<template>
  <div v-if="needRefresh"
       class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded shadow">
    Yeni sürüm hazır.
    <button class="ml-3 underline" @click="updateNow()">Yenile</button>
  </div>
</template>
