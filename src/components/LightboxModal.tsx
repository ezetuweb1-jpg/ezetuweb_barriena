import { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Flag, Camera, MapPin } from 'lucide-react';
import type { Photo, Spot } from '@/lib/types';
import { useApp } from '@/lib/app-context';
import { formatLikes, basqueName } from '@/lib/utils';
import { isPhotoLiked, togglePhotoLike, deviceId } from '@/lib/data';
import { useUserAvatar } from '@/lib/user-avatar';
import { ReportModal } from './ReportModal';
import { VerifiedPhotoBadge } from './VerifiedPhotoBadge';
import { ProtectedPhoto } from './ProtectedPhoto';
import { PlaceBreadcrumb } from './PlaceBreadcrumb';

interface Props {
  photos: Photo[];
  spot?: Spot;
  startIndex: number;
  onClose: () => void;
  /** Per-photo spot lookup; when provided, the "View place info" bridge button is shown. */
  photoSpots?: Record<string, Spot>;
  /** Called when the user taps "View place info"; receives the spot for the current photo. */
  onViewSpot?: (spot: Spot) => void;
  awardLabels?: Record<string, string>;
}

export function LightboxModal({ photos, spot, startIndex, onClose, photoSpots, onViewSpot, awardLabels }: Props) {
  const { t, lang, setPhotographerOpen, setFocusedSpotId, setTab } = useApp();
  const ownAvatar = useUserAvatar();
  const copyrightText = {
    EUS: 'Eskubide guztiak erreserbatuta',
    ES: 'Todos los derechos reservados',
    EN: 'All rights reserved',
    FR: 'Tous droits réservés',
    DE: 'Alle Rechte vorbehalten',
    IT: 'Tutti i diritti riservati',
  }[lang];
  const [index, setIndex] = useState(startIndex);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [checked, setChecked] = useState(false);
  const [heart, setHeart] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const photo = photos[index];

  useEffect(() => {
    setLiked(false);
    setChecked(false);
    setLikeCount(photo?.likes ?? 0);
  }, [index, photo]);

  useEffect(() => {
    if (!photo || checked) return;
    isPhotoLiked(photo.id).then((v) => { setLiked(v); setChecked(true); }).catch(() => setChecked(true));
  }, [photo, checked]);

  const next = useCallback(() => setIndex((i) => (i + 1) % photos.length), [photos.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + photos.length) % photos.length), [photos.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (reportOpen) return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, onClose, reportOpen]);

  // Touch swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) { diff > 0 ? prev() : next(); }
    setTouchStart(null);
  };

  if (!photo) return null;

  const currentSpot = (photoSpots?.[photo.id] ?? spot) as Spot | undefined;
  const awardLabel = awardLabels?.[photo.id];
  const isEus = lang === 'EUS' && currentSpot?.euskal_herria;
  const spotName = currentSpot ? (isEus ? basqueName(currentSpot.id, currentSpot.name) : currentSpot.name) : '';

  const onLike = async () => {
    const nextVal = !liked;
    setLiked(nextVal);
    setLikeCount((c) => Math.max(0, c + (nextVal ? 1 : -1)));
    setHeart(true);
    setTimeout(() => setHeart(false), 450);
    try { await togglePhotoLike(photo.id, !nextVal); }
    catch { setLiked(!nextVal); setLikeCount(photo.likes); }
  };

  const openSpotDrawer = () => {
    if (!currentSpot) return;
    if (onViewSpot) { onViewSpot(currentSpot); return; }
    onClose();
    setFocusedSpotId(currentSpot.id);
    setTab('map');
  };

  const openPhotographer = () => {
    setPhotographerOpen(photo.author);
    onClose();
  };

  const exifParts = [
    photo.camera_model,
    photo.lens,
    photo.aperture,
    photo.shutter_speed,
    photo.iso != null ? `ISO ${photo.iso}` : null,
  ].filter(Boolean);

  const photoDate = photo.created_at
    ? new Date(photo.created_at).toLocaleDateString(lang === 'EUS' ? 'eu' : lang === 'EN' ? 'en' : lang === 'FR' ? 'fr' : lang === 'DE' ? 'de' : 'es', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  return (
    <>
      <div
        className="fixed inset-0 z-[3200] bg-black/95 animate-fadeIn flex flex-col"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 text-white shrink-0">
          <div className="flex items-center gap-2 text-sm font-600">
            {spotName && <span className="truncate max-w-[200px]">{spotName}</span>}
            {awardLabel && <span className="px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 text-[11px] font-700 uppercase tracking-wider">{awardLabel}</span>}
            {photos.length > 1 && <span className="text-white/50 text-xs">{index + 1} / {photos.length}</span>}
          </div>
          <button onClick={onClose} className="grid place-items-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main image */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden px-4 min-h-0">
          <ProtectedPhoto
            key={photo.id}
            src={photo.image_url}
            alt={spotName || 'Photo'}
            className="object-contain rounded-lg animate-fadeIn"
          />

          <div className="absolute bottom-4 right-4 z-20 bg-black/50 backdrop-blur-md text-white/90 text-xs px-3 py-1.5 rounded-full border border-white/15 shadow-lg select-none pointer-events-none">
            © {photo.author} · Ezetu · {copyrightText}
          </div>

          {/* Floating nav arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/25 hover:scale-110 active:scale-95 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/25 hover:scale-110 active:scale-95 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Bottom info panel */}
        <div className="shrink-0 px-4 pb-4 pt-3 text-white">
          <div className="max-w-3xl mx-auto">
            {currentSpot && <PlaceBreadcrumb spot={currentSpot} tone="onDark" className="mb-3" />}
            {/* Primary row: Verified leaf + Like + Place + Author + Report */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              {photo.camera_model && <VerifiedPhotoBadge buttonClassName="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-500 border border-slate-200 dark:border-slate-700" />}

              {/* Prominent Like button */}
              <button
                onClick={onLike}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-terracotta-500/20 hover:bg-terracotta-500/30 border border-terracotta-400/30 transition-all text-sm font-700 shrink-0"
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-terracotta-500 text-terracotta-500' : 'text-terracotta-300'} ${heart ? 'animate-heartbeat' : ''}`} />
                {formatLikes(likeCount)}
              </button>

              {/* Place with pin */}
              {currentSpot && (
                <button
                  onClick={openSpotDrawer}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-600 min-w-0"
                >
                  <MapPin className="w-4 h-4 shrink-0 text-terracotta-300" />
                  <span className="truncate">{spotName}</span>
                </button>
              )}

              {/* Author with avatar */}
              <button
                onClick={openPhotographer}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-600 min-w-0"
              >
                <span className="grid place-items-center w-7 h-7 rounded-full bg-white/15 backdrop-blur text-xs font-700 shrink-0 overflow-hidden">
                  {ownAvatar && photo.device_id === deviceId
                    ? <img src={ownAvatar} alt="" className="w-full h-full object-cover" />
                    : photo.author.charAt(0).toUpperCase()}
                </span>
                <span className="truncate">@{photo.author}</span>
              </button>

              {/* Report */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setReportOpen(true);
                }}
                className="relative z-30 pointer-events-auto cursor-pointer grid place-items-center w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0"
                title={t('reportPhoto')}
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            {/* EXIF technical metadata */}
            {exifParts.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap text-xs text-white/60">
                <Camera className="w-3.5 h-3.5 shrink-0" />
                {exifParts.map((p, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-white/8">{p}</span>
                ))}
                {photoDate && <span className="px-2 py-0.5 rounded-full bg-white/8">{photoDate}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
      {reportOpen && <ReportModal photoId={photo.id} onClose={() => setReportOpen(false)} />}
    </>
  );
}
