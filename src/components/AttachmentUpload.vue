<script setup lang="ts">
import { ref } from 'vue';
const emit = defineEmits<{ select:[File] }>();
const err = ref<string|undefined>();

async function sniff(file: File): Promise<string|undefined> {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const hex = [...head].map(b=>b.toString(16).padStart(2,'0')).join('');
  if (hex.startsWith('89504e470d0a1a0a')) return 'image/png';
  if (hex.startsWith('ffd8')) return 'image/jpeg';
  if (hex.startsWith('25504446')) return 'application/pdf';
  if (hex.includes('504b0304')) return 'application/zip'; // docx/pptx/xlsx
  return undefined;
}

async function onPick(e: Event){
  err.value = undefined;
  const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return;
  if (f.size > 5 * 1024 * 1024) { err.value = '5MB üstü dosya reddedildi.'; return; }
  const m = await sniff(f);
  const ok = m && ['image/png','image/jpeg','application/pdf','application/zip'].includes(m);
  if (!ok) { err.value = 'Dosya tipi reddedildi.'; return; }
  emit('select', f);
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <input type="file" @change="onPick" />
    <small v-if="err" class="text-red-600">{{ err }}</small>
  </div>
</template>
