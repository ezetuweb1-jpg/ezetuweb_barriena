import { useEffect, useMemo, useState } from 'react';
import { X, Heart, Camera, Award, MapPin, Trophy, UserPlus, UserCheck, Users } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { fetchPhotosByAuthor, fetchPhotoAwards, fetchFollowerCount, COUNTRIES_TOTAL } from '@/lib/data';
import { toUserProfile, useIsUserFollowed } from '@/lib/followed-users';
import { setUserFollowed } from '@/lib/follow-actions';
import { socialText } from '@/lib/translations';
import { awardBadge, groupAwardsByPhoto, medalForRank, type AwardedPhoto } from '@/lib/awards';
import { formatLikes, basqueName } from '@/lib/utils';
import type { Photo, Spot, AwardRank, PhotoAward } from '@/lib/types';
import { ProtectedPhoto } from '@/components/ProtectedPhoto';
import { computeXp } from '@/lib/passport-progress';
import { toPassportLang } from '@/lib/passport-strings';
import { TravelerLevelBadge } from '@/components/passport/TravelerLevelBadge';

type SortTab = 'voted' | 'awarded' | 'recent';

export function PhotographerModal({ author, onClose }: { author: string; onClose: () => void }) {
  const { t, lang, setTab, setFocusedSpotId, setPhotographerOpen, openLightbox, showToast } = useApp();
  const [photos, setPhotos] = useState<(Photo & { spot?: Spot })[]>([]);
  const [awards, setAwards] = useState<PhotoAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortTab>('voted');
  const [followers, setFollowers] = useState(0);
  const social = socialText(lang);
  const isFollowing = useIsUserFollowed(author);

  useEffect(() => {
    let alive = true;
    fetchFollowerCount(author)
      .then((n) => { if (alive) setFollowers(n); })
      .catch(() => { if (alive) setFollowers(0); });
    return () => { alive = false; };
  }, [author]);

  const toggleFollow = async () => {
    const next = !isFollowing;
    setFollowers((n) => Math.max(0, n + (next ? 1 : -1)));
    const ok = await setUserFollowed(toUserProfile(author), next);
    if (!ok) setFollowers((n) => Math.max(0, n + (next ? -1 : 1)));
    showToast(ok ? (next ? social.followedToast(author) : social.unfollowedToast(author)) : social.followFailed);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [mine, declared] = await Promise.all([
          fetchPhotosByAuthor(author),
          fetchPhotoAwards(),
        ]);
        if (alive) { setPhotos(mine); setAwards(declared); }
      } catch {
        if (alive) { setPhotos([]); setAwards([]); }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [author]);

  const awarded = useMemo<AwardedPhoto[]>(
    () => groupAwardsByPhoto(awards.filter((a) => a.photo.author.toLowerCase() === author.toLowerCase())),
    [awards, author],
  );

  const authorAwards = useMemo(() => awarded.flatMap((a) => a.awards).sort((x, y) => x.rank - y.rank), [awarded]);

  const awardLabels = useMemo(() => {
    const m: Record<string, string> = {};
    for (const { photo, awards: list } of awarded) {
      const best = list.reduce((a, b) => (b.rank < a.rank ? b : a));
      m[photo.id] = awardBadge(best, lang);
    }
    return m;
  }, [awarded, lang]);

  const sorted = useMemo(() => {
    const safeTime = (dateVal: unknown): number => {
      if (!dateVal) return 0;
      const t = new Date(dateVal as string).getTime();
      return isNaN(t) ? 0 : t;
    };
    const arr = [...photos].filter(Boolean);
    if (sort === 'voted') arr.sort((a, b) => b.likes - a.likes);
    else if (sort === 'recent') arr.sort((a, b) => safeTime(b.created_at) - safeTime(a.created_at));
    return arr;
  }, [photos, sort]);

  // Map photo.id -> Spot for the lightbox bridge
  const photoSpots = useMemo(() => {
    const m: Record<string, Spot> = {};
    for (const p of photos) if (p.spot) m[p.id] = p.spot;
    return m;
  }, [photos]);

  const totalLikes = useMemo(() => photos.reduce((s, p) => s + p.likes, 0), [photos]);
  const totalPhotos = photos.length;

  const explored = useMemo(() => {
    const spotIds = new Set(photos.map((p) => p.spot_id));
    const countries = new Set(photos.map((p) => p.spot?.country_code).filter(Boolean));
    return {
      spots: spotIds.size,
      percent: Math.round((countries.size / COUNTRIES_TOTAL) * 100),
    };
  }, [photos]);

  const travelerXp = useMemo(() => computeXp({
    visits: explored.spots,
    reviews: 0,
    photos: totalPhotos,
    photoLikes: totalLikes,
    pioneerSpots: 0,
  }), [explored.spots, totalPhotos, totalLikes]);

  const avatarInitial = author.charAt(0).toUpperCase();
  const handle = author.toLowerCase().replace(/\s+/g, '_');

  const openInMap = (spotId: string) => {
    setFocusedSpotId(spotId);
    setTab('map');
    onClose();
  };

  // Bridge: close lightbox + photographer modal, open spot drawer on the map
  const handleViewSpot = (spot: Spot) => {
    openLightbox([], null, 0); // close lightbox by resetting
    setFocusedSpotId(spot.id);
    setTab('map');
    setPhotographerOpen(null); // close photographer modal
  };

  const openLightboxAt = (photoList: Photo[], startIndex: number) => {
    openLightbox(photoList, null, startIndex, { photoSpots, onViewSpot: handleViewSpot, awardLabels });
  };

  const tabs: { key: SortTab; icon: string; label: string }[] = [
    { key: 'voted', icon: '🔥', label: t('mostVoted') },
    { key: 'awarded', icon: '🏆', label: t('awarded') },
    { key: 'recent', icon: '🕒', label: t('mostRecent') },
  ];

  return (
    <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl max-h-[88vh] bg-white dark:bg-slate2-900 rounded-t-3xl sm:rounded-3xl shadow-lift overflow-hidden flex flex-col animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 grid place-items-center w-9 h-9 rounded-full bg-white/80 dark:bg-slate2-800/80 backdrop-blur hover:scale-105 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="overflow-y-auto">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-forest-600 to-forest-800 dark:from-slate2-800 dark:to-slate2-950 p-6 pt-8 text-white">
            <div className="flex items-center gap-4">
              <div className="grid place-items-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur text-3xl font-display font-700 shrink-0">
                {avatarInitial}
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-2xl font-700 truncate">{author}</h2>
                <p className="text-white/70 text-sm">@{handle}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur">
                    <Camera className="w-3 h-3" /> {totalPhotos} {t('totalPhotos').toLowerCase()}
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur">
                    <Heart className="w-3 h-3 fill-terracotta-400 text-terracotta-400" /> {formatLikes(totalLikes)}
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur">
                    <Users className="w-3 h-3" /> {followers} {social.followersLabel}
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur">
                    <MapPin className="w-3 h-3" /> {social.travelerBadge(explored.percent, explored.spots)}
                  </span>
                  <TravelerLevelBadge xp={travelerXp} lang={toPassportLang(lang)} />
                </div>
                <button
                  onClick={toggleFollow}
                  aria-pressed={isFollowing}
                  className={`group mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-600 shadow-sm transition-all ${
                    isFollowing
                      ? 'bg-transparent text-white border border-white/60 hover:bg-red-500/15 hover:text-red-200 hover:border-red-400'
                      : 'bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-500 hover:border-emerald-500'
                  }`}
                >
                  {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                  {isFollowing ? (
                    <>
                      <span className="group-hover:hidden">{social.following}</span>
                      <span className="hidden group-hover:inline">{social.unfollow}</span>
                    </>
                  ) : social.follow}
                </button>
              </div>
            </div>
          </div>

          {/* Palmarés */}
          <div className="px-6 py-4 border-b border-forest-100 dark:border-slate2-800">
            <h3 className="text-xs font-700 uppercase tracking-wider text-forest-700/60 dark:text-sand-300/60 mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> {t('palmares')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {authorAwards.map((aw) => (
                <span
                  key={aw.id}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-600 ${
                    aw.rank === 1
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                      : aw.rank === 2
                        ? 'bg-slate-100 dark:bg-slate2-800 text-slate-600 dark:text-sand-300'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                  }`}
                >
                  {awardBadge(aw, lang)}
                </span>
              ))}
              {authorAwards.length === 0 && (
                <span className="text-xs text-forest-700/50 dark:text-sand-300/50">—</span>
              )}
            </div>
          </div>

          {/* 3-tab switcher */}
          <div className="px-6 pt-4 flex gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSort(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-600 transition-all ${
                  sort === tab.key ? 'bg-forest-600 text-white shadow-soft' : 'bg-forest-50 dark:bg-slate2-800 text-forest-700/70 dark:text-sand-300/70'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Photo grid */}
          <div className="p-6 pt-3">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-forest-50 dark:bg-slate2-850 shimmer-bg animate-shimmer" />
                ))}
              </div>
            ) : sort === 'awarded' ? (
              awarded.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-10 h-10 mx-auto text-forest-200 dark:text-slate2-700 mb-3" />
                  <p className="text-sm text-forest-700/50 dark:text-sand-300/50">{t('noAwardedPhotographer')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {awarded.map(({ photo: p, awards }, i) => {
                    const isEus = lang === 'EUS' && p.spot?.euskal_herria;
                    const bestRank = Math.min(...awards.map((a) => a.rank)) as AwardRank;
                    const bestAward = awards.find((a) => a.rank === bestRank)!;
                    return (
                      <div
                        key={p.id}
                        className="group relative rounded-xl overflow-hidden bg-forest-50 dark:bg-slate2-850 shadow-soft cursor-pointer"
                        onClick={() => {
                          const list = awarded.map((a) => a.photo);
                          openLightboxAt(list, i);
                        }}
                      >
                        <div className="aspect-square">
                          <ProtectedPhoto src={p.image_url} alt={p.spot?.name ?? 'Photo'} loading="lazy" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90" />
                        <div className="absolute top-2 right-2 grid place-items-center w-9 h-9 rounded-full bg-white/90 dark:bg-slate2-900/90 backdrop-blur text-lg shadow-soft animate-fadeIn">
                          {medalForRank(bestRank)}
                        </div>
                        <div className="absolute bottom-0 inset-x-0 p-2 text-white">
                          {p.spot && (
                            <div className="flex items-center gap-1 text-[11px] font-600 truncate">
                              <MapPin className="w-3 h-3 shrink-0 text-terracotta-300" />
                              <span className="truncate">{isEus && p.spot ? basqueName(p.spot.id, p.spot.name) : p.spot?.name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-[10px] mt-0.5">
                            <Heart className="w-2.5 h-2.5 fill-terracotta-400 text-terracotta-400" />
                            {formatLikes(p.likes)}
                          </div>
                          <div className="mt-1 text-[10px] font-600 text-amber-300 truncate">{awardBadge(bestAward, lang)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : sorted.length === 0 ? (
              <p className="text-center py-10 text-sm text-forest-700/50 dark:text-sand-300/50">{t('noPhotographerPhotos')}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sorted.map((p, i) => {
                  const isEus = lang === 'EUS' && p.spot?.euskal_herria;
                  return (
                    <div
                      key={p.id}
                      className="group relative rounded-xl overflow-hidden bg-forest-50 dark:bg-slate2-850 shadow-soft cursor-pointer"
                      onClick={() => openLightboxAt(sorted, i)}
                    >
                      <div className="aspect-square">
                        <ProtectedPhoto src={p.image_url} alt={p.spot?.name ?? 'Photo'} loading="lazy" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90" />
                      <div className="absolute bottom-0 inset-x-0 p-2 text-white">
                        {p.spot && (
                          <div className="flex items-center gap-1 text-[11px] font-600 truncate">
                            <MapPin className="w-3 h-3 shrink-0 text-terracotta-300" />
                            <span className="truncate">{isEus && p.spot ? basqueName(p.spot.id, p.spot.name) : p.spot?.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-[10px] mt-0.5">
                          <Heart className="w-2.5 h-2.5 fill-terracotta-400 text-terracotta-400" />
                          {formatLikes(p.likes)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
