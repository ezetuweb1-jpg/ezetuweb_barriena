import type { FeatureCollection, Geometry } from 'geojson';
import type { Spot } from '@/lib/types';

export type GeoCollection = FeatureCollection<Geometry, { iso?: string; name: string }>;

export interface GeoAtlas {
  countries: GeoCollection;
  euskalHerria: GeoCollection;
}

interface BasqueTerritory {
  id: string;
  aliases: string[];
}

const BASQUE_TERRITORIES: BasqueTerritory[] = [
  { id: 'araba', aliases: ['Araba', 'Álava', 'Alava'] },
  { id: 'bizkaia', aliases: ['Bizkaia', 'Vizcaya'] },
  { id: 'gipuzkoa', aliases: ['Gipuzkoa', 'Guipúzcoa', 'Guipuzcoa'] },
  { id: 'nafarroa', aliases: ['Nafarroa', 'Navarra'] },
  { id: 'lapurdi', aliases: ['Lapurdi', 'Labourd'] },
  { id: 'nafarroa-beherea', aliases: ['Nafarroa Beherea', 'Behe Nafarroa', 'Baxenabarre', 'Baja Navarra'] },
  { id: 'zuberoa', aliases: ['Zuberoa', 'Soule'] },
];

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

export function spotProvinceKeys(spot: Spot): Set<string> {
  return new Set([spot.province, ...(spot.provinces ?? [])].filter((v): v is string => !!v).map(normalize));
}

export function territoryIdsForSpot(spot: Spot): string[] {
  const keys = spotProvinceKeys(spot);
  return BASQUE_TERRITORIES
    .filter((t) => t.aliases.some((a) => keys.has(normalize(a))))
    .map((t) => t.id);
}

export function spotsInCountry(spots: Spot[], iso: string): Spot[] {
  return spots.filter((s) => s.country_code === iso);
}

let atlasPromise: Promise<GeoAtlas> | null = null;

async function fetchCollection(path: string): Promise<GeoCollection> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Map data unavailable (${response.status})`);
  const json = (await response.json()) as GeoCollection;
  if (json.type !== 'FeatureCollection' || !Array.isArray(json.features)) {
    throw new Error('Map data has an unexpected shape');
  }
  return json;
}

export function loadGeoAtlas(): Promise<GeoAtlas> {
  if (!atlasPromise) {
    atlasPromise = Promise.all([
      fetchCollection('/geo/world-countries.json'),
      fetchCollection('/geo/euskal-herria.json'),
    ]).then(([countries, euskalHerria]) => ({ countries, euskalHerria }))
      .catch((error: unknown) => {
        atlasPromise = null;
        throw error;
      });
  }
  return atlasPromise;
}
