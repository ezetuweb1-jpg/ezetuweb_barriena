import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, hasSupabase, getDeviceId } from './supabase';
import { getSeedSpots, getSeedPhotos, getSeedHeroPhoto, SEED_SPOTS_BY_ID, SEED_PHOTOS } from './seed-data';
import type { Photo, Spot, Tip, RatingRow, WishlistRow, Visit, Category, PhotoAward, AwardPeriod, AwardRank, ReportReason, TipReportReason } from './types';

const SEED_PHOTOS_BY_LIKES = new Map<string, Photo>();
for (const p of [...SEED_PHOTOS].sort((a, b) => b.likes - a.likes)) {
  if (!SEED_PHOTOS_BY_LIKES.has(p.spot_id)) SEED_PHOTOS_BY_LIKES.set(p.spot_id, p);
}
const SEED_PHOTOS_BY_TREND = SEED_PHOTOS_BY_LIKES; // alias for compatibility

export const deviceId = getDeviceId();

// ---------------------------------------------------------------------------
// Worldwide autocomplete dataset for the "Registrar Nuevo Rincón" flow.
// These are real places not yet in the DB, ready to be unlocked by explorers.
// Each entry has enough geographic data to prefill the form.
// ---------------------------------------------------------------------------

export interface AutocompletePlace {
  name: string;
  country: string;
  country_code: string;
  region: string;
  euskal_herria: string | null;
  latitude: number;
  longitude: number;
  category_hint: Category;
}

