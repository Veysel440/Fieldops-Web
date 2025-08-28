<script setup lang="ts">
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { http } from '@/services/http';
import { useOnline } from '@/composables/useOnline';
import { useOfflineQueue } from '@/stores/offlineQueue';
import { useAuthStore } from '@/stores/auth';
import { z } from 'zod';

type Overview = { workOrders: number; assets: number; customers: number };

const OverviewSchema = z.object({
  workOrders: z.number().nonnegative().catch(0),
  assets: z.number().nonnegative().catch(0),
  customers: z.number().nonnegative().catch(0),
});

async function fetchOverview(): Promise<Overview> {
  // Öncelik: /stats/overview varsa onu kullan
  try {
    const r = await http.get('/stats/overview');
    return OverviewSchema.parse(r.data);
  } catch {
    // Geri-dönüş: total alanı üzerinden hızlı sayım
    const [wo, as, cu] = await Promise.all([
      http.get('/work-orders', { params: { page: 1, size: 1 } }),
      http.get('/assets', { params: { page: 1, size: 1 } }),
      http.get('/customers', { params: { page: 1, size: 1 } }),
    ]);
    return OverviewSchema.parse({
      workOrders: Number(wo.data?.total ?? 0),
      assets: Number(as.data?.total ?? 0),
      customers: Number(cu.data?.total ?? 0),
    });
  }
}

const { data: o, isLoading, isError, refetch } = useQuery<Overview>({
  queryKey: ['stats', 'overview'] as const,
  queryFn: fetchOverview,
  staleTime: 60_000,
});

const { online } = useOnline();
const q = useOfflineQueue();
const queueSize = computed(() => q.size);
const role = computed(() => useAuthStore().role);
</script>

<template>
  <section class="p-6">
    <header class="mb-4 flex items-center gap-3">
      <h1 class="text-xl font-semibold">Özet</h1>
      <span
        :class="online ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
        class="text-xs px-2 py-0.5 rounded"
        aria-live="polite"
      >
        {{ online ? 'online' : 'offline' }}
      </span>
      <span class="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
        Kuyruk: {{ queueSize }}
      </span>
      <button class="ml-auto px-2 py-1 text-sm border rounded" @click="refetch()" :disabled="isLoading">
        Yenile
      </button>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <!-- İş Emirleri -->
      <router-link
        to="/work-orders"
        class="block rounded-xl border p-4 hover:shadow focus:outline-none focus:ring"
        aria-label="İş Emirleri"
      >
        <div class="text-sm text-gray-500">İş Emirleri</div>
        <div class="mt-1 text-2xl font-bold">
          <span v-if="!isLoading && !isError">{{ o?.workOrders ?? 0 }}</span>
          <span v-else class="inline-block h-7 w-14 bg-gray-200 animate-pulse rounded"></span>
        </div>
        <p class="mt-2 text-xs text-gray-500">Listele, oluştur, durum yönet.</p>
      </router-link>

      <!-- Varlıklar -->
      <router-link
        to="/assets"
        class="block rounded-xl border p-4 hover:shadow focus:outline-none focus:ring"
        aria-label="Varlıklar"
      >
        <div class="text-sm text-gray-500">Varlıklar</div>
        <div class="mt-1 text-2xl font-bold">
          <span v-if="!isLoading && !isError">{{ o?.assets ?? 0 }}</span>
          <span v-else class="inline-block h-7 w-14 bg-gray-200 animate-pulse rounded"></span>
        </div>
        <p class="mt-2 text-xs text-gray-500">Lokasyon, müşteri, ilişkilendirme.</p>
      </router-link>

      <!-- Harita -->
      <router-link
        to="/map"
        class="block rounded-xl border p-4 hover:shadow focus:outline-none focus:ring"
        aria-label="Harita"
      >
        <div class="text-sm text-gray-500">Harita</div>
        <div class="mt-1 text-2xl font-bold">Aç</div>
        <p class="mt-2 text-xs text-gray-500">Cluster, bbox, detay rotası.</p>
      </router-link>

      <!-- Müşteriler (rol bazlı görünürlük örneği) -->
      <router-link
        v-if="role && ['admin','ops'].includes(role!)"
        to="/customers"
        class="block rounded-xl border p-4 hover:shadow focus:outline-none focus:ring"
        aria-label="Müşteriler"
      >
        <div class="text-sm text-gray-500">Müşteriler</div>
        <div class="mt-1 text-2xl font-bold">
          <span v-if="!isLoading && !isError">{{ o?.customers ?? 0 }}</span>
          <span v-else class="inline-block h-7 w-14 bg-gray-200 animate-pulse rounded"></span>
        </div>
        <p class="mt-2 text-xs text-gray-500">Kayıt, arama, ilişkilendirme.</p>
      </router-link>
    </div>

    <!-- Hata bildirimi -->
    <div v-if="isError" class="mt-4 text-sm text-red-600">
      Özet yüklenemedi. Tekrar deneyin.
    </div>

    <!-- Hızlı bağlantılar -->
    <ul class="mt-6 list-disc ml-6 text-sm">
      <li><router-link to="/work-orders">İş Emirleri</router-link></li>
      <li><router-link to="/assets">Varlıklar</router-link></li>
      <li><router-link to="/map">Harita</router-link></li>
    </ul>
  </section>
</template>
