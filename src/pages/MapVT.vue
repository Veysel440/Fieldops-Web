<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef } from 'vue';
import maplibregl, { Map as MlMap, NavigationControl } from 'maplibre-gl';
import { ensurePMTilesProtocol } from '@/lib/pmtiles';

/**
 * Props:
 * - styleUrl: hazır bir vektör stil dosyası (tilejson) → tercih edilen
 * - pmtilesUrl: PMTiles URL'i (örn. 'https://cdn.example.com/fieldops.pmtiles')
 * - sourceLayer: vektör kaynak layer adı (örn. 'fieldops')
 */
const props = withDefaults(defineProps<{
  styleUrl?: string;
  pmtilesUrl?: string;
  sourceLayer?: string;
}>(), {
  styleUrl: '',
  pmtilesUrl: '',
  sourceLayer: 'points'
});

const el = shallowRef<HTMLDivElement | null>(null);
const map = shallowRef<MlMap | null>(null);

onMounted(() => {
  if (!el.value) return;

  ensurePMTilesProtocol();

  const m = new maplibregl.Map({
    container: el.value,
    style: props.styleUrl || {
      version: 8,
      sources: props.pmtilesUrl ? {
        vt: {
          type: 'vector',
          url: `pmtiles://${props.pmtilesUrl}`
        } as any
      } : {
        // Fallback: demo stil
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256
        }
      },
      layers: props.pmtilesUrl ? [
        { id: 'vt-fill', type: 'circle', source: 'vt', 'source-layer': props.sourceLayer,
          paint: { 'circle-radius': 5, 'circle-color': '#2563eb', 'circle-stroke-width': 1, 'circle-stroke-color': '#fff' } }
      ] : [
        { id: 'osm', type: 'raster', source: 'osm' }
      ]
    } as any,
    center: [29, 41],
    zoom: 9,
    attributionControl: { compact: true }
  });

  map.value = m;
  m.addControl(new NavigationControl(), 'top-right');

  m.on('click', 'vt-fill', (e: any) => {
    const f = e.features?.[0];
    if (!f) return;
    const id = f.properties?.id ? Number(f.properties.id) : undefined;
    if (id) alert(`Feature #${id}`);
  });
});

onUnmounted(() => { map.value?.remove(); map.value = null; });
</script>

<template>
  <div ref="el" style="height: 420px; width: 100%" aria-label="VT Map"></div>
</template>

<style scoped>
@import "maplibre-gl/dist/maplibre-gl.css";
</style>
