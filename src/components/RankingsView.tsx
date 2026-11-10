import { useMemo, useRef, useState, useEffect } from 'react';
import { Star, ShieldAlert, BadgeCheck, Footprints, Bookmark, MapPin, Trophy, Navigation, Map as MapIcon, ChevronDown, Check } from 'lucide-react';
import { LANG_KEY, type Spot, type Category } from '@/lib/types';
import { useApp } from '@/lib/app-context';
import { useSpots, useVisits, useWishlist } from '@/lib/data';
import { geoLabel } from '@/lib/geo';
import { categoryColor, basqueName, getLocalizedCountry } from '@/lib/utils';
import { Ikurrina } from './Ikurrina';
import { ProtectedPhoto } from './ProtectedPhoto';
import { PlaceBreadcrumb } from './PlaceBreadcrumb';

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function rankBadgeClass(rank: number): string {
  if (rank === 1) return 'bg-gradient-to-br from-amber-400 to-amber-600 text-white';
  if (rank === 2) return 'bg-gradient-to-br from-slate-300 to-slate-500 text-white';
  if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white';
  return 'bg-forest-100 dark:bg-slate2-800 text-forest-700 dark:text-sand-300';
}

export function RankingsView({ refreshKey }: { refreshKey?: number }) {
  const { t, lang, setTab, setFocusedSpotId, rankingsFilter, clearRankingsFilter } = useApp();
  const { spots, loading } = useSpots(refreshKey);
  const { visitedIds } = useVisits();
  const { savedIds } = useWishlist();

  const isEus = lang === 'EUS';

  const [country, setCountry] = useState<string>('all');
  const [province, setProvince] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all');
  const listTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rankingsFilter) return;
    setCountry(rankingsFilter.country);
    setProvince(rankingsFilter.province);
    clearRankingsFilter();
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [rankingsFilter, clearRankingsFilter]);

  const availableCountries = useMemo(() => {
    const set = new Map<string, string>();
    spots.forEach((s) => {
      set.set(s.country_code, s.country);
    });
    const arr = Array.from(set, ([code, name]) => ({ code, name }));
    arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [spots]);

  const availableProvinces = useMemo(() => {
    const set = new Set<string>();
    spots.forEach((s) => {
      const matchesCountry = country === 'all'
        || (country === 'EUS' && s.euskal_herria)
        || s.country_code === country;
      if (!matchesCountry) return;
      const provs = s.provinces && s.provinces.length > 0
        ? s.provinces
        : (s.province ? [s.province] : []);
      provs.forEach((p) => set.add(p));
    });
    return Array.from(set).sort();
  }, [spots, country]);

  const rankedSpots = useMemo(() => {
    const byCat = (s: Spot) => categoryFilter === 'all' || s.category === categoryFilter;
    const byCountry = (s: Spot) => {
      if (country === 'all') return true;
      if (country === 'EUS') return !!s.euskal_herria;
      return s.country_code === country;
    };
    const byProvince = (s: Spot) => {
      if (province === 'all') return true;
      const provs = s.provinces && s.provinces.length > 0
        ? s.provinces
        : (s.province ? [s.province] : []);
      return provs.some((p) => norm(p) === norm(province));
    };
    return spots
      .filter((s) => byCat(s) && byCountry(s) && byProvince(s))
      .sort((a, b) => b.bayesian_rating - a.bayesian_rating);
  }, [spots, country, province, categoryFilter]);

  const handleViewOnMap = () => {
    if (rankedSpots.length > 0) setFocusedSpotId(rankedSpots[0].id);
    setTab('map');
  };

  const handleSpotClick = (spot: Spot) => {
    setFocusedSpotId(spot.id);
    setTab('map');
  };

  const onCountryChange = (c: string) => { setCountry(c); setProvince('all'); };

  const countryOptions = useMemo(() => {
    const base = availableCountries.map((c) => ({
      value: c.code,
      label: getLocalizedCountry({ country_code: c.code, country: c.name, euskal_herria: null } as Spot, lang).name,
    }));
    const options = isEus ? [{ value: 'EUS', label: t('euskalHerria') }, ...base] : base;
    return options.sort((a, b) => a.label.localeCompare(b.label, LANG_KEY[lang]));
  }, [availableCountries, isEus, lang, t]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <section className="mt-6 mb-5 animate-fadeIn">
        <h1 className="font-display text-3xl sm:text-4xl font-700 tracking-tight text-forest-800 dark:text-sand-100 flex items-center gap-2.5">
          <Trophy className="w-7 h-7 text-terracotta-500" />
          {t('rankings')}
        </h1>
        <p className="mt-2 text-sm text-forest-700/70 dark:text-sand-300/70 max-w-2xl">{t('rankingsSubtitle')}</p>
      </section>

      {/* Mode switcher + filters */}
      <div className="sticky top-14 z-30 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 mb-5 bg-sand-50/85 dark:bg-slate2-950/85 backdrop-blur-xl rounded-b-2xl border-b border-forest-100/60 dark:border-slate2-800/60">
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Dropdown
              label={t('country')}
              value={country}
              allLabel={t('countryAll')}
              options={countryOptions}
              onChange={onCountryChange}
            />
            <Dropdown
              label={t('province')}
              value={province}
              allLabel={t('provinceAll')}
              options={availableProvinces.map((p) => ({ value: p, label: geoLabel(p, lang) }))}
              onChange={setProvince}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['all', 'city', 'village', 'nature'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-600 transition-all ${
                  categoryFilter === c
                    ? 'bg-forest-600 text-white shadow-soft'
                    : 'bg-white dark:bg-slate2-900 text-forest-700/70 dark:text-sand-300/70 border border-forest-100 dark:border-slate2-800 hover:border-terracotta-300'
                }`}
              >
                {c === 'all' ? `🌍 ${t('all')}` : c === 'city' ? `🏙️ ${t('cities')}` : c === 'village' ? `🏘️ ${t('villages')}` : `🌲 ${t('nature')}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div ref={listTopRef} className="scroll-mt-44 flex items-center justify-between mb-4">
        <p className="text-sm text-forest-700/70 dark:text-sand-300/70">
          {rankedSpots.length} <span className="lowercase">{t('spotsFound')}</span>
        </p>
        <button
          onClick={handleViewOnMap}
          disabled={rankedSpots.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-forest-600 text-white text-sm font-600 shadow-soft hover:bg-forest-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <MapIcon className="w-4 h-4" />
          {t('viewOnMapShort')}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white dark:bg-slate2-850 border border-forest-100 dark:border-slate2-800 shimmer-bg animate-shimmer" />
          ))}
        </div>
      ) : rankedSpots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <Navigation className="w-12 h-12 text-forest-300 dark:text-slate2-700 mb-3" />
          <p className="text-sm text-forest-700/60 dark:text-sand-300/60 max-w-md">{t('noRankedSpots')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rankedSpots.map((s, idx) => {
            const cc = categoryColor(s.category);
            const spotIsEus = lang === 'EUS' && s.euskal_herria;
            const isVisited = visitedIds.has(s.id);
            const isSaved = savedIds.has(s.id);
            const rank = idx + 1;
            const starBreakdown = Math.round(s.bayesian_rating);
            return (
              <div
                key={s.id}
                onClick={() => handleSpotClick(s)}
                className="group relative flex gap-3 p-3 rounded-2xl bg-white dark:bg-slate2-850 border border-forest-100 dark:border-slate2-800 cursor-pointer transition-all hover:border-forest-300 dark:hover:border-slate2-700 hover:shadow-soft"
              >
                <div className={`absolute -top-2 -left-2 z-10 grid place-items-center w-8 h-8 rounded-full text-xs font-700 shadow-soft ring-2 ring-white dark:ring-slate2-900 ${rankBadgeClass(rank)}`}>
                  {rank === 1 ? '★' : `#${rank}`}
                </div>

                <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-forest-100 dark:bg-slate2-800">
                  {s.cover_photo ? (
                    <ProtectedPhoto src={s.cover_photo.image_url} alt={s.name} loading="lazy" className="object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-forest-300">
                      <MapPin className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-600 ${cc.bg} ${cc.text} ring-1 ${cc.ring}`}>
                      {s.category === 'city' ? '🏙️' : s.category === 'village' ? '🏘️' : '🌲'} {t(s.category === 'city' ? 'cities' : s.category === 'village' ? 'villages' : 'nature')}
                    </span>
                    {s.verified && (
                      <span className="flex items-center gap-0.5 text-[10px] text-forest-600 dark:text-forest-300 font-600">
                        <BadgeCheck className="w-3.5 h-3.5" /> {t('verifiedSpot')}
                      </span>
                    )}
                    {spotIsEus && <Ikurrina className="w-4 h-2.5" />}
                    {s.protected_zone && <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
                  </div>

                  <h3 className="font-600 text-sm text-forest-800 dark:text-sand-100 truncate mt-1">
                    {spotIsEus ? basqueName(s.id, s.name) : s.name}
                  </h3>

                  <div className="mt-0.5">
                    <PlaceBreadcrumb spot={s} />
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-3.5 h-3.5 ${n <= starBreakdown ? 'fill-terracotta-500 text-terracotta-500' : 'text-forest-200 dark:text-slate2-700'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-700 text-terracotta-600 dark:text-terracotta-300">{s.bayesian_rating.toFixed(1)}</span>
                    <span className="text-[11px] text-forest-700/40 dark:text-sand-300/40">· {s.ratings_count} {t('bayesian').toLowerCase()}</span>
                    {isVisited && <Footprints className="w-3.5 h-3.5 text-forest-600 dark:text-forest-300 ml-1" />}
                    {isSaved && <Bookmark className="w-3.5 h-3.5 fill-terracotta-500 text-terracotta-500 ml-1" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dropdown
// ---------------------------------------------------------------------------
interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  value: string;
  allLabel: string;
  options: DropdownOption[];
  onChange: (v: string) => void;
}

function Dropdown({ label, value, allLabel, options, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = value === 'all' ? null : options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const select = (v: string) => { onChange(v); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      <span className="text-[10px] uppercase tracking-wider font-600 text-forest-700/60 dark:text-sand-300/60">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 mt-1 rounded-xl border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-900 text-sm text-forest-800 dark:text-sand-100 font-600 focus:outline-none focus:border-forest-400 cursor-pointer hover:border-forest-300 transition-colors"
      >
        <span className="truncate">{current ? current.label : allLabel}</span>
        <ChevronDown className={`w-4 h-4 text-forest-600/60 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-1 z-50 max-h-64 overflow-y-auto rounded-xl border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-900 shadow-lift animate-popIn origin-top">
          <button
            onClick={() => select('all')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
              value === 'all' ? 'bg-forest-50 dark:bg-slate2-800 text-forest-800 dark:text-sand-100 font-600' : 'text-forest-700/80 dark:text-sand-300/80 hover:bg-forest-50/60 dark:hover:bg-slate2-800/60'
            }`}
          >
            <span className="flex-1 truncate">{allLabel}</span>
            {value === 'all' && <Check className="w-3.5 h-3.5 text-forest-600 shrink-0" />}
          </button>
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => select(o.value)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                value === o.value ? 'bg-forest-50 dark:bg-slate2-800 text-forest-800 dark:text-sand-100 font-600' : 'text-forest-700/80 dark:text-sand-300/80 hover:bg-forest-50/60 dark:hover:bg-slate2-800/60'
              }`}
            >
              <span className="flex-1 truncate">{o.label}</span>
              {value === o.value && <Check className="w-3.5 h-3.5 text-forest-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
