<script setup lang="ts">
import { useAppearance, type Theme } from '@/composables/useAppearance';
const { theme, setTheme } = useAppearance();
</script>

<template>
  <label class="inline-flex items-center gap-1 text-sm">
    Tema:
    <select :value="theme" @change="setTheme(($event.target as HTMLSelectElement).value as Theme)"
            class="border rounded px-2 py-1 text-sm">
      <option value="system">Sistem</option>
      <option value="light">Açık</option>
      <option value="dark">Koyu</option>
    </select>
  </label>
</template>
