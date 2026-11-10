import { useState } from 'react';
import { Menu, X, Mountain, MapPinPlus } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import type { ViewTab } from '@/lib/types';
import { UserMenu } from './UserMenu';
import { UniversalSearch } from './UniversalSearch';

export function Header() {
  const { t, tab, setTab, setUploadOpen, setAddPlaceOpen, setContributeOpen, setWishlistOpen } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const tabs: { id: ViewTab; icon: string; label: string }[] = [
    { id: 'gallery', icon: '🖼️', label: t('gallery') },
    { id: 'rankings', icon: '🏆', label: t('rankings') },
    { id: 'map', icon: '🗺️', label: t('mapExplorer') },
    { id: 'passport', icon: '🛂', label: t('myPassport') },
  ];

  const onTabClick = (id: ViewTab) => {
    setTab(id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-[2000] bg-white/85 dark:bg-slate2-950/85 backdrop-blur-xl border-b border-forest-100/80 dark:border-slate2-800/80">
      <div className="flex items-center justify-between h-14 px-4 max-w-[1600px] mx-auto gap-3">
        {/* LEFT: Logo */}
        <button onClick={() => setTab('gallery')} className="flex items-center gap-2 shrink-0 group">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-forest-600 text-white shadow-soft group-hover:scale-105 transition-transform">
            <Mountain className="w-4 h-4" strokeWidth={2.2} />
          </span>
          <span className="hidden sm:flex flex-col leading-none text-left">
            <span className="font-display text-lg font-600 tracking-tight text-forest-800 dark:text-sand-100">Ezetu</span>
            <span className="text-[9px] uppercase tracking-[0.14em] text-terracotta-500 dark:text-terracotta-300/80 font-500">{t('tagline')}</span>
          </span>
        </button>

        {/* CENTER: Universal Search (desktop) + Segmented Control */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-2xl">
          <UniversalSearch />
        </div>

        {/* CENTER: Segmented Control pill bar (desktop only) */}
        <nav className="hidden md:flex items-center gap-0.5 p-1 rounded-2xl bg-forest-50 dark:bg-slate2-900/60 border border-forest-100 dark:border-slate2-800 shrink-0">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              onClick={() => onTabClick(tb.id)}
              className={`px-3.5 lg:px-4 py-1.5 rounded-xl text-[13px] font-600 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                tab === tb.id
                  ? 'bg-white dark:bg-slate2-800 text-forest-800 dark:text-sand-100 shadow-soft'
                  : 'text-forest-700/70 dark:text-sand-300/70 hover:text-forest-800 dark:hover:text-sand-100'
              }`}
            >
              <span className="text-sm">{tb.icon}</span>
              <span>{tb.label}</span>
            </button>
          ))}
        </nav>

        {/* RIGHT: + Aportar + User Avatar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* + Aportar / Gehitu — always visible */}
          <button
            onClick={() => setContributeOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-600 text-sm shadow-soft transition-colors"
          >
            <MapPinPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('contributePlace')}</span>
            <span className="sm:hidden">+</span>
          </button>

          {/* User Avatar + Dropdown */}
          <UserMenu />

          {/* Mobile menu — secondary actions only (nav is in BottomNav) */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden grid place-items-center w-9 h-9 rounded-lg border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-900 text-forest-800 dark:text-sand-100"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown — secondary actions only */}
      {mobileOpen && (
        <nav className="md:hidden flex flex-col gap-1 px-4 pb-3 pt-1.5 animate-riseIn">
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => { setAddPlaceOpen(true); setMobileOpen(false); }}
              className="flex-1 px-3.5 py-2.5 rounded-lg bg-forest-600 text-white font-600 text-sm flex items-center justify-center gap-2"
            >
              <MapPinPlus className="w-4 h-4" />
              {t('registerNewPlace')}
            </button>
            <button
              onClick={() => { setUploadOpen(true); setMobileOpen(false); }}
              className="flex-1 px-3.5 py-2.5 rounded-lg bg-terracotta-500 text-white font-600 text-sm flex items-center justify-center gap-2"
            >
              {t('addPhoto')}
            </button>
          </div>
          <button
            onClick={() => { setWishlistOpen(true); setMobileOpen(false); }}
            className="px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-forest-100 dark:border-slate2-800 text-forest-800 dark:text-sand-100 font-500 text-sm flex items-center gap-3"
          >
            🔖 {t('saved')}
          </button>
        </nav>
      )}
    </header>
  );
}
