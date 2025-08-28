<script setup lang="ts">
import { ref, computed } from 'vue';

const props = withDefaults(defineProps<{
  maxSizeMB?: number;
  disabled?: boolean;
  accept?: string[];
}>(), {
  maxSizeMB: 5,
  disabled: false,
  accept: () => ['.png','.jpg','.jpeg','.pdf','.zip','.docx','.pptx','.xlsx'],
});

const emit = defineEmits<{
  (e: 'select', file: File): void
}>();

const err = ref<string>();
const fileInput = ref<HTMLInputElement|null>(null);
const accepting = computed(() => props.accept.join(','));
const maxBytes = computed(() => props.maxSizeMB * 1024 * 1024);

const allowedMime = new Set([
  'image/png','image/jpeg','application/pdf','application/zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

async function sniff(file: File): Promise<string | undefined> {
  const buf = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const hex = [...buf].map(b => b.toString(16).padStart(2,'0')).join('');
  if (hex.startsWith('89504e470d0a1a0a')) return 'image/png';
  if (hex.startsWith('ffd8')) return 'image/jpeg';
  if (hex.startsWith('25504446')) return 'application/pdf';
  if (hex.includes('504b0304')) return 'application/zip';
  return file.type || undefined;
}

function resetInput() {
  if (fileInput.value) fileInput.value.value = '';
}

async function handleFile(file: File) {
  err.value = undefined;

  if (file.size > maxBytes.value) {
    err.value = `${props.maxSizeMB}MB üstü dosya reddedildi.`;
    resetInput();
    return;
  }
  const m = await sniff(file);
  if (!m || !allowedMime.has(m)) {
    err.value = 'Dosya tipi reddedildi.';
    resetInput();
    return;
  }
  emit('select', file);
  resetInput();
}

async function onPick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) await handleFile(f);
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
  e.dataTransfer!.dropEffect = 'copy';
}
async function onDrop(e: DragEvent) {
  e.preventDefault();
  const f = e.dataTransfer?.files?.[0];
  if (f) await handleFile(f);
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <label
      class="border rounded p-3 text-sm cursor-pointer select-none bg-white hover:bg-gray-50"
      @dragover="onDragOver"
      @drop="onDrop"
      :class="{ 'opacity-60 pointer-events-none': disabled }"
      aria-label="Dosya yükle"
    >
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        :accept="accepting"
        :disabled="disabled"
        @change="onPick"
      />
      <span class="block">Dosya seç veya buraya sürükle</span>
      <span class="block text-xs text-gray-500">İzin verilen: PNG, JPG, PDF, ZIP/Office · Maks {{ maxSizeMB }}MB</span>
    </label>

    <p v-if="err" class="text-red-600 text-sm" role="alert" aria-live="polite">{{ err }}</p>
  </div>
</template>
