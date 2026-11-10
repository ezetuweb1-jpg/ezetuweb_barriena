import type { LangCode, Spot } from './types';

const GEO_LABELS: Record<string, { eu: string; es: string; en: string }> = {
  'Bizkaia': { eu: 'Bizkaia', es: 'Bizkaia', en: 'Biscay' },
  'Busturialdea': { eu: 'Busturialdea', es: 'Busturialdea', en: 'Busturialdea' },
  'Véneto': { eu: 'Veneto', es: 'Véneto', en: 'Veneto' },
  'Trentino-Alto Ádige': { eu: 'Trentino-Alto Ádige', es: 'Trentino-Alto Ádige', en: 'Trentino-Alto Adige' },
  'Toscana': { eu: 'Toskana', es: 'Toscana', en: 'Tuscany' },
  "Val d'Orcia": { eu: "Val d'Orcia", es: "Val d'Orcia", en: "Val d'Orcia" },
  'Dolomiti': { eu: 'Dolomiti', es: 'Dolomitas', en: 'Dolomites' },
  'Pirinioak (Sobrarbe)': { eu: 'Pirinioak (Sobrarbe)', es: 'Pirineos (Sobrarbe)', en: 'Pyrenees' },
  'Belluno': { eu: 'Belluno', es: 'Belluno', en: 'Belluno' },
  'Bolzano': { eu: 'Bolzano', es: 'Bolzano', en: 'Bolzano' },
  'Siena': { eu: 'Siena', es: 'Siena', en: 'Siena' },
  'Huesca': { eu: 'Huesca', es: 'Huesca', en: 'Huesca' },
};

export function geoLabel(key: string, lang: LangCode): string {
  const entry = GEO_LABELS[key];
  if (!entry) return key;
  if (lang === 'EUS') return entry.eu;
  if (lang === 'ES') return entry.es;
  return entry.en;
}

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/** Closest spots in the same country first, then same category, then anything nearby. */
export function pickNearbySpots<T extends Spot>(current: Spot, all: T[], limit = 4): Array<T & { distanceKm: number }> {
  const ranked = all
    .filter((s) => s.id !== current.id && Number.isFinite(s.latitude) && Number.isFinite(s.longitude))
    .map((spot) => ({ spot, distanceKm: getDistanceKm(current.latitude, current.longitude, spot.latitude, spot.longitude) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
  const sameCountry = ranked.filter((r) => r.spot.country_code === current.country_code);
  const otherCountry = ranked.filter((r) => r.spot.country_code !== current.country_code);
  const sameCategory = otherCountry.filter((r) => r.spot.category === current.category);
  const rest = otherCountry.filter((r) => r.spot.category !== current.category);
  return [...sameCountry, ...sameCategory, ...rest]
    .slice(0, limit)
    .map(({ spot, distanceKm }) => ({ ...spot, distanceKm }));
}
