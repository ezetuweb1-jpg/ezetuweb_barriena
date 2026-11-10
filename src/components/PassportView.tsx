import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/lib/app-context';
import { useSpots, fetchPhotosByAuthor, fetchPhotoAwards } from '@/lib/data';
import { basqueName, getLocalizedCountry } from '@/lib/utils';
import { computeXp, levelProgress, mergeEarnedTiers, type RetoId } from '@/lib/passport-progress';
import { buildConquest } from '@/lib/passport-conquest';
import { PASSPORT_OWNER } from '@/lib/passport-social';
import { createPassportT, toPassportLang } from '@/lib/passport-strings';
import { loadPioneerSpotIds } from '@/lib/pioneer-spots';
import type { Photo, PhotoAward, Spot } from '@/lib/types';
import { PassportMapPanel } from './PassportMapPanel';
import { IdentityBlock } from './passport/IdentityBlock';
import { ConquestBlock } from './passport/ConquestBlock';
import { RetoBadgesBlock } from './passport/RetoBadgesBlock';
import { PortfolioBlock } from './passport/PortfolioBlock';
import { VisitedRankingBlock, type RankedSpotItem } from './passport/VisitedRankingBlock';

// Pre-seeded demo visits shown when the user has none of their own yet.
const SEED_VISIT_IDS = [
  '11111111-1111-4111-8111-111111111101',
  '11111111-1111-4111-8111-111111111102',
  '11111111-1111-4111-8111-111111111103',
  '11111111-1111-4111-8111-111111111108',
];

type OwnedPhoto = Photo & { spot?: Spot };

export function PassportView({ refreshKey }: { refreshKey?: number }) {
  const { lang, setTab, setFocusedSpotId, setMapLayer, visitedSpotIds, openLightbox, setPhotographerOpen } = useApp();
  const { spots } = useSpots(refreshKey);
  const passLang = toPassportLang(lang);
  const t = useMemo(() => createPassportT(passLang), [passLang]);

  const [ownPhotos, setOwnPhotos] = useState<OwnedPhoto[]>([]);
  const [awards, setAwards] = useState<PhotoAward[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [pioneerIds] = useState<string[]>(() => loadPioneerSpotIds());

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchPhotosByAuthor(PASSPORT_OWNER.name), fetchPhotoAwards()])
      .then(([photos, allAwards]) => {
        if (cancelled) return;
        setOwnPhotos(photos);
        const owner = PASSPORT_OWNER.name.toLowerCase();
        setAwards(allAwards.filter((a) => a.authorId.toLowerCase() === owner));
      })
      .catch(() => { if (!cancelled) setLoadError(true); });
    return () => { cancelled = true; };
  }, []);

  const visitedIds = useMemo(() => {
    if (visitedSpotIds.size > 0) return visitedSpotIds;
    return new Set(SEED_VISIT_IDS);
  }, [visitedSpotIds]);

  const rankedSpots = useMemo(
    () => [...spots].sort((a, b) => b.bayesian_rating - a.bayesian_rating),
    [spots],
  );

  const ranked: RankedSpotItem[] = useMemo(() => rankedSpots
    .map((spot, i) => ({ spot, rank: i + 1 }))
    .filter(({ spot }) => visitedIds.has(spot.id))
    .map(({ spot, rank }) => ({
      spot,
      rank,
      name: lang === 'EUS' && spot.euskal_herria ? basqueName(spot.id, spot.name) : spot.name,
      place: spot.province ?? getLocalizedCountry(spot, lang).name,
    })), [rankedSpots, visitedIds, lang]);

  const visitedSpots = useMemo(() => ranked.map((r) => r.spot), [ranked]);

  const conquest = useMemo(() => buildConquest(passLang, visitedSpots), [passLang, visitedSpots]);

  const summitsVisited = visitedSpots.filter((s) => s.category === 'nature' && (s.elevation_m ?? 0) > 1500).length;
  const covesVisited = visitedSpots.filter((s) => s.category === 'nature' && (s.elevation_m ?? 0) < 500).length;
  const villagesVisited = visitedSpots.filter((s) => s.category === 'village').length;
  const pioneerCount = pioneerIds.length;
  const totalLikes = useMemo(() => ownPhotos.reduce((sum, p) => sum + p.likes, 0), [ownPhotos]);

  const xp = computeXp({
    visits: visitedIds.size,
    reviews: 0,
    photos: ownPhotos.length,
    photoLikes: totalLikes,
    pioneerSpots: pioneerCount,
  });
  const progress = levelProgress(xp);

  const retoValues: Record<RetoId, number> = {
    cabra: summitsVisited,
    alma: villagesVisited,
    calas: covesVisited,
    pionero: pioneerCount,
    ojo: totalLikes,
    trotamundos: conquest.countriesVisited,
  };
  const retoTiers = mergeEarnedTiers(retoValues);

  const viewOnMap = (spot: Spot) => {
    setMapLayer('visited');
    setFocusedSpotId(spot.id);
    setTab('map');
  };

  const exploreMap = () => {
    setMapLayer('all');
    setFocusedSpotId(null);
    setTab('map');
  };

  const openPhoto = (photos: OwnedPhoto[], index: number) => {
    const photoSpots = Object.fromEntries(photos.flatMap((p): [string, Spot][] => (p.spot ? [[p.spot_id, p.spot]] : [])));
    const current = photos[index];
    openLightbox(photos, current?.spot ?? null, index, {
      photoSpots,
      onViewSpot: viewOnMap,
    });
  };

  if (loadError) {
    return <div className="max-w-[1600px] mx-auto px-4 py-16 text-center text-sm text-forest-700/70 dark:text-sand-300/70">{t('loadError')}</div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="mt-6 mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-700 text-forest-800 dark:text-sand-100">{t('passportTitle')}</h1>
        <p className="text-forest-700/60 dark:text-sand-300/60 text-sm mt-1">{t('passportSubtitle')}</p>
      </div>

      {spots.length === 0 ? (
        <div className="grid place-items-center h-96">
          <div className="w-10 h-10 rounded-full border-2 border-forest-300 border-t-forest-600 animate-spin" />
        </div>
      ) : (
        <>
          <IdentityBlock
            t={t}
            lang={passLang}
            xp={xp}
            progress={progress}
            onViewProfile={setPhotographerOpen}
          />

          <ConquestBlock t={t} lang={passLang} snapshot={conquest} totalLikes={totalLikes} onExplore={exploreMap} />
          <PassportMapPanel key={lang} t={t} lang={lang} visitedSpots={visitedSpots} />

          <div className="mt-8" />
          <RetoBadgesBlock
            t={t}
            values={retoValues}
            tiers={retoTiers}
          />

          <PortfolioBlock t={t} lang={passLang} photos={ownPhotos} awards={awards} onOpenPhoto={openPhoto} />

          <VisitedRankingBlock t={t} items={ranked} onViewOnMap={viewOnMap} />
        </>
      )}
    </div>
  );
}