const AUTOCOMPLETE_PLACES: AutocompletePlace[] = [
  // Basque Country
  { name: 'Otsagabia', country: 'Spain', country_code: 'ES', region: 'Sakanako Harana', euskal_herria: 'Nafarroa', latitude: 42.8833, longitude: -0.9167, category_hint: 'village' },
  { name: 'Oñati', country: 'Spain', country_code: 'ES', region: 'Debagoiena', euskal_herria: 'Gipuzkoa', latitude: 43.0324, longitude: -2.4144, category_hint: 'village' },
  { name: 'Lekeitio', country: 'Spain', country_code: 'ES', region: 'Lea-Artibai', euskal_herria: 'Bizkaia', latitude: 43.3653, longitude: -2.4983, category_hint: 'village' },
  { name: 'Maule-Lextarre', country: 'France', country_code: 'FR', region: 'Xiberuko Lurraldea', euskal_herria: 'Zuberoa', latitude: 43.2322, longitude: -0.7333, category_hint: 'village' },
  // Spain
  { name: 'Potes', country: 'Spain', country_code: 'ES', region: 'Cantabria', euskal_herria: null, latitude: 43.1528, longitude: -4.6778, category_hint: 'village' },
  { name: 'Cadaqués', country: 'Spain', country_code: 'ES', region: 'Girona', euskal_herria: null, latitude: 42.2881, longitude: 3.2778, category_hint: 'village' },
  { name: 'Ronda', country: 'Spain', country_code: 'ES', region: 'Málaga', euskal_herria: null, latitude: 36.7421, longitude: -5.1664, category_hint: 'city' },
  { name: 'Cangas de Onís', country: 'Spain', country_code: 'ES', region: 'Asturias', euskal_herria: null, latitude: 43.3500, longitude: -5.1333, category_hint: 'village' },
  { name: 'Albarracín', country: 'Spain', country_code: 'ES', region: 'Teruel', euskal_herria: null, latitude: 40.4083, longitude: -1.4444, category_hint: 'village' },
  { name: 'Comillas', country: 'Spain', country_code: 'ES', region: 'Cantabria', euskal_herria: null, latitude: 43.3889, longitude: -4.2917, category_hint: 'village' },
  // France
  { name: 'Chamonix', country: 'France', country_code: 'FR', region: 'Haute-Savoie', euskal_herria: null, latitude: 45.9237, longitude: 6.8694, category_hint: 'nature' },
  { name: 'Annecy', country: 'France', country_code: 'FR', region: 'Haute-Savoie', euskal_herria: null, latitude: 45.8992, longitude: 6.1294, category_hint: 'city' },
  { name: 'Colmar', country: 'France', country_code: 'FR', region: 'Alsace', euskal_herria: null, latitude: 48.0775, longitude: 7.3550, category_hint: 'village' },
  // Italy
  { name: 'Manarola', country: 'Italy', country_code: 'IT', region: 'Liguria', euskal_herria: null, latitude: 44.1208, longitude: 9.7344, category_hint: 'village' },
  { name: 'Alberobello', country: 'Italy', country_code: 'IT', region: 'Puglia', euskal_herria: null, latitude: 40.7864, longitude: 17.2403, category_hint: 'village' },
  { name: 'Castelluccio', country: 'Italy', country_code: 'IT', region: 'Umbria', euskal_herria: null, latitude: 42.8264, longitude: 13.1750, category_hint: 'nature' },
  { name: 'Siena', country: 'Italy', country_code: 'IT', region: 'Siena', euskal_herria: null, latitude: 43.3188, longitude: 11.3308, category_hint: 'city' },
  // Other Europe
  { name: 'Hallstatt', country: 'Austria', country_code: 'AT', region: 'Oberösterreich', euskal_herria: null, latitude: 47.5622, longitude: 13.6494, category_hint: 'village' },
  { name: 'Garmisch-Partenkirchen', country: 'Germany', country_code: 'DE', region: 'Bayern', euskal_herria: null, latitude: 47.4917, longitude: 11.0956, category_hint: 'nature' },
  { name: 'Piran', country: 'Slovenia', country_code: 'SI', region: 'Primorska', euskal_herria: null, latitude: 45.5275, longitude: 13.5683, category_hint: 'village' },
  { name: 'Mostar', country: 'Bosnia and Herzegovina', country_code: 'BA', region: 'Herzegovina', euskal_herria: null, latitude: 43.3438, longitude: 17.8078, category_hint: 'city' },
  { name: 'Kotor', country: 'Montenegro', country_code: 'ME', region: 'Boka Kotorska', euskal_herria: null, latitude: 42.4247, longitude: 18.7711, category_hint: 'village' },
  { name: 'Tromsø', country: 'Norway', country_code: 'NO', region: 'Troms', euskal_herria: null, latitude: 69.6492, longitude: 18.9553, category_hint: 'nature' },
  // Beyond Europe
  { name: 'Banff', country: 'Canada', country_code: 'CA', region: 'Alberta', euskal_herria: null, latitude: 51.1784, longitude: -115.5708, category_hint: 'nature' },
  { name: 'Quebec City', country: 'Canada', country_code: 'CA', region: 'Québec', euskal_herria: null, latitude: 46.8139, longitude: -71.2080, category_hint: 'city' },
  { name: 'Ushuaia', country: 'Argentina', country_code: 'AR', region: 'Tierra del Fuego', euskal_herria: null, latitude: -54.8019, longitude: -68.3030, category_hint: 'nature' },
  { name: 'Cusco', country: 'Peru', country_code: 'PE', region: 'Cusco', euskal_herria: null, latitude: -13.5319, longitude: -71.9675, category_hint: 'city' },
  { name: 'Lofoten', country: 'Norway', country_code: 'NO', region: 'Nordland', euskal_herria: null, latitude: 68.2109, longitude: 14.5706, category_hint: 'nature' },
];

export function searchAutocomplete(query: string): AutocompletePlace[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return AUTOCOMPLETE_PLACES.filter(
    (p) => p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q) || p.region.toLowerCase().includes(q),
  ).slice(0, 8);
}

// ---------------------------------------------------------------------------
// Broad regions — too large to register as a single spot.
// Each carries a curated list of concrete sub-spots the user is redirected to.
// ---------------------------------------------------------------------------

export interface BroadSubSpot {
  name: string;
  category_hint: Category;
  province?: string;
  description?: string;
  coordinates: [number, number];
}

export interface BroadRegion {
  id: string;
  name: string;
  aliases?: string[];
  country: string;
  country_code: string;
  sub_spots: BroadSubSpot[];
}

