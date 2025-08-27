<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { listCustomers, type Customer } from '@/services/customers';
import { useOfflineMutation } from '@/composables/useOfflineMutation';

type PageResp = { data: Customer[]; total: number };

const page = ref(1);
const q = ref('');
const qc = useQueryClient();

const { data: custData, isLoading, error } = useQuery<PageResp>({
  queryKey: ['cust','list', page, q] as const,
  queryFn: () => listCustomers({ page: page.value, q: q.value }),
});

const rows = computed(() => custData.value?.data ?? []);

const form = ref<Partial<Customer>>({ name: '', phone: '' });

const m = useOfflineMutation<Customer>(
  '/customers',
  'POST',
  ['cust','list'],
  { onSuccess: () => qc.invalidateQueries({ queryKey: ['cust','list'] }) }
);

function search() { page.value = 1; }
function submit() {
  m.mutate(form.value as any);
  form.value = { name: '', phone: '' };
}
</script>

<template>
  <section class="p-6">
    <h1 class="text-xl mb-3">Müşteriler</h1>

    <div class="mb-3 flex gap-2">
      <input v-model="q" placeholder="Ara" @keyup.enter="search" />
      <button @click="search">Listele</button>
    </div>

    <form @submit.prevent="submit" class="mb-6 flex gap-2 flex-wrap">
      <input v-model="form.name" placeholder="Ad" required />
      <input v-model="form.phone" placeholder="Telefon" />
      <button type="submit" :disabled="m.isPending ? true : false">Ekle</button>
      <span v-if="m.isPending">Kaydediliyor/kuyrukta…</span>
    </form>

    <div v-if="isLoading">Yükleniyor…</div>
    <div v-else-if="error">Hata</div>
    <table v-else class="min-w-full border">
      <thead><tr><th>Ad</th><th>Tel</th><th>Oluşturma</th></tr></thead>
      <tbody>
      <tr v-for="c in rows" :key="c.id">
        <td>{{ c.name }}</td><td>{{ c.phone }}</td><td>{{ c.createdAt }}</td>
      </tr>
      </tbody>
    </table>
  </section>
</template>
