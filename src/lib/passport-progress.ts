export type PassportLang = 'es' | 'eu' | 'en';

export interface XpInput {
  visits: number;
  reviews: number;
  photos: number;
  photoLikes: number;
  pioneerSpots: number;
}

export const XP_WEIGHTS = { visit: 15, review: 30, photo: 60, photoLike: 3, pioneer: 100 } as const;

export function computeXp(input: XpInput): number {
  return input.visits * XP_WEIGHTS.visit
    + input.reviews * XP_WEIGHTS.review
    + input.photos * XP_WEIGHTS.photo
    + input.photoLikes * XP_WEIGHTS.photoLike
    + input.pioneerSpots * XP_WEIGHTS.pioneer;
}

export interface LevelDef {
  level: number;
  minXp: number;
  names: Record<PassportLang, string>;
}

export const LEVELS: LevelDef[] = [
  { level: 1, minXp: 0, names: { es: 'Turista de Sofá', eu: 'Sofa-Turista', en: 'Couch Tourist' } },
  { level: 2, minXp: 301, names: { es: 'Escapista', eu: 'Iheslaria', en: 'Weekender' } },
  { level: 3, minXp: 1201, names: { es: 'Explorador', eu: 'Esploratzailea', en: 'Explorer' } },
  { level: 4, minXp: 3001, names: { es: 'Trotamundos', eu: 'Mundubilaria', en: 'Globetrotter' } },
  { level: 5, minXp: 7000, names: { es: 'Leyenda de la Tierra', eu: 'Lurreko Kondaira', en: 'Earth Legend' } },
];

export interface LevelProgress {
  level: LevelDef;
  nextLevel: LevelDef | null;
  xp: number;
  xpToNext: number;
  pct: number;
}

export function levelProgress(xp: number): LevelProgress {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].minXp) idx = i;
  const level = LEVELS[idx];
  const nextLevel = LEVELS[idx + 1] ?? null;
  if (!nextLevel) return { level, nextLevel, xp, xpToNext: 0, pct: 100 };
  const span = nextLevel.minXp - level.minXp;
  const into = xp - level.minXp;
  return {
    level,
    nextLevel,
    xp,
    xpToNext: nextLevel.minXp - xp,
    pct: Math.min(100, Math.max(0, (into / span) * 100)),
  };
}

export type RetoId = 'cabra' | 'alma' | 'calas' | 'pionero' | 'ojo' | 'trotamundos';
export type Tier = 0 | 1 | 2 | 3;

export interface RetoDef {
  id: RetoId;
  thresholds: [number, number, number];
}

export const RETOS: RetoDef[] = [
  { id: 'cabra', thresholds: [3, 10, 25] },
  { id: 'alma', thresholds: [5, 15, 35] },
  { id: 'calas', thresholds: [5, 15, 30] },
  { id: 'pionero', thresholds: [1, 5, 15] },
  { id: 'ojo', thresholds: [50, 250, 1000] },
  { id: 'trotamundos', thresholds: [3, 10, 25] },
];

const TIERS_KEY = 'ezetu_passport_tiers';

export function tierFor(value: number, thresholds: [number, number, number]): Tier {
  if (value >= thresholds[2]) return 3;
  if (value >= thresholds[1]) return 2;
  if (value >= thresholds[0]) return 1;
  return 0;
}

// Earned tiers are persisted so they never drop when the underlying data shrinks.
export function loadEarnedTiers(): Partial<Record<RetoId, Tier>> {
  try {
    const raw = localStorage.getItem(TIERS_KEY);
    return raw ? (JSON.parse(raw) as Partial<Record<RetoId, Tier>>) : {};
  } catch { return {}; }
}

export function mergeEarnedTiers(current: Record<RetoId, number>): Record<RetoId, Tier> {
  const stored = loadEarnedTiers();
  const merged = {} as Record<RetoId, Tier>;
  for (const reto of RETOS) {
    const computed = tierFor(current[reto.id], reto.thresholds);
    merged[reto.id] = Math.max(computed, stored[reto.id] ?? 0) as Tier;
  }
  try { localStorage.setItem(TIERS_KEY, JSON.stringify(merged)); } catch { /* ignore */ }
  return merged;
}