const BROAD_REGIONS: BroadRegion[] = [
  {
    id: 'costa-amalfitana',
    name: 'Costa Amalfitana',
    aliases: ['Amalfi Coast', 'Costiera Amalfitana', 'Amalfiko Kosta'],
    country: 'Italy',
    country_code: 'IT',
    sub_spots: [
      { name: 'Positano', category_hint: 'village', province: 'Salerno', description: 'Pueblo con encanto · Salerno', coordinates: [40.6281, 14.4850] },
      { name: 'Amalfi', category_hint: 'village', province: 'Salerno', description: 'Pueblo con encanto · Salerno', coordinates: [40.6340, 14.6027] },
      { name: 'Ravello', category_hint: 'village', province: 'Salerno', description: 'Pueblo histórico · Salerno', coordinates: [40.6493, 14.6116] },
      { name: 'Fiordo di Furore', category_hint: 'nature', province: 'Salerno', description: 'Cala y puente natural', coordinates: [40.6167, 14.4842] },
    ],
  },
  {
    id: 'dolomitas',
    name: 'Dolomitas',
    aliases: ['Dolomiti', 'Dolomites', 'Dolomiten'],
    country: 'Italy',
    country_code: 'IT',
    sub_spots: [
      { name: 'Cortina d\'Ampezzo', category_hint: 'village', province: 'Belluno', description: 'Pueblo alpino · Belluno', coordinates: [46.5405, 12.1357] },
      { name: 'Lago di Braies', category_hint: 'nature', province: 'Bolzano', description: 'Lago alpino · Bolzano', coordinates: [46.6942, 12.0856] },
      { name: 'Seceda', category_hint: 'nature', province: 'Bolzano', description: 'Mirador de cumbres · Bolzano', coordinates: [46.5986, 11.7270] },
      { name: 'Tre Cime di Lavaredo', category_hint: 'nature', province: 'Belluno', description: 'Cumbres icónicas · Belluno', coordinates: [46.6186, 12.2948] },
    ],
  },
  {
    id: 'pirineos',
    name: 'Pirineos',
    aliases: ['Pyrenees', 'Pirinioak', 'Pirénées'],
    country: 'Spain',
    country_code: 'ES',
    sub_spots: [
      { name: 'Potes', category_hint: 'village', province: 'Cantabria', description: 'Pueblo con encanto · Cantabria', coordinates: [43.1528, -4.6778] },
      { name: 'Aínsa', category_hint: 'village', province: 'Huesca', description: 'Pueblo histórico · Huesca', coordinates: [42.4150, 0.1408] },
      { name: 'Ordesa', category_hint: 'nature', province: 'Huesca', description: 'Parque Nacional · Huesca', coordinates: [42.6667, 0.0333] },
      { name: 'Cangas de Onís', category_hint: 'village', province: 'Asturias', description: 'Pueblo con encanto · Asturias', coordinates: [43.3500, -5.1333] },
    ],
  },
  {
    id: 'toscana',
    name: 'Toscana',
    aliases: ['Tuscany', 'Toskana'],
    country: 'Italy',
    country_code: 'IT',
    sub_spots: [
      { name: 'Siena', category_hint: 'city', province: 'Siena', description: 'Ciudad histórica · Siena', coordinates: [43.3188, 11.3308] },
      { name: 'San Gimignano', category_hint: 'village', province: 'Siena', description: 'Pueblo con encanto · Siena', coordinates: [43.4677, 11.0431] },
      { name: 'Val d\'Orcia', category_hint: 'nature', province: 'Siena', description: 'Paisaje de colinas · Siena', coordinates: [43.0600, 11.5500] },
      { name: 'Pienza', category_hint: 'village', province: 'Siena', description: 'Pueblo histórico · Siena', coordinates: [43.0772, 11.6782] },
    ],
  },
  {
    id: 'selva-negra',
    name: 'Selva Negra',
    aliases: ['Schwarzwald', 'Black Forest'],
    country: 'Germany',
    country_code: 'DE',
    sub_spots: [
      { name: 'Triberg', category_hint: 'village', province: 'Baden-Württemberg', description: 'Pueblo de cascadas', coordinates: [48.1318, 8.2330] },
      { name: 'Freiburg', category_hint: 'city', province: 'Baden-Württemberg', description: 'Ciudad universitaria', coordinates: [47.9990, 7.8421] },
      { name: 'Titisee', category_hint: 'nature', province: 'Baden-Württemberg', description: 'Lago alpino', coordinates: [47.9020, 8.1540] },
    ],
  },
  {
    id: 'costa-brava',
    name: 'Costa Brava',
    aliases: ['Costa Brava'],
    country: 'Spain',
    country_code: 'ES',
    sub_spots: [
      { name: 'Cadaqués', category_hint: 'village', province: 'Girona', description: 'Pueblo con encanto · Girona', coordinates: [42.2881, 3.2778] },
      { name: 'Tossa de Mar', category_hint: 'village', province: 'Girona', description: 'Pueblo amurallado · Girona', coordinates: [41.7196, 2.9310] },
      { name: 'Cala Aiguafreda', category_hint: 'nature', province: 'Girona', description: 'Cala escondida · Girona', coordinates: [41.9510, 3.2180] },
    ],
  },
];

