import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Building2, Trees, Map as MapIcon, Mountain, CornerDownLeft, User } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useSpots, fetchAllPhotographers } from '@/lib/data';
import { basqueName, getLocalizedCountry } from '@/lib/utils';
import { socialText } from '@/lib/translations';
import { Ikurrina } from './Ikurrina';
import type { Spot, Category } from '@/lib/types';

type AreaBounds = [[number, number], [number, number]];

interface SpotResult {
  type: 'spot';
  id: string;
  name: string;
  category: Category;
  country_code: string;
  euskal_herria: string | null;
}

interface AreaResult {
  type: 'area';
  name: string;
  bounds: AreaBounds;
  aliases?: string[];
}

interface AuthorResult {
  type: 'author';
  name: string;
}

type SearchResult = SpotResult | AreaResult | AuthorResult;

const BROAD_AREAS: Omit<AreaResult, 'type'>[] = [
  { name: 'Costa Amalfitana', aliases: ['Amalfi Coast', 'Costiera Amalfitana'], bounds: [[40.58, 14.42], [40.72, 14.70]] },
  { name: 'Dolomiti', aliases: ['Dolomitas', 'Dolomites', 'Dolomiten'], bounds: [[46.2, 11.5], [46.9, 12.6]] },
  { name: 'Pirineos', aliases: ['Pyrenees', 'Pirinioak', 'Pirénées'], bounds: [[42.4, -0.8], [43.1, 0.7]] },
  { name: 'Toscana', aliases: ['Tuscany', 'Toskana'], bounds: [[42.8, 10.5], [44.0, 12.0]] },
  { name: 'Selva Negra', aliases: ['Schwarzwald', 'Black Forest'], bounds: [[47.55, 7.45], [48.65, 8.55]] },
  { name: 'Gorbeia', aliases: ['Gorbea'], bounds: [[42.98, -2.86], [43.15, -2.65]] },

  { name: "Val d'Orcia", bounds: [[42.9, 11.3], [43.2, 11.9]] },
  { name: 'Euskal Herria', bounds: [[42.8, -2.0], [43.5, -0.5]] },
  { name: 'Alps', bounds: [[45.5, 6.0], [47.5, 12.5]] },
  { name: 'Patagonia', bounds: [[-52.0, -74.0], [-49.0, -71.0]] },
  { name: 'Andalucía', bounds: [[36.0, -6.5], [38.5, -1.5]] },
];

function searchAreas(query: string): AreaResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return BROAD_AREAS.filter((a) => a.name.toLowerCase().includes(q) || (a.aliases ?? []).some((alias) => alias.toLowerCase().includes(q)))
    .slice(0, 4)
    .map((a) => ({ ...a, type: 'area' as const }));
}

function searchAuthorsList(authors: string[], query: string): AuthorResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return authors
    .filter((name) => name.toLowerCase().includes(q))
    .slice(0, 4)
    .map((name) => ({ type: 'author' as const, name }));
}

function searchSpotsList(spots: Spot[], query: string, lang: string): SpotResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return spots
    .filter((s) => {
      const name = (lang === 'EUS' && s.euskal_herria ? basqueName(s.id, s.name) : s.name).toLowerCase();
      return name.includes(q) || (s.region?.toLowerCase().includes(q) ?? false);
    })
    .slice(0, 8)
    .map((s) => ({
      type: 'spot' as const,
      id: s.id,
      name: lang === 'EUS' && s.euskal_herria ? basqueName(s.id, s.name) : s.name,
      category: s.category,
      country_code: s.country_code,
      euskal_herria: s.euskal_herria,
    }));
}

function categoryIcon(cat: Category) {
  if (cat === 'city') return Building2;
  if (cat === 'village') return MapIcon;
  return Trees;
}

