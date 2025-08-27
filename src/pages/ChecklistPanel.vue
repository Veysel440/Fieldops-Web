<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  listWOChecklist, listChecklistTemplates, attachTemplateToWO,
  type WOItem, type ChecklistTemplate
} from '@/services/checklists';
import { useOfflineMutation } from '@/composables/useOfflineMutation';

const props = defineProps<{ workOrderId: number }>();
const qc = useQueryClient();

const { data: itemsQData, isLoading: itemsLoading } = useQuery<{ data: WOItem[] }>({
  queryKey: ['wo','checklist', props.workOrderId] as const,
  queryFn: () => listWOChecklist(props.workOrderId),
});
const items = computed<WOItem[]>(() => itemsQData.value?.data ?? []);

const { data: tplQData } = useQuery<{ data: ChecklistTemplate[] }>({
  queryKey: ['cl','tpl'] as const,
  queryFn: () => listChecklistTemplates(),
});
const tpls = computed<ChecklistTemplate[]>(() => tplQData.value?.data ?? []);


const toggle = useOfflineMutation(`/work-orders/${props.workOrderId}/checklist/:id` as any, 'PATCH',
  ['wo','checklist', props.workOrderId]);

function onToggle(id: number, done: boolean) {
  const next = items.value.map((i) => i.id === id ? { ...i, done } : i);
  qc.setQueryData(['wo','checklist', props.workOrderId], { data: next } as any); // optimistic
  toggle.mutate({ id, done });
}


const selectedTpl = ref<number | undefined>();
const attachM = useMutation({
  mutationFn: () => attachTemplateToWO(props.workOrderId, selectedTpl.value!),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['wo','checklist', props.workOrderId] }),
});
</script>

<template>
  <div class="border p-3 rounded">
    <h3 class="font-semibold mb-2">Checklist</h3>

    <div v-if="itemsLoading">Yükleniyor…</div>
    <ul v-else class="flex flex-col gap-1">
      <li v-for="i in items" :key="i.id" class="flex items-center gap-2">
        <input type="checkbox" :checked="i.done" @change="onToggle(i.id, ($event.target as HTMLInputElement).checked)" />
        <span :class="i.done ? 'line-through' : ''">{{ i.title }}</span>
      </li>
    </ul>

    <div class="mt-3 flex gap-2 items-center">
      <select v-model.number="selectedTpl">
        <option :value="undefined">Şablon seç…</option>
        <option v-for="t in tpls" :key="t.id" :value="t.id">{{ t.title }}</option>
      </select>
      <button :disabled="!selectedTpl" @click="attachM.mutate()">Şablonu Uygula</button>
    </div>
  </div>
</template>
