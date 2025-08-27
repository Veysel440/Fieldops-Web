<script setup lang="ts">
import { ref } from 'vue';
const accept = '.png,.jpg,.jpeg,.pdf,.doc,.docx';
const max = 5 * 1024 * 1024;
const emits = defineEmits<{ (e:'select', f: File): void }>();
const err = ref<string|undefined>();

async function onPick(e: Event) {
  err.value = undefined;
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  const extOk = accept.split(',').some(s => f.name.toLowerCase().endsWith(s));
  if (!extOk) { err.value = 'İzin verilmeyen tür'; return; }
  if (f.size > max) { err.value = 'Dosya büyük'; return; }
  const buf = await f.slice(0, 256).arrayBuffer();
  const txt = new TextDecoder().decode(new Uint8Array(buf));
  if (txt.includes('<script')) { err.value = 'Şüpheli içerik'; return; }
  emits('select', f);
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <input type="file" :accept="accept" @change="onPick" />
    <p v-if="err" class="text-red-600 text-sm">{{ err }}</p>
  </div>
</template>
