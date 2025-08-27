<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
const { locale } = useI18n(); const auth = useAuthStore();
</script>

<template>
  <nav class="p-3 flex gap-3 border-b">
    <router-link to="/">Özet</router-link>
    <router-link to="/work-orders">İş Emirleri</router-link>
    <router-link to="/map">Harita</router-link>
    <router-link v-role="['admin','tech']" to="/assets">Varlıklar</router-link>
    <select v-model="locale" class="ml-auto"><option value="tr">TR</option><option value="en">EN</option></select>
    <button v-if="auth.isAuthed" @click="auth.logout()">Çıkış</button>
  </nav>
  <router-view/>
</template>
