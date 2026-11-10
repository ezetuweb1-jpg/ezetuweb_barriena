import { useEffect, useMemo, useState } from 'react';
import { Star, X, MapPin, Bookmark, Footprints, BadgeCheck, ShieldAlert, Send, MessageSquare, ArrowLeft, Flag } from 'lucide-react';
import type { Spot, Photo, Tip } from '@/lib/types';
import { LANG_KEY } from '@/lib/types';
import { useApp } from '@/lib/app-context';
import { fetchPhotosForSpot, fetchTips, addTip, fetchMyRating, upsertRating, type SpotWithRelations } from '@/lib/data';
import { flagEmoji, formatLikes, categoryColor, basqueName, translatedText, getLocalizedCountry } from '@/lib/utils';
import { pickNearbySpots } from '@/lib/geo';
import { criterionName, criterionTooltip, generalTitle, generalQuestion, type CriterionIndex } from '@/lib/ratings-i18n';
import { Ikurrina } from './Ikurrina';
import { ProtectedPhoto } from './ProtectedPhoto';
import { PlaceBreadcrumb } from './PlaceBreadcrumb';
import { NearbySpotsCarousel } from './NearbySpotsCarousel';
import { ReportModal } from './ReportModal';

export interface SpotDetailProps {
  spot: Spot;
  allSpots: SpotWithRelations[];
  onClose: () => void;
  onVisitedChange: (id: string, visited: boolean) => void;
  onWishlistChange: (id: string, saved: boolean) => void;
  /** When true, renders inline (no fixed overlay) — used in the Map split-screen left panel. */
  inline?: boolean;
}