export function searchBroadRegions(query: string): BroadRegion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return BROAD_REGIONS.filter(
    (r) => r.name.toLowerCase().includes(q) || (r.aliases ?? []).some((a) => a.toLowerCase().includes(q)),
  ).slice(0, 4);
}

export function getBroadRegion(id: string): BroadRegion | undefined {
  return BROAD_REGIONS.find((r) => r.id === id || r.name === id);
}

/** Insert a new spot into the DB and return the created row. */
export async function insertSpot(
  place: AutocompletePlace,
  category: Category,
  ratings: { photogenic: number; tranquility: number; accessibility: number },
  tip: string | null,
  tipAuthor: string,
): Promise<SpotWithRelations | null> {
  if (!hasSupabase) throw new Error('Supabase is not configured');
  const bayesian = +((ratings.photogenic + ratings.tranquility + ratings.accessibility) / 3).toFixed(1);
  const { data, error } = await supabase
    .from('spots')
    .insert({
      name: place.name,
      country: place.country,
      country_code: place.country_code,
      region: place.region,
      category,
      latitude: place.latitude,
      longitude: place.longitude,
      elevation_m: null,
      protected_zone: false,
      euskal_herria: place.euskal_herria,
      province: place.euskal_herria ?? place.region,
      provinces: [place.euskal_herria ?? place.region],
      comarca: place.euskal_herria ? place.region : null,
      bayesian_rating: bayesian,
      ratings_count: 1,
      verified: false,
      description: null,
      translations: {},
      iconic_spots: { spots: [] },
    })
    .select('*, cover_photo:photos!photos_spot_id_fkey(*)')
    .single();
  if (error) throw error;
  if (!data) return null;

  // Insert the initial rating
  await supabase.from('ratings').insert({
    spot_id: data.id,
    device_id: deviceId,
    photogenic: ratings.photogenic,
    tranquility: ratings.tranquility,
    accessibility: ratings.accessibility,
  });

  // Insert optional tip
  if (tip && tip.trim()) {
    await supabase.from('tips').insert({
      spot_id: data.id,
      device_id: deviceId,
      author: tipAuthor || 'Explorador',
      content: tip.trim(),
    });
  }

  // Normalize iconic_spots like fetchSpots does
  const rawIconic = (data as Record<string, unknown>).iconic_spots as { spots?: string[] } | string[] | null;
  const iconicSpots: string[] | null = Array.isArray(rawIconic)
    ? rawIconic
    : (rawIconic && Array.isArray(rawIconic.spots) ? rawIconic.spots : null);
  return { ...(data as unknown as Spot), iconic_spots: iconicSpots };
}


