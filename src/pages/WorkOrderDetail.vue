<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { z } from 'zod';
import { useOfflineMutation } from '@/composables/useOfflineMutation';
import ChecklistPanel from '@/pages/ChecklistPanel.vue';
import WorkOrderAttachments from '@/components/WorkOrderAttachments.vue';
import { http } from '@/services/http';

const route = useRoute();
const router = useRouter();
const id = computed(() => Number(route.params.id));
if (!Number.isFinite(id.value)) router.replace('/work-orders');

const WorkOrderSchema = z.object({
  id: z.number(),
  code: z.string(),
  title: z.string(),
  status: z.enum(['open','in_progress','done']),
  customerId: z.number(),
  createdAt: z.string(),
});
type WorkOrder = z.infer<typeof WorkOrderSchema>;

async function getWorkOrder(woId: number): Promise<WorkOrder> {
  const { data } = await http.get(`/work-orders/${woId}`);
  return WorkOrderSchema.parse(data);
}

const qc = useQueryClient();
const { data, isLoading, isError } = useQuery<WorkOrder>({
  queryKey: ['wo','detail', id] as const,
  enabled: computed(() => Number.isFinite(id.value)),
  queryFn: () => getWorkOrder(id.value),
  staleTime: 30_000,
});

const form = ref<Partial<WorkOrder>>({});
watch(data, (d) => {
  if (d) form.value = { code: d.code, title: d.title, status: d.status, customerId: d.customerId };
}, { immediate: true });

const upd = useOfflineMutation(`/work-orders/:id` as any, 'PATCH', ['wo','detail'] as const, {
  onSuccess: () => qc.invalidateQueries({ queryKey: ['wo','detail', id.value] })
});

function save() {
  upd.mutate({ id: id.value, ...form.value });
}

const saveDisabled = computed(() => upd.isPending ? true : false);

function back() { router.back(); }
</script>

<template>
  <section class="p-6">
    <div class="mb-4 flex items-center gap-3">
      <h1 class="text-xl">İş Emri #{{ id }}</h1>
      <button class="ml-auto text-sm border px-2 py-1 rounded" @click="back">Geri</button>
    </div>

    <div v-if="isLoading">Yükleniyor…</div>
    <div v-else-if="isError">Kayıt bulunamadı.</div>

    <div v-else class="grid gap-4 md:grid-cols-2">
      <div class="border rounded p-4">
        <h2 class="font-semibold mb-3">Bilgiler</h2>
        <div class="grid gap-2">
          <label class="text-sm">Kod
            <input v-model="form.code" class="block w-full border rounded px-2 py-1" />
          </label>
          <label class="text-sm">Başlık
            <input v-model="form.title" class="block w-full border rounded px-2 py-1" />
          </label>
          <label class="text-sm">Durum
            <select v-model="form.status" class="block w-full border rounded px-2 py-1">
              <option value="open">open</option>
              <option value="in_progress">in_progress</option>
              <option value="done">done</option>
            </select>
          </label>
          <label class="text-sm">MüşteriID
            <input v-model.number="form.customerId" type="number" class="block w-full border rounded px-2 py-1" />
          </label>
        </div>
        <div class="mt-3 flex items-center gap-3">
          <button @click="save" :disabled="saveDisabled" class="border rounded px-3 py-1">
            Kaydet
          </button>
          <span v-if="upd.isPending" class="text-xs opacity-70">Kaydediliyor / kuyruğa alındı</span>
        </div>
      </div>

      <div class="grid gap-4">
        <ChecklistPanel :workOrderId="id" />
        <WorkOrderAttachments :workOrderId="id" />
      </div>
    </div>
  </section>
</template>
