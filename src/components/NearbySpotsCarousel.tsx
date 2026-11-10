import { Star } from 'lucide-react';
import type { SpotWithRelations } from '@/lib/data';
import { useApp } from '@/lib/app-context';
import { basqueName, categoryColor } from '@/lib/utils';
import { ProtectedPhoto } from './ProtectedPhoto';

export type NearbySpot = SpotWithRelations & { distanceKm: number };

const CATEGORY_EMOJI: Record<string, string> = { city: '🏙️', village: '🏘️', nature: '🌲' };
const CATEGORY_LABEL_KEY: Record<string, string> = { city: 'cities', village: 'villages', nature: 'nature' };

interface NearbySpotsCarouselProps {
  spots: NearbySpot[];
  onSelect: (spotId: string) => void;
}

export function NearbySpotsCarousel({ spots, onSelect }: NearbySpotsCarouselProps) {
  const { t, lang } = useApp();
  if (spots.length === 0) return null;

  return (
    <section>
      <h3 className="font-600 text-forest-800 dark:text-sand-100 mb-3">{t('nearbySpotsTitle')}</h3>
      <div className="-mx-5 sm:-mx-6 px-5 sm:px-6 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3">
        {spots.map((s) => {
          const name = lang === 'EUS' && s.euskal_herria ? basqueName(s.id, s.name) : s.name;
          const cc = categoryColor(s.category);
          const distanceText = t('nearbyDistance').replace('{km}', String(s.distanceKm));
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="group snap-start shrink-0 w-56 text-left rounded-2xl overflow-hidden bg-white dark:bg-slate2-850 border border-forest-100 dark:border-slate2-800 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:border-forest-300 dark:hover:border-forest-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-400"
            >
              <div className="relative h-32 overflow-hidden bg-forest-100 dark:bg-slate2-800">
                {s.cover_photo && (
                  <ProtectedPhoto
                    src={s.cover_photo.image_url}
                    alt={name}
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate2-900/90 text-[10px] font-600 ring-1 ${cc.ring} ${cc.text}`}>
                  {CATEGORY_EMOJI[s.category]} {t(CATEGORY_LABEL_KEY[s.category] ?? 'nature')}
                </span>
              </div>
              <div className="p-3 space-y-2">
                <h4 className="font-600 text-sm text-forest-800 dark:text-sand-100 truncate">{name}</h4>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-xs font-700 text-forest-800 dark:text-sand-100">
                    <Star className="w-3.5 h-3.5 fill-terracotta-500 text-terracotta-500" />
                    {s.bayesian_rating.toFixed(1)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-terracotta-500/10 text-terracotta-700 dark:text-terracotta-300 text-[11px] font-600 whitespace-nowrap">
                    🚗 {distanceText}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