/** Insert a new spot AND its first cover photo in a single operation. The photo becomes the #1 cover. */
export async function insertSpotWithPhoto(
  place: AutocompletePlace,
  category: Category,
  ratings: { photogenic: number; tranquility: number; accessibility: number },
  tip: string | null,
  tipAuthor: string,
  photoData: { imageUrl: string; width: number; height: number; author: string; exif?: { camera_model?: string | null; lens?: string | null; aperture?: string | null; shutter_speed?: string | null; iso?: number | null } },
): Promise<SpotWithRelations | null> {
  if (!hasSupabase) throw new Error('Supabase is not configured');
  const bayesian = +((ratings.photogenic + ratings.tranquility + ratings.accessibility) / 3).toFixed(1);
  const { data: spotData, error: spotErr } = await supabase
    .from('spots')
    .insert({
      name: place.name,
      country: place.country,
      country_code: place.country_code,
      region: place.region,
      category,
      latitude: place.latitude,
      longitude: place.longitude,
      elevation_m: null,
      protected_zone: false,
      euskal_herria: place.euskal_herria,
      province: place.euskal_herria ?? place.region,
      provinces: [place.euskal_herria ?? place.region],
      comarca: place.euskal_herria ? place.region : null,
      bayesian_rating: bayesian,
      ratings_count: 1,
      verified: false,
      description: null,
      translations: {},
      iconic_spots: { spots: [] },
    })
    .select('*, cover_photo:photos!photos_spot_id_fkey(*)')
    .single();
  if (spotErr) throw spotErr;
  if (!spotData) return null;

  // Insert the cover photo
  const { error: photoErr } = await supabase.from('photos').insert({
    spot_id: spotData.id,
    image_url: photoData.imageUrl,
    width: photoData.width,
    height: photoData.height,
    author: photoData.author || 'Viajero',
    device_id: deviceId,
    season: 'summer',
    likes: 0,
    trend_score: 50,
    is_hero: false,
    camera_model: photoData.exif?.camera_model ?? null,
    lens: photoData.exif?.lens ?? null,
    aperture: photoData.exif?.aperture ?? null,
    shutter_speed: photoData.exif?.shutter_speed ?? null,
    iso: photoData.exif?.iso ?? null,
  });
  if (photoErr) throw photoErr;

  // Insert the initial rating
  await supabase.from('ratings').insert({
    spot_id: spotData.id,
    device_id: deviceId,
    photogenic: ratings.photogenic,
    tranquility: ratings.tranquility,
    accessibility: ratings.accessibility,
  });

  // Insert optional tip
  if (tip && tip.trim()) {
    await supabase.from('tips').insert({
      spot_id: spotData.id,
      device_id: deviceId,
      author: tipAuthor || 'Explorador',
      content: tip.trim(),
    });
  }

  const rawIconic = (spotData as Record<string, unknown>).iconic_spots as { spots?: string[] } | string[] | null;
  const iconicSpots: string[] | null = Array.isArray(rawIconic)
    ? rawIconic
    : (rawIconic && Array.isArray(rawIconic.spots) ? rawIconic.spots : null);
  return { ...(spotData as unknown as Spot), iconic_spots: iconicSpots };
}

export interface SpotWithRelations extends Spot {
  cover_photo?: Photo;
  photo_count?: number;
}

export interface Stats {
  cities: number;
  villages: number;
  nature: number;
  countries: Set<string>;
  totalVisited: number;
}

// Country -> continents mapping for badges
const COUNTRY_CONTINENT: Record<string, string> = {
  ES: 'Europe', FR: 'Europe', IT: 'Europe', GB: 'Europe', AT: 'Europe',
  CH: 'Europe', NO: 'Europe', FO: 'Europe', HR: 'Europe', CZ: 'Europe',
  DE: 'Europe', GR: 'Europe', IS: 'Europe',
  SI: 'Europe', BA: 'Europe', ME: 'Europe',
  JP: 'Asia', MA: 'Africa', TR: 'Asia',
  CA: 'North America', CL: 'South America',
  AR: 'South America', PE: 'South America',
};
export const CONTINENTS_TOTAL = 7;
export const COUNTRIES_TOTAL = 195;

export function continentOf(cc: string): string | null {
  return COUNTRY_CONTINENT[cc] ?? null;
}

