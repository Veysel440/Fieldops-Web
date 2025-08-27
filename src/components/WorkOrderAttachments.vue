<script setup lang="ts">
import { computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { listAttachments, uploadAttachment, type Attachment } from '@/services/attachments';
import AttachmentUpload from '@/components/AttachmentUpload.vue';

const props = defineProps<{ workOrderId: number }>();
const qc = useQueryClient();

const { data: attData } = useQuery<{ data: Attachment[] }>({
  queryKey: ['wo','att', props.workOrderId] as const,
  queryFn: () => listAttachments('workOrder', props.workOrderId),
});
const atts = computed(() => attData.value?.data ?? []);

const m = useMutation({
  mutationFn: (file: File) => uploadAttachment('workOrder', props.workOrderId, file),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['wo','att', props.workOrderId] }),
});

function onSelect(f: File) { m.mutate(f); }
</script>

<template>
  <div class="border p-3 rounded">
    <h3 class="font-semibold mb-2">Ek Dosyalar</h3>
    <AttachmentUpload @select="onSelect" />
    <ul class="mt-3 list-disc ml-6">
      <li v-for="a in atts" :key="a.id">
        <a :href="a.url" target="_blank" rel="noreferrer">
          {{ a.name }} ({{ Math.round(a.size/1024) }} KB)
        </a>
      </li>
    </ul>
  </div>
</template>
