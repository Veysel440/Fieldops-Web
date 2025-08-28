<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { bus } from '@/lib/bus';
type Toast = { id:string; type:'success'|'error'|'info'; text:string; action?:()=>void };
const items = ref<Toast[]>([]);
function push(t: Omit<Toast,'id'>){ const id=crypto.randomUUID?.() ?? String(Math.random()); items.value.push({ id, ...t }); setTimeout(()=> items.value = items.value.filter(x=>x.id!==id), 4000); }
onMounted(()=> bus.on('toast', push));
onUnmounted(()=> bus.all.clear());
</script>

<template>
  <div class="fixed right-4 bottom-4 flex flex-col gap-2 z-50">
    <button v-for="t in items" :key="t.id"
            class="px-3 py-2 rounded shadow text-white"
            :class="t.type==='error' ? 'bg-red-600' : t.type==='success' ? 'bg-green-600' : 'bg-gray-800'"
            @click="t.text.includes('Yenile') ? (window as any).FieldOpsUpdate?.() : t.action?.()">
      {{ t.text }}
    </button>
  </div>
</template>