export async function fetchSpots(): Promise<SpotWithRelations[]> {
  if (!hasSupabase) return getSeedSpots().map((s) => ({ ...s, cover_photo: SEED_PHOTOS_BY_LIKES.get(s.id) }));
  const { data, error } = await supabase
    .from('spots')
    .select('*, cover_photo:photos!photos_spot_id_fkey(*)')
    .order('bayesian_rating', { ascending: false });
  if (error) throw error;
  // Democratic cover: pick the #1 most-liked photo for each spot.
  // Supabase returns the FK relation as an array; we sort by likes desc.
  return (data ?? []).map((s: Record<string, unknown>) => {
    const cp = s.cover_photo as Photo | Photo[] | null;
    let cover: Photo | undefined;
    if (Array.isArray(cp)) cover = cp.sort((a, b) => b.likes - a.likes)[0];
    else cover = cp ?? undefined;
    // Normalize iconic_spots: stored as {"spots": [...]} JSONB
    const rawIconic = s.iconic_spots as { spots?: string[] } | string[] | null;
    const iconicSpots: string[] | null = Array.isArray(rawIconic)
      ? rawIconic
      : (rawIconic && Array.isArray(rawIconic.spots) ? rawIconic.spots : null);
    return { ...(s as unknown as Spot), cover_photo: cover, iconic_spots: iconicSpots };
  });
}

export async function fetchPhotos(filters?: {
  season?: string; category?: string; time?: string;
}): Promise<(Photo & { spot?: Spot })[]> {
  if (!hasSupabase) return getSeedPhotos(filters);
  let q = supabase.from('photos').select('*, spot:spots(*)');
  if (filters?.season && filters.season !== 'all') q = q.eq('season', filters.season);
  if (filters?.time === 'trending') q = q.order('trend_score', { ascending: false });
  else if (filters?.time === 'today') {
    q = q.gte('created_at', new Date(Date.now() - 86400000).toISOString()).order('likes', { ascending: false });
  } else if (filters?.time === 'week') {
    q = q.gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()).order('likes', { ascending: false });
  } else if (filters?.time === 'month') {
    q = q.gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()).order('likes', { ascending: false });
  } else if (filters?.time === 'new') {
    q = q.order('created_at', { ascending: false });
  } else {
    q = q.order('likes', { ascending: false });
  }
  q = q.limit(48);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as (Photo & { spot?: Spot })[];
}

