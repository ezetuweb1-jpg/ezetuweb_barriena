import { useEffect } from 'react';
import { Camera, MapPinPlus, X } from 'lucide-react';
import { useApp } from '@/lib/app-context';

export function ContributeModal({ onClose }: { onClose: () => void }) {
  const { t, setUploadOpen, setAddPlaceOpen } = useApp();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-lift border border-forest-100 dark:border-slate2-800 animate-popIn p-5">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 grid place-items-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="font-display text-lg font-700 text-forest-800 dark:text-sand-100 mb-1">{t('contributeTitle')}</h2>
        <p className="text-xs text-forest-700/60 dark:text-sand-300/60 mb-5">{t('contributeSubtitle')}</p>

        <div className="space-y-3">
          {/* Branch 1: Subir Foto */}
          <button
            onClick={() => { setUploadOpen(true); onClose(); }}
            className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-terracotta-50 dark:bg-terracotta-950/20 border-2 border-terracotta-200 dark:border-terracotta-800/50 hover:border-terracotta-400 dark:hover:border-terracotta-700 transition-all hover:shadow-soft text-left group"
          >
            <span className="grid place-items-center w-12 h-12 rounded-xl bg-gradient-to-br from-terracotta-400 to-terracotta-600 text-white shrink-0 shadow-soft group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-700 text-sm text-forest-800 dark:text-sand-100">{t('uploadPhotoTitle')}</p>
              <p className="text-xs text-forest-700/50 dark:text-sand-300/50 mt-0.5">{t('uploadPhotoSubtitle')}</p>
            </div>
          </button>

          {/* Branch 2: Registrar Nuevo Rincón (sin foto) */}
          <button
            onClick={() => { setAddPlaceOpen(true); onClose(); }}
            className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-forest-50 dark:bg-forest-950/20 border-2 border-forest-200 dark:border-forest-800/50 hover:border-forest-400 dark:hover:border-forest-700 transition-all hover:shadow-soft text-left group"
          >
            <span className="grid place-items-center w-12 h-12 rounded-xl bg-gradient-to-br from-forest-500 to-forest-700 text-white shrink-0 shadow-soft group-hover:scale-105 transition-transform">
              <MapPinPlus className="w-6 h-6" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-700 text-sm text-forest-800 dark:text-sand-100">{t('addPlaceTitle')}</p>
              <p className="text-xs text-forest-700/50 dark:text-sand-300/50 mt-0.5">{t('registerPlaceSubtitle')}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
