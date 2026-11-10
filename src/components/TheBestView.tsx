import { useEffect, useMemo, useState } from 'react';
import { Heart, MapPin, ChevronLeft, ChevronRight, Medal, Trophy, Camera, CalendarDays, Globe } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { fetchPhotoAwards } from '@/lib/data';
import { formatLikes, basqueName } from '@/lib/utils';
import {
  AWARDS_LAUNCH_YEAR, AWARDS_REFERENCE_DATE, awardBadge, awardHeading, awardMedalLabel, awardPeriodText,
  awardsForPeriod, defaultPeriodStart, lastClosedMonthStart, lastClosedYearStart, medalForRank, periodStartKey,
} from '@/lib/awards';
import { Ikurrina } from './Ikurrina';
import { ProtectedPhoto } from './ProtectedPhoto';
import { PlaceBreadcrumb } from './PlaceBreadcrumb';
import type { AwardPeriod, LangCode, PhotoAward, Spot } from '@/lib/types';

interface PodiumCardProps {
  award: PhotoAward;
  lang: LangCode;
  onOpenPhoto: (award: PhotoAward) => void;
  onOpenPlace: (spot: Spot) => void;
  onOpenPhotographer: (author: string) => void;
}

function PodiumCard({ award, lang, onOpenPhoto, onOpenPlace, onOpenPhotographer }: PodiumCardProps) {
  const { photo, rank } = award;
  const spot = photo.spot;
  const isEus = lang === 'EUS' && spot?.euskal_herria;
  const ringColor = rank === 1 ? 'ring-amber-400' : rank === 2 ? 'ring-slate-300' : 'ring-orange-400';
  const glow = rank === 1 ? 'shadow-[0_0_28px_rgba(245,158,11,0.45)]' : rank === 2 ? 'shadow-[0_0_18px_rgba(203,213,225,0.4)]' : 'shadow-[0_0_18px_rgba(251,146,60,0.4)]';
  const sizeClass = rank === 1 ? 'sm:scale-110 sm:-translate-y-2' : '';
  const cardSize = rank === 1 ? 'h-64 sm:h-80' : 'h-52 sm:h-64';

  return (
    <div className={`relative rounded-3xl overflow-hidden ring-4 ${ringColor} ${glow} ${sizeClass} bg-forest-50 dark:bg-slate2-850 transition-transform`}>
      <div className={`relative ${cardSize}`}>
        <button
          type="button"
          onClick={() => onOpenPhoto(award)}
          aria-label={spot?.name ?? 'Photo'}
          className="absolute inset-0 w-full h-full cursor-pointer overflow-hidden group"
        >
          <ProtectedPhoto src={photo.image_url} alt={spot?.name ?? 'Photo'} className="object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10 pointer-events-none" />
        </button>
      </div>
      <div className="absolute top-3 left-3 grid place-items-center w-10 h-10 rounded-full bg-white/90 dark:bg-slate2-900/90 backdrop-blur text-xl shadow-soft pointer-events-none">
        {medalForRank(rank)}
      </div>
      <div className="absolute bottom-0 inset-x-0 p-4 text-white pointer-events-none">
        <div className="text-[11px] font-600 text-white/80 mb-1 truncate">{awardMedalLabel(rank, lang)}</div>
        {spot && (
          <button onClick={() => onOpenPlace(spot)} className="block text-left w-full pointer-events-auto">
            <div className="flex items-center gap-1.5 text-sm font-700">
              <MapPin className="w-3.5 h-3.5 text-terracotta-300 shrink-0" />
              <span className="truncate">{isEus ? basqueName(spot.id, spot.name) : spot.name}</span>
              {isEus && <Ikurrina className="w-3.5 h-2.5 shrink-0" />}
            </div>
          </button>
        )}
        {spot && <PlaceBreadcrumb spot={spot} tone="onDark" className="mt-1 -ml-2 pointer-events-auto" />}
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={() => onOpenPhotographer(photo.author)}
            className="pointer-events-auto flex items-center gap-1 text-[11px] font-600 hover:text-terracotta-300 transition-colors"
          >
            <Camera className="w-3 h-3" />
            @{photo.author}
          </button>
          <span className="flex items-center gap-1 text-xs font-700">
            <Heart className="w-3 h-3 fill-terracotta-400 text-terracotta-400" />
            {formatLikes(photo.likes)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function TheBestView() {
  const { t, lang, setTab, setFocusedSpotId, setPhotographerOpen, openLightbox, closeLightbox } = useApp();
  const [period, setPeriod] = useState<AwardPeriod>('month');
  const [selectedStart, setSelectedStart] = useState<Date>(() => lastClosedMonthStart(AWARDS_REFERENCE_DATE));
  const [awards, setAwards] = useState<PhotoAward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchPhotoAwards();
        if (!alive) return;
        setAwards(list);
        setSelectedStart(defaultPeriodStart(list, 'month', AWARDS_REFERENCE_DATE));
      }
      catch { if (alive) setAwards([]); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const lastClosedStart = period === 'month' ? lastClosedMonthStart(AWARDS_REFERENCE_DATE) : lastClosedYearStart(AWARDS_REFERENCE_DATE);
  const firstStart = new Date(AWARDS_LAUNCH_YEAR, 0, 1);
  const canGoPrev = selectedStart > firstStart;
  const canGoNext = selectedStart < lastClosedStart;

  const switchPeriod = (next: AwardPeriod) => {
    setPeriod(next);
    setSelectedStart(defaultPeriodStart(awards, next, AWARDS_REFERENCE_DATE));
  };

  const step = (dir: 1 | -1) => {
    const y = selectedStart.getFullYear();
    const m = selectedStart.getMonth();
    setSelectedStart(period === 'month' ? new Date(y, m + dir, 1) : new Date(y + dir, 0, 1));
  };

  const periodKey = periodStartKey(selectedStart);
  const currentLabel = awardPeriodText(period, periodKey, lang);

  const podium = useMemo(() => awardsForPeriod(awards, period, selectedStart), [awards, period, selectedStart]);
  const podiumByRank = (rank: 1 | 2 | 3) => podium.find((a) => a.rank === rank);

  const handleViewSpot = (s: Spot) => {
    closeLightbox();
    setFocusedSpotId(s.id);
    setTab('map');
  };

  const openPodiumPhoto = (award: PhotoAward) => {
    const spot = award.photo.spot ?? null;
    openLightbox([award.photo], spot, 0, {
      photoSpots: spot ? { [award.photo.id]: spot } : undefined,
      onViewSpot: handleViewSpot,
      awardLabels: { [award.photo.id]: awardBadge(award, lang) },
    });
  };

  const periodTabs: { id: AwardPeriod; label: string; icon: typeof CalendarDays }[] = [
    { id: 'month', label: t('periodMonth'), icon: CalendarDays },
    { id: 'year', label: t('periodYear'), icon: Globe },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="mt-6 mb-6 text-center animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-700 uppercase tracking-wider">
          <Trophy className="w-4 h-4" />
          {t('hallOfFame')}
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-700 mt-3 text-forest-800 dark:text-sand-100">
          {t('theBest')}
        </h1>
        <p className="mt-2 text-forest-700/70 dark:text-sand-300/70 text-sm">
          {awardHeading(period, periodKey, lang)}
        </p>
      </div>

      <div className="flex justify-center mb-5">
        <div className="flex gap-0.5 p-1 rounded-2xl bg-forest-50 dark:bg-slate2-900/60 border border-forest-100 dark:border-slate2-800">
          {periodTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => switchPeriod(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-600 whitespace-nowrap transition-all ${
                period === id
                  ? 'bg-white dark:bg-slate2-800 text-forest-800 dark:text-sand-100 shadow-soft'
                  : 'text-forest-700/70 dark:text-sand-300/70 hover:text-forest-800 dark:hover:text-sand-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white dark:bg-slate2-900 border border-forest-100 dark:border-slate2-800 shadow-soft">
          <button
            onClick={() => step(-1)}
            disabled={!canGoPrev}
            aria-label={t('previous')}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-600 transition-all ${
              canGoPrev
                ? 'text-forest-700 dark:text-sand-200 hover:bg-forest-50 dark:hover:bg-slate2-800'
                : 'text-forest-300 dark:text-slate2-700 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('previous')}</span>
          </button>

          <span className="flex items-center gap-2 px-4 py-2 text-sm font-700 text-forest-800 dark:text-sand-100 min-w-[180px] justify-center capitalize">
            <CalendarDays className="w-4 h-4 text-amber-500" />
            {currentLabel}
          </span>

          <button
            onClick={() => step(1)}
            disabled={!canGoNext}
            aria-label={t('next')}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-600 transition-all ${
              canGoNext
                ? 'text-forest-700 dark:text-sand-200 hover:bg-forest-50 dark:hover:bg-slate2-800'
                : 'text-forest-300 dark:text-slate2-700 cursor-not-allowed'
            }`}
          >
            <span className="hidden sm:inline">{t('next')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3 sm:gap-5 max-w-3xl mx-auto items-end">
          {[2, 1, 3].map((r) => (
            <div key={r} className={`rounded-3xl shimmer-bg animate-shimmer bg-forest-100/40 dark:bg-slate2-800/40 ${r === 1 ? 'h-80' : 'h-64'}`} />
          ))}
        </div>
      ) : podium.length === 0 ? (
        <div className="py-20 text-center text-forest-700/50 dark:text-sand-300/50 animate-fadeIn">
          <Medal className="w-10 h-10 mx-auto mb-3 text-forest-300 dark:text-slate2-700" />
          <p className="text-sm">{t('noAwardedPhotos')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:gap-5 max-w-3xl mx-auto items-end animate-fadeIn">
          {([[2, 'order-1'], [1, 'order-2'], [3, 'order-3']] as const).map(([rank, orderClass]) => {
            const award = podiumByRank(rank);
            return (
              <div key={rank} className={orderClass}>
                {award && (
                  <PodiumCard
                    award={award}
                    lang={lang}
                    onOpenPhoto={openPodiumPhoto}
                    onOpenPlace={(spot) => { setFocusedSpotId(spot.id); setTab('map'); }}
                    onOpenPhotographer={(author) => setPhotographerOpen(author)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
