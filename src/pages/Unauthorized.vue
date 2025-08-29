<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
function goHome(){ router.replace('/'); }
function goLogin(){ router.replace({ path:'/login', query:{ r:'/' } }); }
</script>

<template>
  <main class="p-6 max-w-lg mx-auto">
    <h1 class="text-xl font-semibold mb-2">Yetkisiz</h1>
    <p class="text-sm text-gray-600 mb-4">Bu sayfa için yetkiniz yok.</p>
    <div class="flex gap-2">
      <button class="px-3 py-1 border rounded hover:bg-gray-50" @click="goHome">Ana sayfa</button>
      <button class="px-3 py-1 border rounded hover:bg-gray-50" @click="goLogin">Giriş</button>
    </div>
  </main>
</template>
