export type Category = 'city' | 'village' | 'nature';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type TimeFilter = 'trending' | 'today' | 'week' | 'month' | 'historic' | 'new';
export type LangCode = 'EUS' | 'ES' | 'EN' | 'FR' | 'DE' | 'IT';
export type ViewTab = 'gallery' | 'rankings' | 'map' | 'passport';

/** Maps app LangCode to the 2-letter key used in the `translations` JSONB column. */
export const LANG_KEY: Record<LangCode, string> = {
  EUS: 'eu',
  ES: 'es',
  EN: 'en',
  FR: 'fr',
  DE: 'de',
  IT: 'it',
};

/** Multilingual translations keyed by 2-letter language code. */
export type Translations = Record<string, string>;

export interface Spot {
  id: string;
  name: string;
  country: string;
  country_code: string;
  region: string | null;
  category: Category;
  latitude: number;
  longitude: number;
  elevation_m: number | null;
  protected_zone: boolean;
  euskal_herria: string | null;
  province: string | null;
  provinces: string[] | null;
  comarca: string | null;
  bayesian_rating: number;
  ratings_count: number;
  verified: boolean;
  description: string | null;
  translations: Translations | null;
  iconic_spots: string[] | null;
}

export interface Photo {
  id: string;
  spot_id: string;
  image_url: string;
  width: number;
  height: number;
  author: string;
  device_id: string | null;
  season: Season;
  likes: number;
  trend_score: number;
  is_hero: boolean;
  created_at: string;
  camera_model: string | null;
  lens: string | null;
  aperture: string | null;
  shutter_speed: string | null;
  iso: number | null;
}

export type ReportReason = 'ai_generated' | 'fake_place' | 'wrong_place' | 'people_selfie' | 'plagiarism';
export type TipReportReason = 'spam' | 'abuse' | 'false_info';

export interface PhotoReport {
  id: string;
  photo_id: string;
  device_id: string;
  reason: ReportReason;
  details: string | null;
  created_at: string;
}

export interface TipReport {
  id: string;
  tip_id: string;
  device_id: string;
  reason: TipReportReason;
  details: string | null;
  created_at: string;
}

export interface SpotWithPhoto extends Spot {
  cover_photo?: Photo;
  photo_count?: number;
}

export interface Tip {
  id: string;
  spot_id: string;
  device_id: string;
  author: string;
  content: string;
  translations: Translations | null;
  created_at: string;
}

export interface RatingRow {
  id: string;
  spot_id: string;
  device_id: string;
  photogenic: number;
  tranquility: number;
  accessibility: number;
  created_at: string;
}

export interface Visit {
  id: string;
  spot_id: string;
  device_id: string;
  created_at: string;
}

export interface WishlistRow {
  id: string;
  spot_id: string;
  device_id: string;
  created_at: string;
}

export interface PhotoLike {
  id: string;
  photo_id: string;
  device_id: string;
}

export type AwardPeriod = 'month' | 'year';
export type AwardRank = 1 | 2 | 3;

export interface PhotoAward {
  id: string;
  period: AwardPeriod;
  periodStart: string;
  rank: AwardRank;
  photoId: string;
  authorId: string;
  photo: Photo & { spot?: Spot };
}
