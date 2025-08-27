<script setup lang="ts">
import { onMounted, ref } from 'vue';
import maplibregl from 'maplibre-gl';
const el = ref<HTMLDivElement|null>(null);
onMounted(() => {
  const map = new maplibregl.Map({
    container: el.value as HTMLDivElement,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [29.0, 41.0], zoom: 9
  });
  new maplibregl.NavigationControl();
});
</script>
<template><div ref="el" style="height: 420px; width: 100%"></div></template>
<style scoped>
@import "maplibre-gl/dist/maplibre-gl.css";
</style>
