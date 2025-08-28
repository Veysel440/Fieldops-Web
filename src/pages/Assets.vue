<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useInfiniteQuery, useQueryClient,} from '@tanstack/vue-query';
import { listAssets, type Asset } from '@/services/assets';
import { useOfflineMutation } from '@/composables/useOfflineMutation';
import { useForm, useField } from 'vee-validate';
import { z } from 'zod';
import { toFormValidator } from '@vee-validate/zod';
import { RecycleScroller } from 'vue-virtual-scroller';
import type { InfiniteData, QueryFunctionContext } from '@tanstack/vue-query';

const PAGE_SIZE = 20;
type PageResp = { data: Asset[]; total: number };

const q = ref('');
const qc = useQueryClient();
const key = computed(() => ['asset','inf', q.value] as const);

const inf = useInfiniteQuery<PageResp, Error, PageResp, readonly (string|number)[], number>({
  queryKey: key,
  initialPageParam: 1,
  queryFn: ({ pageParam }: QueryFunctionContext<readonly (string|number)[], number>) =>
    listAssets({ page: pageParam ?? 1, q: q.value, size: PAGE_SIZE }),
  getNextPageParam: (lastPage, allPages) => {
    const loaded = allPages.reduce((n, p) => n + p.data.length, 0);
    return loaded < (lastPage.total ?? 0) ? allPages.length + 1 : undefined;
  }
});
const pages = computed<PageResp[]>(() =>
  ((inf.data.value as InfiniteData<PageResp> | undefined)?.pages) ?? []
);
const items = computed<Asset[]>(() => pages.value.flatMap(p => p.data));



const sentinel = ref<HTMLElement|null>(null);
let obs: IntersectionObserver | null = null;
onMounted(() => {
  obs = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) inf.fetchNextPage(); },
    { root: null, rootMargin: '120px', threshold: 0 });
  if (sentinel.value) obs.observe(sentinel.value);
});
onUnmounted(() => { if (obs && sentinel.value) obs.unobserve(sentinel.value); });


const schema = z.object({ code: z.string().min(1), name: z.string().min(1), customerId: z.coerce.number().int().positive() });
const { handleSubmit, errors } = useForm({ validationSchema: toFormValidator(schema) });
const { value: code } = useField<string>('code');
const { value: name } = useField<string>('name');
const { value: customerId } = useField<number>('customerId');
const customerIdNum = computed<number>({ get: () => Number(customerId.value ?? 0), set: v => { customerId.value = v; } });

const m = useOfflineMutation<Asset>('/assets','POST',['asset','inf'],{
  onSuccess: () => qc.invalidateQueries({ queryKey: ['asset','inf'] })
});
const submit = handleSubmit(vals => m.mutate(vals as any));
</script>

<template>
  <section class="p-6">
    <h1 class="text-xl mb-3">Varlıklar</h1>

    <div class="mb-3 flex gap-2">
      <input v-model="q" placeholder="Ara" @keyup.enter="inf.refetch()" />
      <button @click="inf.refetch()">Listele</button>
    </div>

    <form @submit.prevent="submit" class="mb-6 flex gap-2 flex-wrap items-start">
      <div class="flex flex-col">
        <input v-model="code" placeholder="Kod" />
        <small class="text-red-600" v-if="errors.code">{{ errors.code }}</small>
      </div>
      <div class="flex flex-col">
        <input v-model="name" placeholder="Ad" />
        <small class="text-red-600" v-if="errors.name">{{ errors.name }}</small>
      </div>
      <div class="flex flex-col">
        <input v-model.number="customerIdNum" type="number" placeholder="MüşteriID" />
        <small class="text-red-600" v-if="errors.customerId">{{ errors.customerId }}</small>
      </div>
      <button type="submit" :disabled="m.isPending ? true : false">Ekle</button>
    </form>

    <div class="border rounded" style="height: 480px; overflow-y: auto;">
      <RecycleScroller :items="items" :item-size="64" key-field="id" class="divide-y" v-slot="{ item }">
        <div class="p-3 grid grid-cols-5">
          <div class="font-medium">{{ item.code }}</div>
          <div>{{ item.name }}</div>
          <div>{{ item.customerId }}</div>
          <div>{{ item.lat ?? '-' }}, {{ item.lng ?? '-' }}</div>
          <div class="text-gray-500">{{ item.createdAt }}</div>
        </div>
      </RecycleScroller>
      <div ref="sentinel" class="p-3 text-center text-sm">
        <span v-if="inf.isFetchingNextPage">Yükleniyor…</span>
        <span v-else-if="!inf.hasNextPage">Hepsi yüklendi</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
</style>