export function SpotDrawer({ spot, allSpots, onClose, onVisitedChange, onWishlistChange, inline = false }: SpotDetailProps) {
  const { t, lang, setTab, openLightbox, visitedSpotIds, toggleVisited, isSaved, toggleSaved: toggleSavedCtx, setFocusedSpotId } = useApp();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [tipText, setTipText] = useState('');
  const [tipAuthor, setTipAuthor] = useState('');
  const [ratings, setRatings] = useState({ photogenic: 0, tranquility: 0, accessibility: 0 });
  const [savedRatings, setSavedRatings] = useState<{ photogenic: number; tranquility: number; accessibility: number } | null>(null);
  const [submittingTip, setSubmittingTip] = useState(false);
  const [open, setOpen] = useState(false);
  const [reportTipId, setReportTipId] = useState<string | null>(null);

  useEffect(() => {
    if (!inline) setOpen(true);
    (async () => {
      try {
        const [p, ts, r] = await Promise.all([
          fetchPhotosForSpot(spot.id), fetchTips(spot.id), fetchMyRating(spot.id),
        ]);
        setPhotos(p); setTips(ts);
        if (r) { setRatings({ photogenic: r.photogenic, tranquility: r.tranquility, accessibility: r.accessibility }); setSavedRatings({ photogenic: r.photogenic, tranquility: r.tranquility, accessibility: r.accessibility }); }
      } catch { /* supabase not configured or error — leave empty */ }
    })();
  }, [spot.id, inline]);

  const isEus = lang === 'EUS' && spot.euskal_herria;
  const cc = categoryColor(spot.category);
  const langKey = LANG_KEY[lang];
  const descriptionText = translatedText(spot.translations, langKey, spot.description);

  const submitTip = async () => {
    if (!tipText.trim() || tipText.length > 140) return;
    setSubmittingTip(true);
    try {
      const newTip = await addTip(spot.id, tipAuthor || 'Viajero', tipText.trim());
      if (newTip) setTips((p) => [newTip, ...p]);
      setTipText(''); setTipAuthor('');
    } finally { setSubmittingTip(false); }
  };

  const saveRatings = async () => {
    if (ratings.photogenic < 1 || ratings.tranquility < 1 || ratings.accessibility < 1) return;
    await upsertRating(spot.id, ratings.photogenic, ratings.tranquility, ratings.accessibility);
    setSavedRatings({ ...ratings });
  };

  const nearbySpots = useMemo(() => pickNearbySpots(spot, allSpots), [spot, allSpots]);

  const isVisited = visitedSpotIds.has(spot.id);
  const isSavedSpot = isSaved(spot.id);

  const handleToggleVisited = () => {
    toggleVisited(spot.id);
    onVisitedChange(spot.id, !isVisited);
  };

  const handleToggleSaved = () => {
    toggleSavedCtx(spot.id);
    const next = !isSavedSpot;
    onWishlistChange(spot.id, next);
  };

  const avgRating = useMemo(() => {
    const sum = ratings.photogenic + ratings.tranquility + ratings.accessibility;
    if (sum === 0) return spot.bayesian_rating;
    return +(sum / 3).toFixed(1);
  }, [ratings, spot.bayesian_rating]);

  const close = () => {
    if (inline) { onClose(); return; }
    setOpen(false);
    setTimeout(onClose, 200);
  };

  const body = (
    <>
      {/* Hero */}
      <div className="relative h-52 sm:h-64 bg-forest-900 shrink-0">
        {photos[0] && <img src={photos[0].image_url} alt={spot.name} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-600 ${cc.bg} ${cc.text} ring-1 ${cc.ring}`}>
              {spot.category === 'city' ? '🏙️' : spot.category === 'village' ? '🏘️' : '🌲'} {t(spot.category === 'city' ? 'cities' : spot.category === 'village' ? 'villages' : 'nature')}
            </span>
            {spot.verified && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur text-[11px] font-600">
                <BadgeCheck className="w-3.5 h-3.5 text-sand-300" /> {t('verifiedSpot')}
              </span>
            )}
            {isEus && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur">
                <Ikurrina className="w-4 h-2.5" /> <span className="text-[11px] font-600">{spot.euskal_herria}</span>
              </span>
            )}
          </div>
          <h2 className="font-display text-3xl font-700 drop-shadow">{isEus ? basqueName(spot.id, spot.name) : spot.name}</h2>
          <p className="text-white/85 text-sm flex items-center gap-1.5 mt-1">
            <PlaceBreadcrumb spot={spot} tone="onDark" />
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* About + coords */}
        {descriptionText && (
          <section>
            <h3 className="font-600 text-forest-800 dark:text-sand-100 mb-1.5">{t('aboutSpot')}</h3>
            <p className="text-sm text-forest-700/80 dark:text-sand-300/80 leading-relaxed">{descriptionText}</p>
          </section>
        )}

        {/* Protected zone notice */}
        {spot.protected_zone && (
          <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200 text-sm">
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{t('protectedZone')}</span>
          </div>
        )}

        {/* Iconic spots — only for cities */}
        {spot.category === 'city' && spot.iconic_spots && spot.iconic_spots.length > 0 && (
          <section>
            <h3 className="font-600 text-forest-800 dark:text-sand-100 mb-2 flex items-center gap-1.5">
              <span className="text-base">🏛️</span>
              {t('iconicSpots')}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {spot.iconic_spots.map((landmark, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-forest-50 dark:bg-slate2-850 border border-forest-200 dark:border-slate2-800 text-xs font-600 text-forest-700 dark:text-sand-300"
                >
                  {landmark}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleToggleVisited}
            title={isVisited ? t('unmarkHint') : undefined}
            className={`group/visit flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-600 text-sm transition-all ${
              isVisited
                ? 'bg-gradient-to-r from-emerald-500 to-forest-600 text-white shadow-soft hover:from-emerald-600 hover:to-forest-700'
                : 'bg-white dark:bg-slate2-850 border border-forest-200 dark:border-slate2-800 text-forest-800 dark:text-sand-100 hover:border-forest-400 hover:shadow-soft'
            }`}
          >
            <Footprints className="w-4 h-4" />
            {isVisited ? (
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-200">✓</span> {lang === 'EUS' ? 'Hemen izan zara' : 'Has estado aquí'}
              </span>
            ) : (
              <span>{lang === 'EUS' ? 'Hemen izan naiz' : 'He estado aquí'}</span>
            )}
            {isVisited && (
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-forest-600/0 group-hover/visit:text-forest-600/70 dark:group-hover/visit:text-sand-300/70 whitespace-nowrap transition-colors">
                {t('unmarkHint')}
              </span>
            )}
          </button>
          <button
            onClick={handleToggleSaved}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-600 text-sm transition-colors ${
              isSavedSpot ? 'bg-terracotta-500 text-white shadow-soft' : 'bg-white dark:bg-slate2-850 border border-terracotta-200 dark:border-slate2-800 text-terracotta-700 dark:text-terracotta-300 hover:border-terracotta-400'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSavedSpot ? 'fill-white' : ''}`} />
            {isSavedSpot ? t('saveListActive') : t('saveList')}
          </button>
        </div>

        {/* Integrated Ratings Block — overall score + 3 criteria breakdown bars */}
        <section className="rounded-2xl bg-white dark:bg-slate2-850 border border-forest-100 dark:border-slate2-800 p-4 sm:p-5">
          {/* Header row: big score + review count */}
          <div className="flex items-baseline gap-3 mb-1">
            <div className="flex items-baseline gap-1">
              <Star className="w-6 h-6 fill-terracotta-500 text-terracotta-500 self-center" />
              <span className="font-display text-3xl font-700 text-forest-800 dark:text-sand-100">{avgRating.toFixed(1)}</span>
              <span className="text-sm font-500 text-forest-700/50 dark:text-sand-300/50">/ 5.0</span>
            </div>
            <span className="text-xs font-600 text-forest-700/70 dark:text-sand-300/70">{generalTitle(lang)}</span>
          </div>
          <p className="text-xs text-forest-700/50 dark:text-sand-300/50 mb-4">
            ({spot.ratings_count} {t('reviewsCount')}) · {generalQuestion(spot.category, lang)}
          </p>

          {/* 3 criteria breakdown bars */}
          <div>
            {([0, 1, 2] as CriterionIndex[]).map((idx) => {
              const k = (['photogenic', 'tranquility', 'accessibility'] as const)[idx];
              const score = ratings[k] || spot.bayesian_rating;
              const tip = criterionTooltip(spot.category, idx, lang);
              return (
                <div key={k}>
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-forest-700/80 dark:text-sand-300/80">{criterionName(spot.category, idx, lang)}</span>
                      <button type="button" className="group/tt relative w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate2-700 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white text-[10px] font-bold flex items-center justify-center transition-colors">
                        ⓘ
                        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 z-50 rounded-xl bg-forest-800 dark:bg-slate2-700 text-white text-[11px] font-400 leading-relaxed p-2.5 opacity-0 group-hover/tt:opacity-100 transition-opacity shadow-lift whitespace-normal">
                          {tip}
                        </span>
                      </button>
                    </div>
                    <span className="font-600 text-forest-800 dark:text-sand-100">{score.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate2-800 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(score / 5) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive star rating form */}
          <div className="mt-2 pt-3 border-t border-forest-100 dark:border-slate2-800">
            <p className="text-xs font-600 text-forest-700/70 dark:text-sand-300/70 uppercase tracking-wider mb-2.5">{t('yourReview')}</p>
            <div className="space-y-2.5">
              {([0, 1, 2] as CriterionIndex[]).map((idx) => {
                const k = (['photogenic', 'tranquility', 'accessibility'] as const)[idx];
                return (
                <div key={k} className="flex items-center gap-3">
                  <span className="text-sm w-28 text-forest-700/80 dark:text-sand-300/80">{criterionName(spot.category, idx, lang)}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setRatings((p) => ({ ...p, [k]: n }))}
                        className="p-0.5"
                        aria-label={`${n} stars`}
                      >
                        <Star className={`w-5 h-5 transition-colors ${n <= ratings[k] ? 'fill-terracotta-500 text-terracotta-500' : 'text-forest-300 dark:text-slate2-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                );
              })}
            </div>
            <button
              onClick={saveRatings}
              disabled={ratings.photogenic < 1 || ratings.tranquility < 1 || ratings.accessibility < 1 || (savedRatings !== null && savedRatings.photogenic === ratings.photogenic && savedRatings.tranquility === ratings.tranquility && savedRatings.accessibility === ratings.accessibility)}
              className="mt-3 px-4 py-2 rounded-xl bg-forest-600 text-white text-sm font-600 disabled:opacity-40 hover:bg-forest-700 transition-colors"
            >
              {t('save')}
            </button>
          </div>
        </section>

        {/* Tips */}
        <section>
          <h3 className="font-600 text-forest-800 dark:text-sand-100 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {t('travelerTips')}
          </h3>
          <div className="space-y-2.5">
            {tips.length === 0 && <p className="text-sm text-forest-700/50 dark:text-sand-300/50">{t('noTips')}</p>}
            {tips.map((tip) => {
              const tipText_ = translatedText(tip.translations, langKey, tip.content);
              return (
              <div key={tip.id} className="group/tip p-3 rounded-2xl bg-white dark:bg-slate2-850 border border-forest-100 dark:border-slate2-800">
                <p className="text-sm text-forest-800 dark:text-sand-100">{tipText_}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[11px] text-forest-700/50 dark:text-sand-300/50">— {tip.author}</p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setReportTipId(tip.id);
                    }}
                    className="relative z-30 pointer-events-auto cursor-pointer flex items-center gap-1 text-[11px] text-forest-700/40 dark:text-sand-300/40 hover:text-terracotta-500 dark:hover:text-terracotta-400 transition-colors opacity-0 group-hover/tip:opacity-100"
                  >
                    <Flag className="w-3 h-3" />
                    {lang === 'EUS' ? 'Salatu' : lang === 'EN' ? 'Report' : 'Reportar'}
                  </button>
                </div>
              </div>
              );
            })}
          </div>
          <div className="mt-3 space-y-2">
            <input
              value={tipAuthor}
              onChange={(e) => setTipAuthor(e.target.value.slice(0, 40))}
              placeholder={t('authorName')}
              className="w-full px-3 py-2 rounded-xl border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-850 text-sm text-forest-800 dark:text-sand-100 focus:outline-none focus:border-forest-400"
            />
            <div className="flex gap-2">
              <input
                value={tipText}
                onChange={(e) => setTipText(e.target.value.slice(0, 140))}
                placeholder={t('addTip')}
                className="flex-1 px-3 py-2 rounded-xl border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-850 text-sm text-forest-800 dark:text-sand-100 focus:outline-none focus:border-forest-400"
              />
              <button
                onClick={submitTip}
                disabled={!tipText.trim() || submittingTip}
                className="px-3 py-2 rounded-xl bg-terracotta-500 text-white text-sm font-600 disabled:opacity-40 hover:bg-terracotta-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-forest-700/50 dark:text-sand-300/50 text-right">{tipText.length}/140</p>
          </div>
        </section>

        {/* Photo stream */}
        <section>
          <h3 className="font-600 text-forest-800 dark:text-sand-100 mb-3">{t('photoStream')}</h3>
          {photos.length === 0 ? (
            <p className="text-sm text-forest-700/50 dark:text-sand-300/50">{t('noPhotos')}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => openLightbox(photos, spot, i)}
                  className="relative rounded-xl overflow-hidden bg-forest-100 dark:bg-slate2-800 group/photo cursor-pointer"
                  style={{ aspectRatio: p.width / p.height }}
                >
                  <ProtectedPhoto src={p.image_url} loading="lazy" alt={spot.name} className="object-cover transition-transform duration-500 group-hover/photo:scale-105" />
                  <span className="absolute top-1 right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-600">
                    <Star className="w-2.5 h-2.5 fill-terracotta-400 text-terracotta-400" />{formatLikes(p.likes)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <NearbySpotsCarousel spots={nearbySpots} onSelect={setFocusedSpotId} />

        <div className="pt-2 pb-4 space-y-1">
          <p className="text-[10px] text-forest-700/30 dark:text-sand-300/30 font-mono">
            {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
          </p>
          <button onClick={() => { setTab('map'); onClose(); }} className="text-xs text-forest-700/60 dark:text-sand-300/60 hover:underline">
            ← {t('close')}
          </button>
        </div>
      </div>
    </>
  );

  if (inline) {
    return (
      <div className="flex flex-col h-full bg-sand-50 dark:bg-slate2-900 animate-fadeIn">
        {/* Back button — prominent, sticky at top */}
        <button
          onClick={close}
          className="sticky top-0 z-10 flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate2-850 border-b border-forest-100 dark:border-slate2-800 text-forest-800 dark:text-sand-100 font-600 text-sm hover:bg-forest-50 dark:hover:bg-slate2-800 transition-colors shadow-soft"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToList')}
        </button>
        <div className="flex-1 overflow-y-auto">{body}</div>
        {reportTipId && <ReportModal tipId={reportTipId} onClose={() => setReportTipId(null)} />}
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[9999] flex justify-end ${open ? 'animate-fadeIn' : ''}`}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={close} />
      <aside className={`relative w-full sm:max-w-xl md:max-w-2xl h-full bg-sand-50 dark:bg-slate2-900 shadow-lift overflow-y-auto ${open ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300`}>
        <button onClick={close} className="absolute top-4 right-4 z-20 grid place-items-center w-9 h-9 rounded-full bg-white/85 dark:bg-slate2-900/85 text-forest-800 dark:text-sand-100 backdrop-blur hover:scale-110 transition-transform">
          <X className="w-5 h-5" />
        </button>
        {body}
        {reportTipId && <ReportModal tipId={reportTipId} onClose={() => setReportTipId(null)} />}
      </aside>
    </div>
  );
}
