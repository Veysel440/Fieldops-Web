import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';

let installed = false;
export function ensurePMTilesProtocol() {
  if (installed) return;
  const protocol = new Protocol();
  (maplibregl as any).addProtocol?.('pmtiles', protocol.tile);
  installed = true;
}
