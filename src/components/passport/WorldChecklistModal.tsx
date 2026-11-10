import { useMemo, useState } from 'react';
import { CircleCheck as CheckCircle2, Lock, Map as MapIcon, Search } from 'lucide-react';
import { PassportModal } from './PassportModal';
import { Ikurrina } from '@/components/Ikurrina';
import type { PassportKey, PassportT } from '@/lib/passport-strings';
import type { ConquestRow } from '@/lib/passport-conquest';
import { CONTINENT_ORDER, type ContinentId } from '@/lib/world-countries';

export const CONTINENT_KEYS: Record<ContinentId, PassportKey> = {
  europe: 'cont_eu',
  americas: 'cont_am',
  asia: 'cont_as',
  africa: 'cont_af',
  oceania: 'cont_oc',
  antarctica: 'cont_an',
};

const FILTER_CONTINENTS = CONTINENT_ORDER.filter((c) => c !== 'antarctica');

const stripAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

interface WorldChecklistModalProps {
  title: string;
  rows: ConquestRow[];
  t: PassportT;
  onExplore: () => void;
  onClose: () => void;
}

export function WorldChecklistModal({ title, rows, t, onExplore, onClose }: WorldChecklistModalProps) {
  const [query, setQuery] = useState('');
  const [continent, setContinent] = useState<ContinentId | 'all'>('all');

  const filtered = useMemo(() => {
    const q = stripAccents(query);
    return rows.filter((r) =>
      (continent === 'all' || r.continent === continent)
      && (q === '' || stripAccents(r.name).includes(q) || stripAccents(r.sub).includes(q)));
  }, [rows, query, continent]);

  const visited = filtered.filter((r) => r.visited);
  const pending = filtered.filter((r) => !r.visited);
  const hasPendingOverall = rows.some((r) => !r.visited);

  return (
    <PassportModal title={title} onClose={onClose} closeLabel={t('close')}>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-700/50 dark:text-sand-300/50" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-forest-50 dark:bg-slate2-900 border border-forest-100 dark:border-slate2-800 text-sm text-forest-800 dark:text-sand-100 placeholder:text-forest-700/50 dark:placeholder:text-sand-300/50 focus:outline-none focus:ring-2 focus:ring-forest-400"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {(['all', ...FILTER_CONTINENTS] as const).map((id) => {
          const active = continent === id;
          return (
            <button
              key={id}
              onClick={() => setContinent(id)}
              className={`px-3 py-1.5 rounded-full text-xs font-600 transition-colors ${active
                ? 'bg-forest-700 text-white'
                : 'bg-forest-50 dark:bg-slate2-900 text-forest-800 dark:text-sand-100 hover:bg-forest-100 dark:hover:bg-slate2-800'}`}
            >
              {id === 'all' ? t('filterAll') : t(CONTINENT_KEYS[id])}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-center text-forest-700/60 dark:text-sand-300/60 py-6">{t('noResults')}</p>
      )}

      <Group label={t('checklistVisited')} count={visited.length} rows={visited} t={t} />
      <Group label={t('checklistPending')} count={pending.length} rows={pending} t={t} />

      {hasPendingOverall && (
        <button
          onClick={onExplore}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-forest-600 to-forest-700 text-white font-600 shadow-soft hover:shadow-lift transition-shadow"
        >
          <MapIcon className="w-4 h-4" />
          {t('exploreBtn')}
        </button>
      )}
    </PassportModal>
  );
}

function Group({ label, count, rows, t }: { label: string; count: number; rows: ConquestRow[]; t: PassportT }) {
  if (rows.length === 0) return null;
  const isVisited = rows[0].visited;
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="text-xs uppercase tracking-wider text-forest-700/60 dark:text-sand-300/60 mb-2">{label} ({count})</h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-forest-50 dark:bg-slate2-900">
            {r.ikurrina
              ? <Ikurrina className="w-6 h-3 shrink-0 rounded-[2px] shadow-sm" />
              : isVisited
                ? <CheckCircle2 className="w-4 h-4 shrink-0 text-forest-600 dark:text-forest-300" />
                : <Lock className="w-4 h-4 shrink-0 text-forest-700/40 dark:text-sand-300/40" />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-600 text-forest-800 dark:text-sand-100 truncate">{r.name}</p>
              <p className="text-xs text-forest-700/60 dark:text-sand-300/60 truncate">{r.sub}</p>
            </div>
            {!isVisited && <span className="text-[11px] text-forest-700/50 dark:text-sand-300/50 shrink-0">{t('lockedHint')}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
