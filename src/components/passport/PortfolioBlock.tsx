import { useMemo, useState } from 'react';
import { Medal, Star, Flame, Trophy, Clock } from 'lucide-react';
import { type PassportT, type PassportLang, passportLocale } from '@/lib/passport-strings';
import type { Photo, PhotoAward, Spot } from '@/lib/types';

type OwnedPhoto = Photo & { spot?: Spot };
type SortMode = 'votes' | 'awards' | 'recent';

interface PortfolioBlockProps {
  t: PassportT;
  lang: PassportLang;
  photos: OwnedPhoto[];
  awards: PhotoAward[];
  onOpenPhoto: (photos: OwnedPhoto[], index: number) => void;
}

const MEDAL_COLOR: Record<number, string> = {
  1: 'text-yellow-500',
  2: 'text-slate-400',
  3: 'text-amber-600',
};

export function PortfolioBlock({ t, lang, photos, awards, onOpenPhoto }: PortfolioBlockProps) {
  const [sort, setSort] = useState<SortMode>('votes');
  const locale = passportLocale(lang);
  const awardedIds = useMemo(() => new Set(awards.map((a) => a.photoId)), [awards]);

  const masterpiece = useMemo(
    () => [...photos].sort((a, b) => b.likes - a.likes)[0] ?? null,
    [photos],
  );

  const grid = useMemo(() => {
    if (sort === 'awards') return photos.filter((p) => awardedIds.has(p.id)).sort((a, b) => b.likes - a.likes);
    if (sort === 'recent') return [...photos].sort((a, b) => b.created_at.localeCompare(a.created_at));
    return [...photos].sort((a, b) => b.likes - a.likes);
  }, [photos, sort, awardedIds]);

  const sortTabs: { id: SortMode; label: string; icon: typeof Flame }[] = [
    { id: 'votes', label: t('sortVotes'), icon: Flame },
    { id: 'awards', label: t('sortAwards'), icon: Trophy },
    { id: 'recent', label: t('sortRecent'), icon: Clock },
  ];

  const trophies = [...awards].sort((a, b) => b.periodStart.localeCompare(a.periodStart) || a.rank - b.rank);

  const openInGrid = (photo: OwnedPhoto) => onOpenPhoto(grid, grid.findIndex((p) => p.id === photo.id));

  const periodLabel = (a: PhotoAward) => {
    const date = new Date(a.periodStart);
    if (a.period === 'year') return `${t('awardYear')} ${date.getFullYear()}`;
    const month = date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    return `${t('awardMonth')} · ${month.charAt(0).toUpperCase()}${month.slice(1)}`;
  };

  const medalLabel = (rank: number) => (rank === 1 ? t('medalGold') : rank === 2 ? t('medalSilver') : t('medalBronze'));

  return (
    <section className="mb-8">
      <h2 className="font-display text-2xl font-700 text-forest-800 dark:text-sand-100 mb-4">{t('portfolioTitle')}</h2>

      <div className="grid lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3 rounded-3xl bg-white dark:bg-slate2-850 border border-forest-100 dark:border-slate2-800 shadow-soft p-5">
          <h3 className="text-xs uppercase tracking-wider text-forest-700/60 dark:text-sand-300/60 mb-3 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            {t('trophiesTitle')}
          </h3>
          {trophies.length === 0 ? (
            <p className="text-sm text-forest-700/60 dark:text-sand-300/60 py-6">{t('noTrophies')}</p>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-2">
              {trophies.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => onOpenPhoto([a.photo], 0)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-forest-50 dark:bg-slate2-900 hover:bg-forest-100 dark:hover:bg-slate2-800 transition-colors text-left"
                  >
                    <Medal className={`w-7 h-7 shrink-0 ${MEDAL_COLOR[a.rank]}`} />
                    <div className="min-w-0">
                      <p className="font-600 text-sm text-forest-800 dark:text-sand-100 truncate">{periodLabel(a)}</p>
                      <p className="text-xs text-forest-700/60 dark:text-sand-300/60 truncate">{medalLabel(a.rank)}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 rounded-3xl overflow-hidden relative bg-forest-800 text-white shadow-soft min-h-[220px]">
          {masterpiece ? (
            <button onClick={() => openInGrid(masterpiece)} className="group absolute inset-0 text-left">
              <img src={masterpiece.image_url} alt={masterpiece.spot?.name ?? ''} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute left-4 right-4 bottom-4">
                <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-terracotta-200">
                  <Star className="w-3.5 h-3.5 fill-terracotta-300 text-terracotta-300" />
                  {t('masterpieceTitle')}
                </span>
                <p className="font-display text-xl font-700 mt-1 truncate">{masterpiece.spot?.name}</p>
                <p className="text-sm text-white/80">{t('likesCount', { n: masterpiece.likes })}</p>
              </div>
            </button>
          ) : (
            <p className="absolute inset-0 grid place-items-center text-sm text-white/70 p-6 text-center">{t('noPhotos')}</p>
          )}
        </div>
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
        {sortTabs.map((tab) => {
          const Icon = tab.icon;
          const active = sort === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSort(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-600 whitespace-nowrap transition-colors ${
                active
                  ? 'bg-forest-600 text-white shadow-soft'
                  : 'bg-forest-50 dark:bg-slate2-900 border border-forest-100 dark:border-slate2-800 text-forest-700/70 dark:text-sand-300/70 hover:border-forest-300 dark:hover:border-slate2-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {grid.length === 0 ? (
        <p className="text-sm text-forest-700/60 dark:text-sand-300/60 py-8 text-center">{t('noPhotos')}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {grid.map((p) => (
            <button
              key={p.id}
              onClick={() => openInGrid(p)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-forest-100 dark:bg-slate2-800"
            >
              <img src={p.image_url} alt={p.spot?.name ?? ''} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/70 to-transparent text-left">
                <p className="text-xs font-600 text-white truncate">{p.spot?.name}</p>
                <p className="text-[11px] text-white/80 inline-flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {p.likes}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
