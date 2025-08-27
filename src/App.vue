<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import QueueIndicator from '@/components/QueueIndicator.vue';

const auth = useAuthStore();
const { locale } = useI18n();
</script>

<template>
  <nav class="p-3 flex items-center gap-3 border-b">
    <router-link to="/">Özet</router-link>
    <router-link to="/work-orders">İş Emirleri</router-link>
    <router-link to="/customers">Müşteriler</router-link>
    <router-link v-role="['admin','tech']" to="/assets">Varlıklar</router-link>
    <router-link to="/map">Harita</router-link>

    <div class="ml-auto flex items-center gap-3">
      <select v-model="locale">
        <option value="tr">TR</option>
        <option value="en">EN</option>
      </select>
      <QueueIndicator />
      <button v-if="auth.isAuthed" @click="auth.logout()">Çıkış</button>
      <router-link v-else to="/login">Giriş</router-link>
    </div>
  </nav>

  <router-view />
</template>
