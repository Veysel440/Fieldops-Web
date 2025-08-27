<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import maplibregl, { Map as MlMap } from 'maplibre-gl';
import { http } from '@/services/http';

type Pt = { id:number; title:string; lat:number; lng:number; kind:'asset'|'wo' };
const el = ref<HTMLDivElement|null>(null);
const router = useRouter();

async function fetchPoints(): Promise<Pt[]> {
  const [assets, orders] = await Promise.all([
    http.get('/assets/map').then(r => r.data ?? []),
    http.get('/work-orders/map').then(r => r.data ?? []),
  ]);
  return [
    ...assets.map((x:any)=>({ id:x.id,title:x.name,lat:x.lat,lng:x.lng,kind:'asset' as const })),
    ...orders.map((x:any)=>({ id:x.id,title:x.title,lat:x.lat,lng:x.lng,kind:'wo' as const })),
  ].filter(p => typeof p.lat==='number' && typeof p.lng==='number');
}

onMounted(async () => {
  const map: MlMap = new maplibregl.Map({
    container: el.value as HTMLDivElement,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [29, 41],
    zoom: 9
  });

  const pts = await fetchPoints();
  const geo = {
    type: 'FeatureCollection',
    features: pts.map(p => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: { id: p.id, kind: p.kind, title: p.title }
    }))
  };

  map.on('load', () => {
    map.addSource('points', {
      type: 'geojson',
      data: geo as any,
      cluster: true,
      clusterRadius: 40,
      clusterMaxZoom: 14
    });


    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'points',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#4b5563',
        'circle-radius': [
          'step', ['get', 'point_count'],
          16, 50, 22, 150, 28
        ],
        'circle-opacity': 0.75
      }
    });


    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'points',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-size': 12
      }
    });


    map.addLayer({
      id: 'unclustered',
      type: 'circle',
      source: 'points',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': 7,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
        'circle-color': ['match', ['get','kind'], 'wo', '#d97706', /*asset*/ '#2563eb']
      }
    });


    map.on('click', 'clusters', (e) => {
      const f = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })[0];
      const clusterId = (f.properties as any).cluster_id;
      const src: any = map.getSource('points');
      src.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
        if (err) return;
        map.easeTo({ center: (f.geometry as any).coordinates, zoom });
      });
    });


    map.on('click', 'unclustered', (e) => {
      const f = e.features?.[0]; if (!f) return;
      const id = Number((f.properties as any).id);
      const kind = String((f.properties as any).kind);
      router.push(kind === 'wo' ? `/work-orders/${id}` : `/assets/${id}`);
    });

    map.on('mouseenter', 'clusters', () => map.getCanvas().style.cursor = 'pointer');
    map.on('mouseleave', 'clusters', () => map.getCanvas().style.cursor = '');
    map.on('mouseenter', 'unclustered', () => map.getCanvas().style.cursor = 'pointer');
    map.on('mouseleave', 'unclustered', () => map.getCanvas().style.cursor = '');
  });
});
</script>

<template>
  <section class="p-6">
    <h1 class="text-xl mb-3">Harita</h1>
    <div ref="el" style="height: 480px; width: 100%"></div>
  </section>
</template>

<style scoped>
@import "maplibre-gl/dist/maplibre-gl.css";
</style>
