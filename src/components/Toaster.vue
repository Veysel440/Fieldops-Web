<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { bus } from '@/lib/bus';

type BusToast = { type: 'success'|'error'|'info'; text: string; action?: () => void; actionLabel?: string; durationMs?: number };
type Toast = BusToast & { id: string };

const items = ref<Toast[]>([]);
const timers = new Map<string, number>();

function uid() {
  return (crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2);
}

function scheduleClose(id: string, ms: number) {
  const t = window.setTimeout(() => close(id), ms);
  timers.set(id, t);
}

function push(t: any) {
  const payload: BusToast = t ?? { type: 'info', text: '' };
  const id = uid();
  const toast: Toast = { id, type: payload.type, text: payload.text, action: payload.action, actionLabel: payload.actionLabel, durationMs: payload.durationMs ?? 4000 };
  items.value = [...items.value, toast];
  scheduleClose(id, toast.durationMs!);
}

function close(id: string) {
  const t = timers.get(id);
  if (t) { clearTimeout(t); timers.delete(id); }
  items.value = items.value.filter(x => x.id !== id);
}

function onMouseEnter(id: string) {
  const t = timers.get(id);
  if (t) { clearTimeout(t); timers.delete(id); }
}
function onMouseLeave(id: string) {
  const toast = items.value.find(x => x.id === id);
  if (toast) scheduleClose(id, 1500);
}

onMounted(() => { bus.on('toast', push); });
onUnmounted(() => { bus.off('toast', push as any); timers.forEach(clearTimeout); timers.clear(); });

function btnClass(t: Toast) {
  return t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-gray-800';
}
</script>

<template>
  <div class="fixed right-4 bottom-4 z-50 flex flex-col gap-2" role="region" aria-live="polite" aria-label="Bildirimler">
    <transition-group name="toast" tag="div">
      <div v-for="t in items" :key="t.id"
           class="min-w-[220px] max-w-[360px] text-white shadow rounded px-3 py-2 flex items-start gap-3"
           :class="btnClass(t)"
           @mouseenter="onMouseEnter(t.id)"
           @mouseleave="onMouseLeave(t.id)">
        <div class="mt-0.5 grow">{{ t.text }}</div>
        <div class="flex gap-2">
          <button v-if="t.action" class="text-xs underline" @click="t.action()"> {{ t.actionLabel ?? 'Eylem' }} </button>
          <button class="text-xs opacity-80 hover:opacity-100" aria-label="Kapat" @click="close(t.id)">✕</button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all .15s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(6px); }
</style>
