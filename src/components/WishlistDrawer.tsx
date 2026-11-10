import { useEffect } from 'react';
import { X, Bookmark, MapPin, Trash2, MapPin as MapIcon } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useSpots } from '@/lib/data';
import { flagEmoji, basqueName, getLocalizedCountry } from '@/lib/utils';
import { Ikurrina } from './Ikurrina';

export function WishlistDrawer({ onClose, onOpenSpot }: { onClose: () => void; onOpenSpot: (id: string) => void }) {
  const { t, lang, savedSpotIds, toggleSaved } = useApp();
  const { spots } = useSpots();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const savedSpots = spots.filter((s) => savedSpotIds.includes(s.id));

  const handleViewOnMap = (id: string) => {
    onOpenSpot(id);
    onClose();
  };

  const categoryEmoji = (category: string) =>
    category === 'city' ? '🏙️' : category === 'village' ? '🏘️' : '🌲';

  return (
    <div className="fixed inset-0 z-[5000] flex justify-end animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="relative w-full sm:max-w-md h-full bg-sand-50 dark:bg-slate2-900 shadow-lift flex flex-col animate-popIn">
        {/* Header with prominent close */}
        <div className="flex items-center justify-between p-5 border-b border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-850">
          <h2 className="font-display text-xl font-700 text-forest-800 dark:text-sand-100 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-terracotta-500 fill-terracotta-500" />
            {t('savedSpots')} ({savedSpots.length})
          </h2>
          <button
            onClick={onClose}
            aria-label={t('close')}
            className="grid place-items-center w-10 h-10 rounded-full bg-forest-100 dark:bg-slate2-800 hover:bg-forest-200 dark:hover:bg-slate2-700 text-forest-800 dark:text-sand-100 ring-1 ring-forest-200 dark:ring-slate2-700 transition-all hover:scale-105 shadow-soft"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {savedSpots.length === 0 ? (
            <div className="grid place-items-center h-full text-center px-6">
              <div>
                <Bookmark className="w-12 h-12 text-forest-300 dark:text-slate2-700 mx-auto mb-3" />
                <p className="text-sm text-forest-700/60 dark:text-sand-300/60 leading-relaxed">
                  {t('noSaved')}
                </p>
              </div>
            </div>
          ) : (
            savedSpots.map((s) => {
              const isEus = lang === 'EUS' && s.euskal_herria;
              return (
                <div
                  key={s.id}
                  className="w-full flex gap-3 p-3 rounded-2xl bg-white dark:bg-slate2-850 border border-forest-100 dark:border-slate2-800 hover:border-forest-300 dark:hover:border-slate2-700 transition-colors"
                >
                  <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-forest-100 dark:bg-slate2-800">
                    {s.cover_photo && (
                      <img src={s.cover_photo.image_url} alt={s.name} loading="lazy" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-600 text-sm text-forest-800 dark:text-sand-100 truncate">
                        {isEus ? basqueName(s.id, s.name) : s.name}
                      </h3>
                      <p className="text-xs text-forest-700/60 dark:text-sand-300/60 truncate flex items-center gap-1">
                        {isEus ? <Ikurrina className="w-3 h-1.5" /> : <span>{flagEmoji(s.country_code)}</span>}{' '}
                        {getLocalizedCountry(s, lang).name}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-700 dark:text-terracotta-300 font-600 mt-1 inline-block">
                        {categoryEmoji(s.category)} {t(s.category === 'city' ? 'cities' : s.category === 'village' ? 'villages' : 'nature')}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-1.5">
                      <button
                        onClick={() => handleViewOnMap(s.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-forest-600 text-white text-[11px] font-600 hover:bg-forest-700 transition-colors"
                      >
                        <MapPin className="w-3 h-3" />
                        {t('viewOnMapBtn')}
                      </button>
                      <button
                        onClick={() => toggleSaved(s.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-[11px] font-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        {lang === 'EUS' ? 'Kendu' : 'Quitar'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
