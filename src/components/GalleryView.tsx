import { useEffect, useMemo, useState } from 'react';
import { Heart, MapPin, Camera, Flame, Calendar, Sparkles, CalendarDays, Clock, History, Users } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { fetchPhotos, fetchHeroPhoto, fetchPhotosByAuthors } from '@/lib/data';
import { useFollowedUsers } from '@/lib/followed-users';
import { socialText } from '@/lib/translations';
import { formatLikes, categoryColor, basqueName, translatedText } from '@/lib/utils';
import { LANG_KEY } from '@/lib/types';
import type { Photo, Spot, TimeFilter } from '@/lib/types';
import { PhotoCard } from './PhotoCard';
import { TheBestView } from './TheBestView';
import { VerifiedPhotoBadge } from './VerifiedPhotoBadge';
import { ProtectedPhoto } from './ProtectedPhoto';
import { PlaceBreadcrumb } from './PlaceBreadcrumb';

const TIME_FILTERS: { id: TimeFilter; icon: typeof Flame; label: string }[] = [
  { id: 'trending', icon: Flame, label: 'trending' },
  { id: 'today', icon: Clock, label: 'today' },
  { id: 'week', icon: Calendar, label: 'thisWeek' },
  { id: 'month', icon: CalendarDays, label: 'thisMonth' },
  { id: 'historic', icon: History, label: 'historic' },
  { id: 'new', icon: Sparkles, label: 'new' },
];

const CATEGORIES = ['all', 'city', 'village', 'nature'];

