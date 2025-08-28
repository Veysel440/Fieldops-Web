<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, watch } from 'vue';
import { useRouter, useRoute, RouterLink, RouterView } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const { locale } = useI18n();
onMounted(() => {
  const saved = localStorage.getItem('locale');
  if (saved) locale.value = saved as any;
});
watch(locale, v => localStorage.setItem('locale', String(v)));

const userName = computed(() => auth.user?.name ?? '—');

const QueueIndicator = defineAsyncComponent(() => import('@/components/QueueIndicator.vue'));

async function onLogout() {
  try {
    await auth.logout();
  } finally {
    router.replace('/login');
  }
}

function linkClasses(isActive: boolean) {
  return [
    'px-2 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring',
    isActive ? 'font-semibold text-gray-900' : 'text-gray-700'
  ];
}
</script>

<template>
  <nav class="p-3 flex items-center gap-3 border-b bg-white">
    <RouterLink to="/" v-slot="{ href, navigate, isActive }">
      <a :href="href" @click.prevent="navigate" :class="linkClasses(isActive)" aria-label="Özet" :aria-current="isActive ? 'page' : undefined">Özet</a>
    </RouterLink>

    <RouterLink to="/work-orders" v-slot="{ href, navigate, isActive }">
      <a :href="href" @click.prevent="navigate" :class="linkClasses(isActive)" aria-label="İş Emirleri" :aria-current="isActive ? 'page' : undefined">İş Emirleri</a>
    </RouterLink>

    <RouterLink to="/customers" v-slot="{ href, navigate, isActive }">
      <a :href="href" @click.prevent="navigate" :class="linkClasses(isActive)" aria-label="Müşteriler" :aria-current="isActive ? 'page' : undefined">Müşteriler</a>
    </RouterLink>

    <RouterLink to="/assets" v-role="['admin','tech']" v-slot="{ href, navigate, isActive }">
      <a :href="href" @click.prevent="navigate" :class="linkClasses(isActive)" aria-label="Varlıklar" :aria-current="isActive ? 'page' : undefined">Varlıklar</a>
    </RouterLink>

    <RouterLink to="/map" v-slot="{ href, navigate, isActive }">
      <a :href="href" @click.prevent="navigate" :class="linkClasses(isActive)" aria-label="Harita" :aria-current="isActive ? 'page' : undefined">Harita</a>
    </RouterLink>

    <div class="ml-auto flex items-center gap-3">
      <span class="text-sm text-gray-600 hidden sm:inline" aria-label="Kullanıcı">{{ userName }}</span>

      <select v-model="locale" class="border rounded px-2 py-1 text-sm">
        <option value="tr">TR</option>
        <option value="en">EN</option>
      </select>

      <QueueIndicator />

      <button
        v-if="auth.isAuthed"
        @click="onLogout"
        class="px-2 py-1 text-sm border rounded hover:bg-gray-100 focus:outline-none focus:ring"
      >
        Çıkış
      </button>
      <RouterLink v-else to="/login" class="px-2 py-1 text-sm border rounded hover:bg-gray-100 focus:outline-none focus:ring">
        Giriş
      </RouterLink>
    </div>
  </nav>

  <RouterView v-slot="{ Component }">
    <Suspense>
      <component :is="Component" />
    </Suspense>
  </RouterView>
</template>
