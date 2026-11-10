import type { Photo, PhotoAward, AwardPeriod, AwardRank, LangCode, Spot } from './types';
import { makeT } from './i18n';

export const AWARDS_LAUNCH_YEAR = 2026;

// A period only counts once it is fully over, so closed-period logic runs against today's date.
export const AWARDS_REFERENCE_DATE = new Date();

const BASQUE_MONTHS = ['Urtarrila', 'Otsaila', 'Martxoa', 'Apirila', 'Maiatza', 'Ekaina', 'Uztaila', 'Abuztua', 'Iraila', 'Urria', 'Azaroa', 'Abendua'];

const MONTH_LOCALES: Record<Exclude<LangCode, 'EUS'>, string> = {
  ES: 'es-ES', EN: 'en-GB', FR: 'fr-FR', DE: 'de-DE', IT: 'it-IT',
};

export function medalForRank(rank: AwardRank): string {
  return rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
}

export function lastClosedMonthStart(today: Date): Date {
  return new Date(today.getFullYear(), today.getMonth() - 1, 1);
}

export function lastClosedYearStart(today: Date): Date {
  return new Date(today.getFullYear() - 1, 0, 1);
}

export function periodStartKey(start: Date): string {
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`;
}

export function awardsForPeriod(awards: PhotoAward[], period: AwardPeriod, start: Date): PhotoAward[] {
  const key = periodStartKey(start);
  return awards
    .filter((a) => a.period === period && a.periodStart === key)
    .sort((a, b) => a.rank - b.rank);
}

// Defaults to the most recent closed period that has declared winners, falling back to the last closed period.
export function defaultPeriodStart(awards: PhotoAward[], period: AwardPeriod, today: Date): Date {
  const lastClosed = period === 'month' ? lastClosedMonthStart(today) : lastClosedYearStart(today);
  const lastClosedKey = periodStartKey(lastClosed);
  let latest: string | undefined;
  for (const a of awards) {
    if (a.period !== period || a.periodStart > lastClosedKey) continue;
    if (!latest || a.periodStart > latest) latest = a.periodStart;
  }
  if (!latest) return lastClosed;
  return new Date(Number(latest.slice(0, 4)), Number(latest.slice(5, 7)) - 1, 1);
}

function monthName(month: number, lang: Exclude<LangCode, 'EUS'>): string {
  const name = new Date(2026, month, 1).toLocaleDateString(MONTH_LOCALES[lang], { month: 'long' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function awardPeriodText(period: AwardPeriod, periodStart: string, lang: LangCode): string {
  const year = periodStart.slice(0, 4);
  if (period === 'year') return year;
  const month = Number(periodStart.slice(5, 7)) - 1;
  if (lang === 'EUS') return `${year}ko ${BASQUE_MONTHS[month]}`;
  return `${monthName(month, lang)} ${year}`;
}

export function awardHeading(period: AwardPeriod, periodStart: string, lang: LangCode): string {
  const t = makeT(lang);
  const prefix = t(period === 'month' ? 'awardHeadingMonth' : 'awardHeadingYear');
  return `${prefix}: ${awardPeriodText(period, periodStart, lang)}`;
}

export function awardMedalLabel(rank: AwardRank, lang: LangCode): string {
  return `${medalForRank(rank)} ${makeT(lang)(`awardMedal${rank}`)}`;
}

export function awardBadge(award: PhotoAward, lang: LangCode): string {
  return `${awardMedalLabel(award.rank, lang)} · ${awardPeriodText(award.period, award.periodStart, lang)}`;
}

export interface AwardedPhoto {
  photo: Photo & { spot?: Spot };
  awards: PhotoAward[];
}

export function groupAwardsByPhoto(awards: PhotoAward[]): AwardedPhoto[] {
  const byId = new Map<string, AwardedPhoto>();
  for (const award of awards) {
    const entry = byId.get(award.photoId);
    if (entry) entry.awards.push(award);
    else byId.set(award.photoId, { photo: award.photo, awards: [award] });
  }
  return Array.from(byId.values()).sort((a, b) => {
    const bestA = Math.min(...a.awards.map((aw) => aw.rank));
    const bestB = Math.min(...b.awards.map((aw) => aw.rank));
    if (bestA !== bestB) return bestA - bestB;
    return b.photo.likes - a.photo.likes;
  });
}