export function GalleryView(_: { refreshKey?: number }) {
  const { t, lang, setTab, setFocusedSpotId, setPhotographerOpen, openLightbox, closeLightbox } = useApp();
  const [galleryMode, setGalleryMode] = useState<'feed' | 'following' | 'best'>('feed');
  const [followedPhotos, setFollowedPhotos] = useState<(Photo & { spot?: Spot })[]>([]);
  const [followedLoading, setFollowedLoading] = useState(false);
  const [followedError, setFollowedError] = useState(false);
  const social = socialText(lang);
  const [time, setTime] = useState<TimeFilter>('trending');
  const [category, setCategory] = useState('all');
  const [photos, setPhotos] = useState<(Photo & { spot?: Spot })[]>([]);
  const [hero, setHero] = useState<(Photo & { spot?: Spot }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [heroLoading, setHeroLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setHeroLoading(true);
      try { setHero(await fetchHeroPhoto()); } catch { /* ignore */ }
      setHeroLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setPhotos(await fetchPhotos({ season: 'all', category, time })); }
      catch { setPhotos([]); }
      setLoading(false);
    })();
  }, [time, category]);

  const filtered = useMemo(() => {
    if (category === 'all') return photos;
    return photos.filter((p) => p.spot?.category === category);
  }, [photos, category]);

  const followedUsers = useFollowedUsers();
  const followedNames = useMemo(() => followedUsers.map((u) => u.name), [followedUsers]);

  useEffect(() => {
    if (galleryMode !== 'following') return;
    let alive = true;
    (async () => {
      setFollowedLoading(true);
      setFollowedError(false);
      try {
        const list = followedNames.length === 0 ? [] : await fetchPhotosByAuthors(followedNames);
        if (alive) setFollowedPhotos(list);
      } catch {
        if (alive) { setFollowedPhotos([]); setFollowedError(true); }
      } finally {
        if (alive) setFollowedLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [galleryMode, followedNames]);

  const heroSpot = hero?.spot;
  const heroIsEus = lang === 'EUS' && heroSpot?.euskal_herria;
  const heroDescription = heroSpot ? translatedText(heroSpot.translations, LANG_KEY[lang], heroSpot.description) : null;

  const openInMap = (spotId: string) => {
    setFocusedSpotId(spotId);
    setTab('map');
  };

  const handleViewSpot = (s: Spot) => {
    closeLightbox();
    setFocusedSpotId(s.id);
    setTab('map');
  };

  const openHeroLightbox = () => {
    if (!hero) return;
    openLightbox([hero], heroSpot ?? null, 0, { photoSpots: heroSpot ? { [hero.id]: heroSpot } : undefined, onViewSpot: handleViewSpot });
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Sub-nav: Feed vs The Best */}
      <div className="flex justify-center mt-6 mb-4">
        <div className="flex gap-0.5 p-1 rounded-2xl bg-forest-50 dark:bg-slate2-900/60 border border-forest-100 dark:border-slate2-800">
          <button
            onClick={() => setGalleryMode('feed')}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-600 whitespace-nowrap transition-all ${
              galleryMode === 'feed'
                ? 'bg-white dark:bg-slate2-800 text-forest-800 dark:text-sand-100 shadow-soft'
                : 'text-forest-700/70 dark:text-sand-300/70 hover:text-forest-800 dark:hover:text-sand-100'
            }`}
          >
            📸 {t('exploreFeed')}
          </button>
          <button
            onClick={() => setGalleryMode('following')}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-600 whitespace-nowrap transition-all ${
              galleryMode === 'following'
                ? 'bg-white dark:bg-slate2-800 text-forest-800 dark:text-sand-100 shadow-soft'
                : 'text-forest-700/70 dark:text-sand-300/70 hover:text-forest-800 dark:hover:text-sand-100'
            }`}
          >
            <Users className="w-4 h-4" />
            {social.followingTab}
          </button>
          <button
            onClick={() => setGalleryMode('best')}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-600 whitespace-nowrap transition-all ${
              galleryMode === 'best'
                ? 'bg-amber-500 text-white shadow-soft'
                : 'text-forest-700/70 dark:text-sand-300/70 hover:text-forest-800 dark:hover:text-sand-100'
            }`}
          >
            🏆 {t('theBest')}
          </button>
        </div>
      </div>

      {galleryMode === 'best' && <TheBestView />}

      {galleryMode === 'following' && (
        <section className="mt-6 animate-fadeIn">
          {followedLoading ? (
            <div className="masonry">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-forest-50 dark:bg-slate2-850 overflow-hidden" style={{ aspectRatio: 0.7 + (i % 3) * 0.25 }}>
                  <div className="w-full h-full shimmer-bg animate-shimmer bg-forest-100/40 dark:bg-slate2-800/40" />
                </div>
              ))}
            </div>
          ) : followedError ? (
            <div className="py-24 text-center text-forest-700/60 dark:text-sand-300/60">{social.followFailed}</div>
          ) : followedPhotos.length === 0 ? (
            <div className="py-24 text-center text-forest-700/60 dark:text-sand-300/60">{social.followingEmpty}</div>
          ) : (
            <div className="masonry">
              {followedPhotos.map((p, i) => (
                <PhotoCard key={p.id} photo={p} spot={p.spot} onSpotClick={openInMap} allPhotos={followedPhotos} photoIndex={i} />
              ))}
            </div>
          )}
        </section>
      )}

      {galleryMode === 'feed' && (
      <>
      {/* Hero */}
      <section className="mt-6 mb-8 animate-fadeIn">
        <div className="relative rounded-3xl overflow-hidden shadow-lift bg-forest-900">
          {hero ? (
            <div className="relative h-[60vh] min-h-[420px] max-h-[640px] cursor-pointer group" onClick={openHeroLightbox}>
              <ProtectedPhoto src={hero.image_url} alt={heroSpot?.name ?? ''} className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

              {hero.camera_model && (
                <div className="absolute top-4 left-4 z-30 pointer-events-auto">
                  <VerifiedPhotoBadge />
                </div>
              )}

              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-terracotta-500 text-white text-[11px] font-700 uppercase tracking-wider">
                    {t('photoOfDay')}
                  </span>
                </div>
                <h1 className="font-display text-4xl sm:text-6xl font-700 tracking-tight drop-shadow-lg max-w-3xl">
                  {heroSpot ? (heroIsEus ? basqueName(heroSpot.id, heroSpot.name) : heroSpot.name) : 'Ezetu'}
                </h1>
                {heroSpot && <PlaceBreadcrumb spot={heroSpot} tone="onDark" className="mt-3" />}
                <p className="mt-2 text-white/80 text-sm sm:text-base max-w-2xl">
                  {heroDescription ?? t('tagline')}
                </p>
                {/* Photographer attribution */}
                <button
                  onClick={(e) => { e.stopPropagation(); setPhotographerOpen(hero.author); }}
                  className="mt-3 inline-flex items-center gap-2 text-white/85 text-sm hover:text-terracotta-300 transition-colors w-fit"
                >
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-white/15 backdrop-blur text-xs font-700 shrink-0">
                    {hero.author.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-600">{t('photoBy')}: {hero.author}</span>
                </button>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {heroSpot && (
                    <button onClick={(e) => { e.stopPropagation(); openInMap(heroSpot.id); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-forest-800 font-600 hover:bg-sand-100 transition-colors shadow-soft">
                      <MapPin className="w-4 h-4" />
                      {t('viewOnMap')}
                    </button>
                  )}
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur text-white font-600">
                    <Heart className="w-4 h-4 fill-terracotta-400 text-terracotta-400" />
                    {formatLikes(hero.likes)} {t('likes')}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-white/60 text-xs">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{t('viewSpotCard')}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : heroLoading ? (
            <div className="h-[50vh] min-h-[380px] grid place-items-center">
              <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            </div>
          ) : (
            <div className="h-[40vh] grid place-items-center text-white/80 p-8">
              <p className="text-center">{t('empty')}</p>
            </div>
          )}
        </div>
        <p className="mt-4 text-forest-700/70 dark:text-sand-300/70 text-sm">{t('gallerySubtitle')}</p>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-30 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 mb-6 bg-sand-50/80 dark:bg-slate2-950/80 backdrop-blur-xl rounded-b-2xl border-b border-forest-100/60 dark:border-slate2-800/60">
        <div className="flex flex-col gap-3">
          {/* Time filters */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {TIME_FILTERS.map((tf) => {
              const Icon = tf.icon;
              const active = time === tf.id;
              return (
                <button
                  key={tf.id}
                  onClick={() => setTime(tf.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-600 whitespace-nowrap transition-all ${
                    active
                      ? 'bg-forest-600 text-white shadow-soft'
                      : 'bg-white dark:bg-slate2-900 text-forest-700/70 dark:text-sand-300/70 hover:bg-forest-50 dark:hover:bg-slate2-800 border border-forest-100 dark:border-slate2-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(tf.label)}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {/* Category */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {CATEGORIES.map((c) => {
                const active = category === c;
                const cc = c !== 'all' ? categoryColor(c) : null;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-600 transition-all ${
                      active
                        ? 'bg-forest-700 text-white'
                        : 'bg-white dark:bg-slate2-900 text-forest-700/70 dark:text-sand-300/70 border border-forest-100 dark:border-slate2-800 hover:border-forest-300'
                    }`}
                  >
                    {c === 'all' ? `🌍 ${t('all')}` : c === 'city' ? `🏙️ ${t('cities')}` : c === 'village' ? `🏘️ ${t('villages')}` : `🌲 ${t('nature')}`}
                    {cc && null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Masonry */}
      {loading ? (
        <div className="masonry">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-forest-50 dark:bg-slate2-850 overflow-hidden" style={{ aspectRatio: 0.7 + (i % 3) * 0.25 }}>
              <div className="w-full h-full shimmer-bg animate-shimmer bg-forest-100/40 dark:bg-slate2-800/40" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center text-forest-700/60 dark:text-sand-300/60">{t('empty')}</div>
      ) : (
        <div className="masonry">
          {filtered.map((p, i) => (
            <PhotoCard key={p.id} photo={p} spot={p.spot} onSpotClick={openInMap} allPhotos={filtered} photoIndex={i} />
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}