export async function fetchHeroPhoto(): Promise<(Photo & { spot?: Spot }) | null> {
  if (!hasSupabase) return getSeedHeroPhoto();
  const { data, error } = await supabase
    .from('photos')
    .select('*, spot:spots(*)')
    .eq('is_hero', true)
    .order('trend_score', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as (Photo & { spot?: Spot }) | null;
}

export async function fetchPhotosForSpot(spotId: string): Promise<Photo[]> {
  if (!hasSupabase) return SEED_PHOTOS.filter((p) => p.spot_id === spotId)
    .sort((a, b) => b.likes - a.likes);
  const { data, error } = await supabase
    .from('photos').select('*').eq('spot_id', spotId)
    .order('likes', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPhotosByAuthor(author: string): Promise<(Photo & { spot?: Spot })[]> {
  if (!hasSupabase) {
    return SEED_PHOTOS
      .filter((p) => p.author.toLowerCase() === author.toLowerCase())
      .map((p) => ({ ...p, spot: SEED_SPOTS_BY_ID.get(p.spot_id) }))
      .sort((a, b) => b.likes - a.likes);
  }
  const { data, error } = await supabase
    .from('photos').select('*, spot:spots(*)')
    .ilike('author', author)
    .order('likes', { ascending: false });
  if (error) throw error;
  return (data ?? []) as (Photo & { spot?: Spot })[];
}

type AwardRow = {
  id: string;
  period_type: AwardPeriod;
  period_start: string;
  rank: AwardRank;
  photo_id: string;
  author_id: string;
  photo: (Photo & { spot?: Spot }) | null;
};

export async function fetchPhotoAwards(): Promise<PhotoAward[]> {
  if (!hasSupabase) return [];
  const { data, error } = await supabase
    .from('photo_awards')
    .select('id, period_type, period_start, rank, photo_id, author_id, photo:photos(*, spot:spots(*))')
    .order('period_start', { ascending: false })
    .order('rank', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as AwardRow[]).flatMap((row) => row.photo ? [{
    id: row.id,
    period: row.period_type,
    periodStart: row.period_start,
    rank: row.rank,
    photoId: row.photo_id,
    authorId: row.author_id,
    photo: row.photo,
  }] : []);
}

export async function fetchAllPhotographers(): Promise<{ author: string; count: number; likes: number }[]> {
  if (!hasSupabase) {
    const map = new Map<string, { count: number; likes: number }>();
    for (const p of SEED_PHOTOS) {
      const e = map.get(p.author) ?? { count: 0, likes: 0 };
      e.count += 1; e.likes += p.likes;
      map.set(p.author, e);
    }
    return Array.from(map.entries())
      .map(([author, v]) => ({ author, ...v }))
      .sort((a, b) => b.likes - a.likes);
  }
  const { data, error } = await supabase
    .from('photos').select('author, likes');
  if (error) throw error;
  const map = new Map<string, { count: number; likes: number }>();
  for (const row of (data ?? []) as { author: string; likes: number }[]) {
    const e = map.get(row.author) ?? { count: 0, likes: 0 };
    e.count += 1; e.likes += row.likes;
    map.set(row.author, e);
  }
  return Array.from(map.entries())
    .map(([author, v]) => ({ author, ...v }))
    .sort((a, b) => b.likes - a.likes);
}

export async function fetchPhotosByAuthors(authors: string[]): Promise<(Photo & { spot?: Spot })[]> {
  if (authors.length === 0) return [];
  if (!hasSupabase) {
    const set = new Set(authors);
    return SEED_PHOTOS
      .filter((p) => set.has(p.author))
      .map((p) => ({ ...p, spot: SEED_SPOTS_BY_ID.get(p.spot_id) }))
      .sort((a, b) => b.likes - a.likes);
  }
  const { data, error } = await supabase
    .from('photos').select('*, spot:spots(*)')
    .in('author', authors)
    .order('created_at', { ascending: false })
    .limit(96);
  if (error) throw error;
  return (data ?? []) as (Photo & { spot?: Spot })[];
}

export async function fetchFollowerCount(author: string): Promise<number> {
  if (!hasSupabase) return 0;
  const { data, error } = await supabase.rpc('follower_count', { p_author: author });
  if (error) throw error;
  return Number(data ?? 0);
}

export async function setAuthorFollowed(author: string, follow: boolean): Promise<void> {
  if (!hasSupabase) return;
  const { error } = await supabase.rpc('set_photographer_follow', {
    p_device_id: deviceId,
    p_author: author,
    p_follow: follow,
  });
  if (error) throw error;
}

export async function fetchTips(spotId: string): Promise<Tip[]> {
  if (!hasSupabase) return [];
  const { data, error } = await supabase
    .from('tips').select('*').eq('spot_id', spotId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addTip(spotId: string, author: string, content: string): Promise<Tip | null> {
  if (!hasSupabase) return null;
  const { data, error } = await supabase
    .from('tips').insert({ spot_id: spotId, device_id: deviceId, author: author || 'Viajero', content })
    .select().single();
  if (error) throw error;
  return data as Tip;
}

export async function fetchMyRating(spotId: string): Promise<RatingRow | null> {
  if (!hasSupabase) return null;
  const { data, error } = await supabase
    .from('ratings').select('*').eq('spot_id', spotId).eq('device_id', deviceId).maybeSingle();
  if (error) throw error;
  return data as RatingRow | null;
}

export async function upsertRating(spotId: string, photogenic: number, tranquility: number, accessibility: number): Promise<void> {
  if (!hasSupabase) return;
  const { error } = await supabase
    .from('ratings')
    .upsert({ spot_id: spotId, device_id: deviceId, photogenic, tranquility, accessibility },
      { onConflict: 'spot_id,device_id' });
  if (error) throw error;
}

export async function fetchVisits(): Promise<Visit[]> {
  if (!hasSupabase) return [];
  const { data, error } = await supabase
    .from('visits').select('*').eq('device_id', deviceId);
  if (error) throw error;
  return data ?? [];
}

export async function markVisited(spotId: string): Promise<boolean> {
  if (!hasSupabase) return false;
  const { error } = await supabase
    .from('visits').upsert({ spot_id: spotId, device_id: deviceId }, { onConflict: 'spot_id,device_id' });
  if (error) throw error;
  return true;
}

export async function unmarkVisited(spotId: string): Promise<void> {
  if (!hasSupabase) return;
  const { error } = await supabase
    .from('visits').delete().eq('spot_id', spotId).eq('device_id', deviceId);
  if (error) throw error;
}

export async function fetchWishlist(): Promise<WishlistRow[]> {
  if (!hasSupabase) return [];
  const { data, error } = await supabase
    .from('wishlists').select('*').eq('device_id', deviceId);
  if (error) throw error;
  return data ?? [];
}

export async function toggleWishlist(spotId: string, currentlySaved: boolean): Promise<boolean> {
  if (!hasSupabase) return false;
  if (currentlySaved) {
    const { error } = await supabase.from('wishlists').delete()
      .eq('spot_id', spotId).eq('device_id', deviceId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase.from('wishlists').insert({ spot_id: spotId, device_id: deviceId });
  if (error) throw error;
  return true;
}

export async function isPhotoLiked(photoId: string): Promise<boolean> {
  if (!hasSupabase) return false;
  const { data, error } = await supabase
    .from('photo_likes').select('id').eq('photo_id', photoId).eq('device_id', deviceId).maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function togglePhotoLike(photoId: string, currentlyLiked: boolean): Promise<boolean> {
  if (!hasSupabase) return false;
  if (currentlyLiked) {
    await supabase.from('photo_likes').delete().eq('photo_id', photoId).eq('device_id', deviceId);
    try { await supabase.rpc('decrement_photo_likes', { p_photo_id: photoId }); } catch { /* ignore */ }
    return false;
  }
  await supabase.from('photo_likes').insert({ photo_id: photoId, device_id: deviceId });
  try { await supabase.rpc('increment_photo_likes', { p_photo_id: photoId }); } catch { /* ignore */ }
  return true;
}

// Search for the upload modal — municipalities + natural landmarks
export async function searchSpots(query: string): Promise<Spot[]> {
  if (!query.trim()) return [];
  if (!hasSupabase) return getSeedSpots().filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8);
  const { data, error } = await supabase
    .from('spots').select('*').ilike('name', `%${query.trim()}%`).limit(8);
  if (error) throw error;
  return data ?? [];
}

export async function submitReport(photoId: string, reason: ReportReason, details: string | null): Promise<void> {
  if (!hasSupabase) return;
  const { error } = await supabase.from('photo_reports')
    .insert({ photo_id: photoId, device_id: deviceId, reason, details });
  if (error) throw error;
}

export async function submitTipReport(tipId: string, reason: TipReportReason, details: string | null): Promise<void> {
  if (!hasSupabase) return;
  const { error } = await supabase.from('tip_reports')
    .insert({ tip_id: tipId, device_id: deviceId, reason, details });
  if (error) throw error;
}

export function computeStats(visits: Visit[], spotsById: Map<string, Spot>): Stats {
  let cities = 0, villages = 0, nature = 0;
  const countries = new Set<string>();
  for (const v of visits) {
    const s = spotsById.get(v.spot_id);
    if (!s) continue;
    if (s.category === 'city') cities++;
    else if (s.category === 'village') villages++;
    else nature++;
    if (s.country_code) countries.add(s.country_code);
  }
  return { cities, villages, nature, countries, totalVisited: visits.length };
}

// Hook: load all spots once
export function useSpots(refreshKey?: number) {
  const [spots, setSpots] = useState<SpotWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const s = await fetchSpots();
      setSpots(s);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await fetchSpots();
        if (alive) { setSpots(s); setLoading(false); }
      } catch (e) {
        if (alive) {
          const s = getSeedSpots().map((sp) => ({ ...sp, cover_photo: SEED_PHOTOS_BY_TREND.get(sp.id) }));
          setSpots(s); setLoading(false);
        }
      }
    })();
    return () => { alive = false; };
  }, [refreshKey]);

  return { spots, loading, error, refresh };
}

export function useVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const v = await fetchVisits();
      setVisits(v);
    } catch {
      /* supabase not configured or error — leave empty */
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const visitedIds = useMemo(() => new Set(visits.map((v) => v.spot_id)), [visits]);

  return { visits, visitedIds, loading, refresh, setVisits };
}


export function useWishlist() {
  const [items, setItems] = useState<WishlistRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try { setItems(await fetchWishlist()); } catch { /* not configured */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const savedIds = useMemo(() => new Set(items.map((i) => i.spot_id)), [items]);
  return { items, savedIds, loading, refresh, setItems };
}
