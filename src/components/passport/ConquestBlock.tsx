import { useState, type ReactNode } from 'react';
import { CircleCheck as CheckCircle2, Hourglass, Globe2, Landmark, Map as MapIcon, Heart } from 'lucide-react';
import { PassportModal } from './PassportModal';
import { AnimatedBar } from './AnimatedBar';
import { WorldChecklistModal, CONTINENT_KEYS } from './WorldChecklistModal';
import { type PassportT, type PassportLang, passportLocale } from '@/lib/passport-strings';
import type { ConquestSnapshot } from '@/lib/passport-conquest';

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

interface ConquestBlockProps {
  t: PassportT;
  lang: PassportLang;
  snapshot: ConquestSnapshot;
  totalLikes: number;
  onExplore: () => void;
}

type OpenList = 'continents' | 'capitals' | 'countries' | null;

export function ConquestBlock({ t, lang, snapshot, totalLikes, onExplore }: ConquestBlockProps) {
  const [open, setOpen] = useState<OpenList>(null);

  const continentsVisited = snapshot.continents.filter((c) => c.visited).length;
  const continentsTotal = snapshot.continents.length;
  const capitalsVisited = snapshot.capitals.filter((c) => c.visited).length;
  const capitalsTotal = snapshot.capitals.length;
  const { countriesVisited, countriesTotal } = snapshot;
  const worldPct = ((countriesVisited / countriesTotal) * 100).toFixed(1);

  const continentItems: ChecklistItem[] = snapshot.continents.map((c) => ({
    id: c.id,
    label: t(CONTINENT_KEYS[c.id]),
    done: c.visited,
  }));

  const cards: { id: string; icon: ReactNode; label: string; value: string; sub: string; pct: number; onClick?: () => void }[] = [
    {
      id: 'continents',
      icon: <Globe2 className="w-5 h-5" />,
      label: t('continentsMetric'),
      value: `${continentsVisited} / ${continentsTotal}`,
      sub: '',
      pct: (continentsVisited / continentsTotal) * 100,
      onClick: () => setOpen('continents'),
    },
    {
      id: 'capitals',
      icon: <Landmark className="w-5 h-5" />,
      label: t('capitalsMetric'),
      value: `${capitalsVisited} / ${capitalsTotal}`,
      sub: '',
      pct: (capitalsVisited / capitalsTotal) * 100,
      onClick: () => setOpen('capitals'),
    },
    {
      id: 'world',
      icon: <MapIcon className="w-5 h-5" />,
      label: t('worldMetric'),
      value: `${countriesVisited} / ${countriesTotal}`,
      sub: t('countriesSuffix', { pct: worldPct }),
      pct: Number(worldPct),
      onClick: () => setOpen('countries'),
    },
    {
      id: 'likes',
      icon: <Heart className="w-5 h-5" />,
      label: t('likesMetric'),
      value: totalLikes.toLocaleString(passportLocale(lang)),
      sub: t('likesHint'),
      pct: Math.min(100, (totalLikes / 1000) * 100),
    },
  ];

  return (
    <section className="mb-8">
      <h2 className="font-display text-2xl font-700 text-forest-800 dark:text-sand-100 mb-4">{t('conquestTitle')}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const interactive = Boolean(c.onClick);
          const Wrapper = interactive ? 'button' : 'div';
          return (
            <Wrapper
              key={c.id}
              onClick={c.onClick}
              className={`text-left p-5 rounded-2xl bg-white dark:bg-slate2-850 border border-forest-100 dark:border-slate2-800 shadow-soft ${interactive ? 'hover:border-forest-300 dark:hover:border-slate2-700 hover:shadow-lift transition-all' : ''}`}
            >
              <div className="flex items-center gap-2 text-forest-600 dark:text-forest-300">
                {c.icon}
                <span className="text-[11px] uppercase tracking-wider text-forest-700/70 dark:text-sand-300/70 truncate">{c.label}</span>
              </div>
              <div className="font-display text-3xl font-700 text-forest-800 dark:text-sand-100 mt-2">{c.value}</div>
              {c.sub && <p className="text-xs text-forest-700/60 dark:text-sand-300/60 mt-0.5">{c.sub}</p>}
              <AnimatedBar pct={c.pct} className="mt-3 h-2 rounded-full bg-forest-100 dark:bg-slate2-800 overflow-hidden" fillClassName="h-full rounded-full bg-gradient-to-r from-forest-500 to-terracotta-500" />
            </Wrapper>
          );
        })}
      </div>

      {open === 'continents' && (
        <ContinentsModal
          title={t('continentsModalTitle')}
          items={continentItems}
          t={t}
          onExplore={() => { setOpen(null); onExplore(); }}
          onClose={() => setOpen(null)}
        />
      )}
      {open === 'capitals' && (
        <WorldChecklistModal
          title={t('capitalsModalTitle')}
          rows={snapshot.capitals}
          t={t}
          onExplore={() => { setOpen(null); onExplore(); }}
          onClose={() => setOpen(null)}
        />
      )}
      {open === 'countries' && (
        <WorldChecklistModal
          title={t('countriesModalTitle', { total: countriesTotal })}
          rows={snapshot.countries}
          t={t}
          onExplore={() => { setOpen(null); onExplore(); }}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

function ContinentsModal({ title, items, t, onExplore, onClose }: {
  title: string;
  items: ChecklistItem[];
  t: PassportT;
  onExplore: () => void;
  onClose: () => void;
}) {
  const done = items.filter((i) => i.done);
  const pending = items.filter((i) => !i.done);
  return (
    <PassportModal title={title} onClose={onClose} closeLabel={t('close')}>
      <Group label={t('checklistVisited')} count={done.length} items={done} />
      <Group label={t('checklistPending')} count={pending.length} items={pending} />
      {pending.length > 0 && (
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

function Group({ label, count, items }: { label: string; count: number; items: ChecklistItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="text-xs uppercase tracking-wider text-forest-700/60 dark:text-sand-300/60 mb-2">{label} ({count})</h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-forest-50 dark:bg-slate2-900 text-sm text-forest-800 dark:text-sand-100">
            {i.done
              ? <CheckCircle2 className="w-4 h-4 shrink-0 text-forest-600 dark:text-forest-300" />
              : <Hourglass className="w-4 h-4 shrink-0 text-terracotta-500" />}
            <span className="truncate">{i.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
