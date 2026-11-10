import { Image, Trophy, Map, BookUser } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import type { ViewTab } from '@/lib/types';

export function BottomNav() {
  const { t, tab, setTab } = useApp();

  const items: { id: ViewTab; icon: typeof Image; label: string }[] = [
    { id: 'gallery', icon: Image, label: t('gallery') },
    { id: 'rankings', icon: Trophy, label: t('rankings') },
    { id: 'map', icon: Map, label: t('mapExplorer') },
    { id: 'passport', icon: BookUser, label: t('myPassport') },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-[1900] bg-white/95 dark:bg-slate2-950/95 backdrop-blur-xl border-t border-forest-100/80 dark:border-slate2-800/80 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-stretch justify-around max-w-[480px] mx-auto px-2 pt-1 pb-[env(safe-area-inset-bottom)]">
        {items.map((it) => {
          const Icon = it.icon;
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-colors"
            >
              <span className={`grid place-items-center w-8 h-8 rounded-xl transition-all ${active ? 'bg-forest-600 text-white scale-105 shadow-soft' : 'text-forest-700/60 dark:text-sand-300/60'}`}>
                <Icon className="w-4 h-4" strokeWidth={2.2} />
              </span>
              <span className={`text-[10px] font-600 whitespace-nowrap leading-none ${active ? 'text-forest-700 dark:text-sand-100' : 'text-forest-700/60 dark:text-sand-300/60'}`}>
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