export function UniversalSearch() {
  const { lang, setTab, setFocusedSpotId, setFocusedAreaBounds, setPhotographerOpen } = useApp();
  const { spots } = useSpots();
  const social = socialText(lang);
  const [authors, setAuthors] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetchAllPhotographers()
      .then((list) => { if (alive) setAuthors(list.map((a) => a.author)); })
      .catch(() => { if (alive) setAuthors([]); });
    return () => { alive = false; };
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    if (query.trim().length < 2) return [];
    return [...searchAreas(query), ...searchAuthorsList(authors, query), ...searchSpotsList(spots, query, lang)];
  }, [spots, authors, query, lang]);

  useEffect(() => { setHighlighted(0); }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const selectResult = (result: SearchResult) => {
    setOpen(false);
    setQuery('');
    if (result.type === 'author') {
      setPhotographerOpen(result.name);
      return;
    }
    setTab('map');
    if (result.type === 'spot') {
      setFocusedAreaBounds(null);
      setFocusedSpotId(result.id);
    } else {
      setFocusedSpotId(null);
      setFocusedAreaBounds(result.bounds);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[highlighted]) selectResult(results[highlighted]); }
  };

  const placeholder =
    lang === 'EUS' ? 'Bilatu herria, mendia, parkea (adib. Gorbeia, Dolomiti, Albarracín)...' :
    lang === 'EN' ? 'Search a town, peak, or area (e.g. Dolomites, Gorbeia, Potes)...' :
    'Busca un pueblo, cima, zona (ej. Dolomitas, Gorbeia, Potes)...';

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac');
  const shortcut = isMac ? '⌘K' : 'Ctrl K';

  const areaLabel = lang === 'EUS' ? 'Zonalde handiak' : lang === 'EN' ? 'Broad areas' : 'Grandes zonas';
  const spotLabel = lang === 'EUS' ? 'Leku zehatzak' : lang === 'EN' ? 'Specific places' : 'Lugares específicos';
  const viewAreaLabel = lang === 'EUS' ? 'Ikusi area mapan' : lang === 'EN' ? 'View area on map' : 'Ver área en el mapa';
  const noResultsLabel = lang === 'EUS' ? 'Emaitzarik ez' : lang === 'EN' ? 'No results' : 'Sin resultados';

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <div className={`flex items-center gap-2 px-3 h-9 rounded-xl border bg-white dark:bg-slate2-900 transition-colors ${
        open ? 'border-forest-400 dark:border-slate2-600 ring-2 ring-forest-400/15 dark:ring-slate2-600/20' : 'border-forest-100 dark:border-slate2-800 hover:border-forest-300 dark:hover:border-slate2-700'
      }`}>
        <Search className="w-4 h-4 text-forest-700/50 dark:text-sand-300/50 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-forest-800 dark:text-sand-100 outline-none placeholder:text-forest-700/40 dark:placeholder:text-sand-300/40 min-w-0"
        />
        {query ? (
          <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="shrink-0 text-forest-700/40 dark:text-sand-300/40 hover:text-forest-700/70 dark:hover:text-sand-300/70">
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-forest-50 dark:bg-slate2-800 border border-forest-100 dark:border-slate2-700 text-[10px] font-600 text-forest-700/50 dark:text-sand-300/50 shrink-0">
            {shortcut}
          </kbd>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-900 shadow-lift overflow-hidden z-[2100] animate-popIn origin-top max-h-[60vh] overflow-y-auto no-scrollbar">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-forest-700/50 dark:text-sand-300/50">{noResultsLabel}</div>
          ) : (
            <div className="py-1.5">
              {results.filter((r) => r.type === 'area').length > 0 && (
                <div className="px-3 pb-1 pt-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-700 text-forest-600/50 dark:text-sand-400/50">🏞️ {areaLabel}</span>
                </div>
              )}
              {results.map((r, idx) => {
                const isArea = r.type === 'area';
                const isAuthor = r.type === 'author';
                const isSpot = r.type === 'spot';
                const prevIsSpot = idx > 0 ? results[idx - 1].type === 'spot' : false;
                const showSpotHeader = isSpot && (idx === 0 || !prevIsSpot);
                const showAuthorHeader = isAuthor && (idx === 0 || results[idx - 1].type !== 'author');
                const isActive = idx === highlighted;
                const Icon = isArea ? Mountain : isAuthor ? User : categoryIcon((r as SpotResult).category);
                const spotR = isSpot ? (r as SpotResult) : null;
                const areaR = isArea ? (r as AreaResult) : null;
                const authorR = isAuthor ? (r as AuthorResult) : null;
                return (
                  <div key={idx}>
                    {showAuthorHeader && (
                      <div className="px-3 pb-1 pt-2">
                        <span className="text-[10px] uppercase tracking-wider font-700 text-forest-600/50 dark:text-sand-400/50">{social.searchAuthorsHeader}</span>
                      </div>
                    )}
                    {showSpotHeader && (
                      <div className="px-3 pb-1 pt-2">
                        <span className="text-[10px] uppercase tracking-wider font-700 text-forest-600/50 dark:text-sand-400/50">{spotLabel}</span>
                      </div>
                    )}
                    <button
                      onMouseEnter={() => setHighlighted(idx)}
                      onClick={() => selectResult(r)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        isActive ? 'bg-forest-50 dark:bg-slate2-800' : 'hover:bg-forest-50/60 dark:hover:bg-slate2-800/60'
                      }`}
                    >
                      <div className={`grid place-items-center w-9 h-9 rounded-xl shrink-0 ${
                        isArea ? 'bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-600 dark:text-terracotta-300' :
                        isAuthor ? 'bg-forest-100 dark:bg-slate2-800 text-forest-700 dark:text-sand-200' :
                        spotR!.category === 'city' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300' :
                        spotR!.category === 'village' ? 'bg-terracotta-500/15 text-terracotta-600 dark:text-terracotta-300' :
                        'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-600 text-forest-800 dark:text-sand-100 truncate">
                            {areaR?.name ?? authorR?.name ?? spotR!.name}
                          </span>
                          {spotR && lang === 'EUS' && spotR.euskal_herria && <Ikurrina className="w-3.5 h-2 shrink-0" />}
                        </div>
                        <div className="text-[11px] text-forest-700/50 dark:text-sand-300/50 truncate">
                          {isArea
                            ? viewAreaLabel
                            : isAuthor
                              ? `@${authorR!.name.toLowerCase().replace(/\s+/g, '_')}`
                              : `${getLocalizedCountry({ country_code: spotR!.country_code, country: '', euskal_herria: spotR!.euskal_herria }, lang).name}${spotR!.euskal_herria ? ' · ' + spotR!.euskal_herria : ''}`}
                        </div>
                      </div>
                      {isActive && <CornerDownLeft className="w-3.5 h-3.5 text-forest-400 dark:text-sand-300/40 shrink-0" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
