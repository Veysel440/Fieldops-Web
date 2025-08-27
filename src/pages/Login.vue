<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { ref } from 'vue';
const email = ref(''); const password = ref('');
const auth = useAuthStore(); const router = useRouter(); const route = useRoute();
async function submit() {
  await auth.login(email.value, password.value);
  router.replace((route.query.r as string) ?? '/');
}
</script>

<template>
  <main class="p-6 max-w-sm mx-auto">
    <h1 class="text-xl mb-4">Giriş</h1>
    <form @submit.prevent="submit" class="flex flex-col gap-3">
      <input v-model="email" type="email" placeholder="E-posta" required />
      <input v-model="password" type="password" placeholder="Şifre" required />
      <button type="submit">Giriş</button>
    </form>
  </main>
</template>
