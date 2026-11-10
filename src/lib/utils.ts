import type { LangCode } from './types';

export function flagEmoji(cc: string): string {
  if (!cc || cc.length !== 2) return '🏳️';
  const A = 0x1f1e6;
  const base = 'A'.charCodeAt(0);
  return String.fromCodePoint(A + (cc.charCodeAt(0) - base)) +
         String.fromCodePoint(A + (cc.charCodeAt(1) - base));
}

// Basque place-name overrides for spots within Euskal Herria.
// Keyed by spot id — keeps the canonical ES/EN name as DB default and only
// swaps in the Basque form when the active language is EUS.
const BASQUE_NAMES: Record<string, string> = {
  '11111111-1111-4111-8111-111111111101': 'Gaztelugatxe',
  '11111111-1111-4111-8111-111111111303': 'Bardenak',
  '11111111-1111-4111-8111-111111111304': 'Donibane Garazi',
};

export function basqueName(spotId: string, fallback: string): string {
  return BASQUE_NAMES[spotId] ?? fallback;
}

export const COUNTRY_NAMES: Record<string, Record<string, string>> = {
  es: { ES: 'España', FR: 'Francia', IT: 'Italia', DE: 'Alemania', CH: 'Suiza', AT: 'Austria', JP: 'Japón', CL: 'Chile' },
  eu: { EH: 'Euskal Herria', ES: 'Espainia', FR: 'Frantzia', IT: 'Italia', DE: 'Alemania', CH: 'Suitza', AT: 'Austria', JP: 'Japonia', CL: 'Txile' },
  en: { ES: 'Spain', FR: 'France', IT: 'Italy', DE: 'Germany', CH: 'Switzerland', AT: 'Austria', JP: 'Japan', CL: 'Chile' },
  fr: { ES: 'Espagne', FR: 'France', IT: 'Italie', DE: 'Allemagne', CH: 'Suisse', AT: 'Autriche', JP: 'Japon', CL: 'Chili' },
  de: { ES: 'Spanien', FR: 'Frankreich', IT: 'Italien', DE: 'Deutschland', CH: 'Schweiz', AT: 'Österreich', JP: 'Japan', CL: 'Chile' },
  it: { ES: 'Spagna', FR: 'Francia', IT: 'Italia', DE: 'Germania', CH: 'Svizzera', AT: 'Austria', JP: 'Giappone', CL: 'Cile' },
};

const COUNTRY_DICT_KEY: Record<LangCode, string> = { EUS: 'eu', ES: 'es', EN: 'en', FR: 'fr', DE: 'de', IT: 'it' };

export function countryName(countryCode: string, lang: LangCode, fallback: string): string {
  return COUNTRY_NAMES[COUNTRY_DICT_KEY[lang]][countryCode] ?? COUNTRY_NAMES.es[countryCode] ?? fallback;
}

// Ikurriña and "Euskal Herria" only appear in Basque; everywhere else Basque spots show the Spanish flag and Spain's name.
export function getLocalizedCountry(
  spot: { country: string; country_code: string; euskal_herria: string | null },
  lang: LangCode,
): { name: string; isEH: boolean } {
  if (lang === 'EUS' && spot.euskal_herria) return { name: COUNTRY_NAMES.eu.EH, isEH: true };
  return { name: countryName(spot.country_code, lang, spot.country), isEH: false };
}

export function formatLikes(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`;
  return `${n}`;
}

/**
 * Returns the translated text for the current language, falling back to
 * Spanish, then to the original `fallback` string (English).
 * Safely handles both string and object formats — newly added spots may
 * have a plain string description instead of a translations object.
 */
export function translatedText(
  translations: Record<string, string> | string | null | undefined,
  langKey: string,
  fallback: string | null | undefined,
): string | null {
  if (typeof translations === 'string') return translations;
  if (!translations || typeof translations !== 'object') return fallback ?? null;
  return translations[langKey] || translations['es'] || fallback || null;
}

export function categoryColor(cat: string): { bg: string; ring: string; text: string; pin: string } {
  if (cat === 'city') return { bg: 'bg-blue-500/15', ring: 'ring-blue-500/30', text: 'text-blue-600 dark:text-blue-300', pin: '#2e5a41' };
  if (cat === 'village') return { bg: 'bg-terracotta-500/15', ring: 'ring-terracotta-500/30', text: 'text-terracotta-600 dark:text-terracotta-300', pin: '#c6643f' };
  return { bg: 'bg-emerald-500/15', ring: 'ring-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-300', pin: '#3f7253' };
}
