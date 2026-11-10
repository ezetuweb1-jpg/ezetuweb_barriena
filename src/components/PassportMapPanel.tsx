import { Map as MapIcon } from 'lucide-react';
import type { Spot } from '@/lib/types';
import type { PassportT } from '@/lib/passport-strings';
import { WorldMap } from './WorldMap';

interface Props {
  t: PassportT;
  lang: string;
  visitedSpots: Spot[];
}

export function PassportMapPanel({ t, lang, visitedSpots }: Props) {
  return (
    <section className="mb-8 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-forest-100 dark:border-slate-800 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <MapIcon className="w-5 h-5 text-forest-600 dark:text-forest-300" />
        <h2 className="font-display text-xl font-700 text-forest-800 dark:text-sand-100">
          {t('mapTitle')}
        </h2>
      </div>
      <WorldMap spots={visitedSpots} lang={lang} />
    </section>
  );
}
