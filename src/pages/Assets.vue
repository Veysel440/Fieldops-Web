<script setup lang="ts">
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { listAssets, type Asset } from '@/services/assets';
import { ref } from 'vue';
import { useOfflineMutation } from '@/composables/useOfflineMutation';

const page = ref(1); const q = ref('');
const qc = useQueryClient();
const qry = useQuery({ queryKey: ['asset','list',page,q], queryFn: () => listAssets({ page: page.value, q: q.value }) });

const form = ref<Partial<Asset>>({ code:'', name:'', customerId:1 });
const m = useOfflineMutation<Asset>('/assets','POST',['asset','list',page,q],{
  onSuccess: () => qc.invalidateQueries({ queryKey: ['asset','list'] })
});
function submit(){ m.mutate(form.value); form.value = { code:'', name:'', customerId:1 }; }
</script>

<template>
  <section class="p-6">
    <h1 class="text-xl mb-3">Varlıklar</h1>

    <div class="mb-3 flex gap-2">
      <input v-model="q" placeholder="Ara" @keyup.enter="page=1" />
      <button @click="page=1">Listele</button>
    </div>

    <form @submit.prevent="submit" class="mb-6 flex gap-2 flex-wrap">
      <input v-model="form.code" placeholder="Kod" required />
      <input v-model="form.name" placeholder="Ad" required />
      <input v-model.number="form.customerId" type="number" placeholder="MüşteriID" />
      <button type="submit">Ekle</button>
      <span v-if="m.isPending">Kaydediliyor/kuyrukta…</span>
    </form>

    <table class="min-w-full border">
      <thead><tr><th>Kod</th><th>Ad</th><th>Müşteri</th><th>Oluşturma</th></tr></thead>
      <tbody>
      <tr v-for="a in qry.data?.data ?? []" :key="a.id">
        <td>{{ a.code }}</td><td>{{ a.name }}</td><td>{{ a.customerId }}</td><td>{{ a.createdAt }}</td>
      </tr>
      </tbody>
    </table>
  </section>
</template>
