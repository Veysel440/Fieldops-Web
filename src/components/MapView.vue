<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, watch } from 'vue';
import maplibregl, {
  Map as MlMap,
  NavigationControl,
  ScaleControl,
  GeolocateControl,
} from 'maplibre-gl';

type BBox = [number, number, number, number];
type PtProps = { id: number; kind?: 'asset' | 'wo'; title?: string };
type FC = GeoJSON.FeatureCollection<GeoJSON.Point, PtProps>;

const props = withDefaults(defineProps<{
  center?: [number, number];
  zoom?: number;
  points?: FC;
  cluster?: boolean;
}>(), {
  center: () => [29, 41],
  zoom: 9,
  points: () => ({ type: 'FeatureCollection', features: [] } as FC),
  cluster: true,
});

const emit = defineEmits<{
  (e: 'loaded'): void;
  (e: 'bbox', box: BBox): void;
  (e: 'click-feature', payload: PtProps): void;
}>();

const el = shallowRef<HTMLDivElement | null>(null);
const map = shallowRef<MlMap | null>(null);

const ric: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number =
  (window as any).requestIdleCallback?.bind(window) ??
  ((cb) => (setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 } as any), 0) as unknown as number));

const cic: (id: number) => void =
  (window as any).cancelIdleCallback?.bind(window) ?? ((id) => clearTimeout(id));

function getBBox(m: MlMap): BBox {
  const b = m.getBounds();
  return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
}

onMounted(() => {
  if (!el.value) return;

  const m = new maplibregl.Map({
    container: el.value,
    style: 'https://demotiles.maplibre.org/style.json',
    center: props.center,
    zoom: props.zoom,
    attributionControl: { compact: true },
  });
  map.value = m;

  m.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');
  m.addControl(new ScaleControl({ maxWidth: 120, unit: 'metric' }));
  m.addControl(new GeolocateControl({ trackUserLocation: false }), 'top-right');

  m.on('load', () => {
    m.addSource('points', {
      type: 'geojson',
      data: props.points,
      cluster: props.cluster,
      clusterRadius: 40,
      clusterMaxZoom: 14,
    } as any);

    m.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'points',
      filter: ['has', 'point_count'],
      paint: { 'circle-color': '#4b5563', 'circle-radius': ['step', ['get', 'point_count'], 16, 50, 22, 150, 28], 'circle-opacity': 0.75 },
    });
    m.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'points',
      filter: ['has', 'point_count'],
      layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12 },
    });
    m.addLayer({
      id: 'unclustered',
      type: 'circle',
      source: 'points',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': 7,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
        'circle-color': ['match', ['get', 'kind'], 'wo', '#d97706', '#2563eb'],
      },
    });

    m.on('click', 'clusters', (e) => {
      const f = m.queryRenderedFeatures(e.point, { layers: ['clusters'] })[0];
      const id = (f?.properties as any)?.cluster_id;
      const src: any = m.getSource('points');
      if (id && src?.getClusterExpansionZoom) {
        src.getClusterExpansionZoom(id, (_: unknown, z: number) =>
          m.easeTo({ center: (f.geometry as any).coordinates, zoom: z }),
        );
      }
    });

    m.on('click', 'unclustered', (e: any) => {
      const p = e.features?.[0]?.properties;
      if (p?.id != null) emit('click-feature', { id: Number(p.id), kind: p.kind, title: p.title });
    });

    emit('loaded');
    emit('bbox', getBBox(m));
  });

  let idle: number | undefined;
  m.on('moveend', () => {
    if (idle) cic(idle);
    idle = ric(() => emit('bbox', getBBox(m)));
  });
});

onUnmounted(() => {
  map.value?.remove();
  map.value = null;
});

watch(() => props.points, (fc) => {
  const src = map.value?.getSource('points') as any;
  if (src && fc) src.setData(fc);
});
</script>

<template>
  <div ref="el" style="height: 420px; width: 100%" aria-label="Harita"></div>
</template>

<style scoped>
@import "maplibre-gl/dist/maplibre-gl.css";
</style>
