import { useEffect } from 'react';
import { AppProvider, useApp } from '@/lib/app-context';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { GalleryView } from '@/components/GalleryView';
import { RankingsView } from '@/components/RankingsView';
import { MapView } from '@/components/MapView';
import { PassportView } from '@/components/PassportView';
import { UploadModal } from '@/components/UploadModal';
import { ContributeModal } from '@/components/ContributeModal';
import { AddPlaceModal } from '@/components/AddPlaceModal';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { PhotographerModal } from '@/components/PhotographerModal';
import { LightboxModal } from '@/components/LightboxModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CircleCheck as CheckCircle2, X } from 'lucide-react';
import type { LangCode } from '@/lib/types';

function ToastOverlay() {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[4000] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-forest-600 to-forest-700 text-white shadow-lift animate-popIn max-w-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-sm font-600">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="grid place-items-center w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function Shell() {
  const {
    tab, uploadOpen, setUploadOpen,
    addPlaceOpen, setAddPlaceOpen, addPlaceWithPhotoOpen, setAddPlaceWithPhotoOpen, setPrefilledComarca,
    contributeOpen, setContributeOpen,
    wishlistOpen, setWishlistOpen,
    setFocusedSpotId, setTab,
    spotsRefreshKey, bumpSpotsRefresh,
    photographerOpen, setPhotographerOpen,
    lightboxPhotos, lightboxSpot, lightboxIndex, lightboxPhotoSpots, lightboxViewSpot, lightboxAwardLabels, closeLightbox,
    visitedSpotIds, toggleVisited, lang,
  } = useApp();

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.closest('img') || target.classList.contains('photo-protected')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-slate2-950 text-forest-900 dark:text-sand-100">
      <Header />
      <main className="pb-16 md:pb-0">
        {tab === 'gallery' && <GalleryView refreshKey={spotsRefreshKey} />}
        {tab === 'rankings' && <RankingsView refreshKey={spotsRefreshKey} />}
        {tab === 'map' && (
          <ErrorBoundary fallback={<div className="p-8 text-center text-forest-700/70 dark:text-sand-300/70">No se pudo cargar el mapa. Recarga la página para reintentar.</div>}>
            <MapView refreshKey={spotsRefreshKey} />
          </ErrorBoundary>
        )}
        {tab === 'passport' && <PassportView refreshKey={spotsRefreshKey} />}
      </main>

      {contributeOpen && <ContributeModal onClose={() => setContributeOpen(false)} />}
      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} onUploaded={() => {}} />}
      {addPlaceOpen && (
        <AddPlaceModal
          onClose={() => { setAddPlaceOpen(false); setPrefilledComarca(null); }}
          onCreated={() => { bumpSpotsRefresh(); }}
        />
      )}
      {addPlaceWithPhotoOpen && (
        <AddPlaceModal
          withPhoto
          onClose={() => { setAddPlaceWithPhotoOpen(false); setPrefilledComarca(null); }}
          onCreated={() => { bumpSpotsRefresh(); }}
        />
      )}
      {wishlistOpen && (
        <WishlistDrawer
          onClose={() => setWishlistOpen(false)}
          onOpenSpot={(id) => { setFocusedSpotId(id); setTab('map'); setWishlistOpen(false); }}
        />
      )}
      {photographerOpen && (
        <PhotographerModal author={photographerOpen} onClose={() => setPhotographerOpen(null)} />
      )}
      {lightboxPhotos && (
        <LightboxModal
          photos={lightboxPhotos}
          spot={lightboxSpot ?? undefined}
          startIndex={lightboxIndex}
          photoSpots={lightboxPhotoSpots ?? undefined}
          onViewSpot={lightboxViewSpot ?? undefined}
          awardLabels={lightboxAwardLabels ?? undefined}
          onClose={closeLightbox}
        />
      )}

      <ToastOverlay />
      <footer className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
        <p className="font-normal">
          {({
            ES: '© 2026 Ezetu. Todos los derechos reservados.',
            EUS: '© 2026 Ezetu. Eskubide guztiak erreserbatuta.',
            EN: '© 2026 Ezetu. All rights reserved.',
            FR: '© 2026 Ezetu. Tous droits réservés.',
            DE: '© 2026 Ezetu. Alle Rechte vorbehalten.',
            IT: '© 2026 Ezetu. Tutti i diritti riservati.',
          } as Record<LangCode, string>)[lang]}
        </p>
      </footer>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <Shell />
      </ErrorBoundary>
    </AppProvider>
  );
}
