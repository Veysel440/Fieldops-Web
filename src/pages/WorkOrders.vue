<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { listWorkOrders, type WorkOrder } from '@/services/workOrders';
import { useOfflineMutation } from '@/composables/useOfflineMutation';
import { useOnline } from '@/composables/useOnline';

type PageResp = { data: WorkOrder[]; total: number };

const page = ref(1);
const q = ref('');
const qc = useQueryClient();

const { online } = useOnline();

const { data: woData, isLoading, error } = useQuery<PageResp>({
  queryKey: ['wo','list', page, q] as const,
  queryFn: () => listWorkOrders({ page: page.value, q: q.value }),
});
const rows = computed(() => woData.value?.data ?? []);

const form = ref<Partial<WorkOrder>>({ title: '', code: '', status: 'open', customerId: 1 });

const m = useOfflineMutation<WorkOrder>(
  '/work-orders',
  'POST',
  ['wo','list'],
  { onSuccess: () => qc.invalidateQueries({ queryKey: ['wo','list'] }) }
);

function submit(){ m.mutate(form.value); }
</script>

<template>
  <section class="p-6">
    <h1 class="text-xl mb-4">İş Emirleri</h1>

    <div class="mb-4 flex gap-2">
      <input v-model="q" placeholder="Ara" @keyup.enter="page=1" />
      <button @click="page=1">Listele</button>
    </div>

    <div class="mb-6 border p-3 rounded">
      <h2 class="font-semibold mb-2">Yeni İş Emri</h2>
      <form @submit.prevent="submit" class="flex gap-2 flex-wrap">
        <input v-model="form.code" placeholder="Kod" required />
        <input v-model="form.title" placeholder="Başlık" required />
        <select v-model="form.status">
          <option value="open">open</option>
          <option value="in_progress">in_progress</option>
          <option value="done">done</option>
        </select>
        <input v-model.number="form.customerId" type="number" placeholder="MüşteriID" />
        <button type="submit" :disabled="m.isPending ? true : false">Kaydet</button>
        <span v-if="!online" class="text-xs opacity-70">offline: kuyruğa eklenecek</span>
      </form>
    </div>

    <div v-if="isLoading">Yükleniyor…</div>
    <div v-else-if="error">Hata</div>
    <table v-else class="min-w-full border">
      <thead>
      <tr><th>Kod</th><th>Başlık</th><th>Durum</th><th>Müşteri</th><th>Oluşturma</th></tr>
      </thead>
      <tbody>
      <tr v-for="w in rows" :key="w.id">
        <td><router-link :to="`/work-orders/${w.id}`">{{ w.code }}</router-link></td>
        <td><router-link :to="`/work-orders/${w.id}`">{{ w.title }}</router-link></td>
        <td>{{ w.status }}</td>
        <td>{{ w.customerId }}</td>
        <td>{{ w.createdAt }}</td>
      </tr>
      </tbody>
    </table>

    <div class="mt-3 flex gap-2">
      <button @click="page=Math.max(1,page-1)">Önceki</button>
      <span>Sayfa {{ page }}</span>
      <button @click="page=page+1">Sonraki</button>
    </div>
  </section>
</template>
