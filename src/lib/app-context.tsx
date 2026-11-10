import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LangCode, ViewTab, Photo, Spot } from './types';
import { makeT } from './i18n';
import { markVisited, unmarkVisited } from './data';

type ThemeMode = 'light' | 'dark' | 'auto';
type ResolvedTheme = 'light' | 'dark';

interface Toast {
  id: number;
  message: string;
  emoji?: string;
}

export interface RankingsFilter {
  continent: string;
  country: string;
  province: string;
}

interface AppCtx {
  mapLayer: 'all' | 'visited' | 'saved';
  setMapLayer: (v: 'all' | 'visited' | 'saved') => void;
  photographerOpen: string | null;
  setPhotographerOpen: (name: string | null) => void;
  theme: ResolvedTheme;
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  toggleTheme: () => void;
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (k: string) => string;
  tab: ViewTab;
  setTab: (v: ViewTab) => void;
  uploadOpen: boolean;
  setUploadOpen: (v: boolean) => void;
  addPlaceOpen: boolean;
  setAddPlaceOpen: (v: boolean) => void;
  addPlaceWithPhotoOpen: boolean;
  setAddPlaceWithPhotoOpen: (v: boolean) => void;
  contributeOpen: boolean;
  setContributeOpen: (v: boolean) => void;
  prefilledComarca: string | null;
  setPrefilledComarca: (v: string | null) => void;
  wishlistOpen: boolean;
  setWishlistOpen: (v: boolean) => void;
  focusedSpotId: string | null;
  setFocusedSpotId: (id: string | null) => void;
  focusedAreaBounds: [[number, number], [number, number]] | null;
  setFocusedAreaBounds: (b: [[number, number], [number, number]] | null) => void;
  lightboxPhotos: Photo[] | null;
  lightboxSpot: Spot | null;
  lightboxIndex: number;
  lightboxPhotoSpots: Record<string, Spot> | null;
  lightboxViewSpot: ((spot: Spot) => void) | null;
  lightboxAwardLabels: Record<string, string> | null;
  openLightbox: (photos: Photo[], spot: Spot | null, index: number, opts?: { photoSpots?: Record<string, Spot>; onViewSpot?: (spot: Spot) => void; awardLabels?: Record<string, string> }) => void;
  closeLightbox: () => void;
  spotsRefreshKey: number;
  bumpSpotsRefresh: () => void;
  visitedSpotIds: Set<string>;
  toggleVisited: (spotId: string) => void;
  savedSpotIds: string[];
  toggleSaved: (spotId: string) => void;
  isSaved: (spotId: string) => boolean;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  showToast: (message: string, emoji?: string) => void;
  rankingsFilter: RankingsFilter | null;
  navigateToRankings: (filter: RankingsFilter) => void;
  clearRankingsFilter: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

const LANG_KEY = 'ezetu.lang';
const THEME_KEY = 'ezetu.theme';
const VISITED_KEY = 'ezetu.visited';
const SAVED_KEY = 'ezetu_saved_spots';

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'auto') return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return mode;
}

function loadVisited(): Set<string> {
  try {
    const raw = localStorage.getItem(VISITED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch { return new Set(); }
}

function saveVisited(ids: Set<string>) {
  try { localStorage.setItem(VISITED_KEY, JSON.stringify([...ids])); } catch { /* ignore */ }
}

function loadSaved(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function persistSaved(ids: string[]) {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(ids)); } catch { /* ignore */ }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    return saved ?? 'auto';
  });
  const [theme, setTheme] = useState<ResolvedTheme>(() => resolveTheme(localStorage.getItem(THEME_KEY) as ThemeMode | null ?? 'auto'));
  const [lang, setLangState] = useState<LangCode>(() => (localStorage.getItem(LANG_KEY) as LangCode) ?? 'ES');
  const [tab, setTab] = useState<ViewTab>('gallery');
  const [mapLayer, setMapLayer] = useState<'all' | 'visited' | 'saved'>('all');
  const [photographerOpen, setPhotographerOpen] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [addPlaceOpen, setAddPlaceOpen] = useState(false);
  const [addPlaceWithPhotoOpen, setAddPlaceWithPhotoOpen] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [prefilledComarca, setPrefilledComarca] = useState<string | null>(null);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [focusedSpotId, setFocusedSpotId] = useState<string | null>(null);
  const [focusedAreaBounds, setFocusedAreaBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [spotsRefreshKey, setSpotsRefreshKey] = useState(0);
  const [lightboxPhotos, setLightboxPhotos] = useState<Photo[] | null>(null);
  const [lightboxSpot, setLightboxSpot] = useState<Spot | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxPhotoSpots, setLightboxPhotoSpots] = useState<Record<string, Spot> | null>(null);
  const [lightboxViewSpot, setLightboxViewSpot] = useState<((spot: Spot) => void) | null>(null);
  const [lightboxAwardLabels, setLightboxAwardLabels] = useState<Record<string, string> | null>(null);
  const [visitedSpotIds, setVisitedSpotIds] = useState<Set<string>>(() => loadVisited());
  const [savedSpotIds, setSavedSpotIds] = useState<string[]>(() => loadSaved());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [rankingsFilter, setRankingsFilter] = useState<RankingsFilter | null>(null);

  const t = useMemo(() => makeT(lang), [lang]);

  const bumpSpotsRefresh = useCallback(() => setSpotsRefreshKey((k) => k + 1), []);
  const openLightbox = useCallback((photos: Photo[], spot: Spot | null, index: number, opts?: { photoSpots?: Record<string, Spot>; onViewSpot?: (spot: Spot) => void; awardLabels?: Record<string, string> }) => {
    setLightboxPhotos(photos); setLightboxSpot(spot); setLightboxIndex(index);
    setLightboxPhotoSpots(opts?.photoSpots ?? null);
    setLightboxViewSpot(opts?.onViewSpot ? () => opts.onViewSpot! : null);
    setLightboxAwardLabels(opts?.awardLabels ?? null);
  }, []);
  const closeLightbox = useCallback(() => {
    setLightboxPhotos(null); setLightboxPhotoSpots(null); setLightboxViewSpot(null); setLightboxAwardLabels(null);
  }, []);

  const navigateToRankings = useCallback((filter: RankingsFilter) => {
    setLightboxPhotos(null); setLightboxPhotoSpots(null); setLightboxViewSpot(null); setLightboxAwardLabels(null);
    setPhotographerOpen(null); setUploadOpen(false); setAddPlaceOpen(false); setAddPlaceWithPhotoOpen(false);
    setContributeOpen(false); setWishlistOpen(false); setFocusedSpotId(null);
    setRankingsFilter(filter);
    setTab('rankings');
  }, []);

  const clearRankingsFilter = useCallback(() => setRankingsFilter(null), []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, emoji?: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, emoji }]);
    setTimeout(() => dismissToast(id), 3000);
  }, [dismissToast]);

  const toggleVisited = useCallback((spotId: string) => {
    const wasVisited = visitedSpotIds.has(spotId);
    setVisitedSpotIds((prev) => {
      const next = new Set(prev);
      if (next.has(spotId)) {
        next.delete(spotId);
        unmarkVisited(spotId).catch(() => {});
      } else {
        next.add(spotId);
        markVisited(spotId).catch(() => {});
      }
      saveVisited(next);
      return next;
    });
    if (wasVisited) {
      showToast(lang === 'EUS' ? 'Lekua zure Pasaportetik kendu da' : t('visitedRemoved'));
    } else {
      showToast(lang === 'EUS' ? 'Lekua zure Pasaporteara gehitu da' : t('visitedToast'), '🎉');
    }
  }, [visitedSpotIds, showToast, t, lang]);

  const toggleSaved = useCallback((spotId: string) => {
    setSavedSpotIds((prev) => {
      const exists = prev.includes(spotId);
      const next = exists ? prev.filter((id) => id !== spotId) : [...prev, spotId];
      persistSaved(next);
      if (!exists) showToast(lang === 'EUS' ? 'Zure zerrenda gordetara gehitu da!' : '¡Añadido a tus lugares guardados!', '🔖');
      return next;
    });
  }, [showToast, lang]);

  const isSaved = useCallback((spotId: string) => savedSpotIds.includes(spotId), [savedSpotIds]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  // Track OS preference changes when in auto mode
  useEffect(() => {
    if (themeMode !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setTheme(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    setTheme(mq.matches ? 'dark' : 'light');
    return () => mq.removeEventListener('change', handler);
  }, [themeMode]);

  const setThemeMode = useCallback((m: ThemeMode) => {
    setThemeModeState(m);
    localStorage.setItem(THEME_KEY, m);
    setTheme(resolveTheme(m));
  }, []);

  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
    document.documentElement.lang = l.toLowerCase();
  }, []);

  useEffect(() => { document.documentElement.lang = lang.toLowerCase(); }, [lang]);

  const toggleTheme = useCallback(() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark'), [themeMode, setThemeMode]);

  const value: AppCtx = {
    mapLayer, setMapLayer,
    photographerOpen, setPhotographerOpen,
    theme, themeMode, setThemeMode, toggleTheme, lang, setLang, t,
    tab, setTab, uploadOpen, setUploadOpen, addPlaceOpen, setAddPlaceOpen, addPlaceWithPhotoOpen, setAddPlaceWithPhotoOpen, contributeOpen, setContributeOpen, prefilledComarca, setPrefilledComarca, wishlistOpen, setWishlistOpen,
    focusedSpotId, setFocusedSpotId, focusedAreaBounds, setFocusedAreaBounds, spotsRefreshKey, bumpSpotsRefresh,
    lightboxPhotos, lightboxSpot, lightboxIndex, lightboxPhotoSpots, lightboxViewSpot, lightboxAwardLabels, openLightbox, closeLightbox,
    visitedSpotIds, toggleVisited, savedSpotIds, toggleSaved, isSaved, toasts, dismissToast, showToast,
    rankingsFilter, navigateToRankings, clearRankingsFilter,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const c = useContext(Ctx);
  if (c) return c;
  const noop = (() => {}) as (...args: unknown[]) => unknown;
  return {
    mapLayer: 'all', setMapLayer: noop as AppCtx['setMapLayer'],
    photographerOpen: null, setPhotographerOpen: noop as AppCtx['setPhotographerOpen'],
    theme: 'light', themeMode: 'auto', setThemeMode: noop as AppCtx['setThemeMode'], toggleTheme: noop as AppCtx['toggleTheme'],
    lang: 'ES', setLang: noop as AppCtx['setLang'],
    t: (k: string) => k,
    tab: 'gallery', setTab: noop as AppCtx['setTab'],
    uploadOpen: false, setUploadOpen: noop as AppCtx['setUploadOpen'],
    addPlaceOpen: false, setAddPlaceOpen: noop as AppCtx['setAddPlaceOpen'],
    addPlaceWithPhotoOpen: false, setAddPlaceWithPhotoOpen: noop as AppCtx['setAddPlaceWithPhotoOpen'],
    contributeOpen: false, setContributeOpen: noop as AppCtx['setContributeOpen'],
    prefilledComarca: null, setPrefilledComarca: noop as AppCtx['setPrefilledComarca'],
    wishlistOpen: false, setWishlistOpen: noop as AppCtx['setWishlistOpen'],
    focusedSpotId: null, setFocusedSpotId: noop as AppCtx['setFocusedSpotId'],
    focusedAreaBounds: null, setFocusedAreaBounds: noop as AppCtx['setFocusedAreaBounds'],
    spotsRefreshKey: 0, bumpSpotsRefresh: noop as AppCtx['bumpSpotsRefresh'],
    lightboxPhotos: null, lightboxSpot: null, lightboxIndex: 0,
    lightboxPhotoSpots: null, lightboxViewSpot: null, lightboxAwardLabels: null,
    openLightbox: noop as AppCtx['openLightbox'], closeLightbox: noop as AppCtx['closeLightbox'],
    visitedSpotIds: new Set(), toggleVisited: noop as AppCtx['toggleVisited'],
    savedSpotIds: [], toggleSaved: noop as AppCtx['toggleSaved'], isSaved: (() => false) as AppCtx['isSaved'],
    toasts: [], dismissToast: noop as AppCtx['dismissToast'], showToast: noop as AppCtx['showToast'],
    rankingsFilter: null,
    navigateToRankings: noop as AppCtx['navigateToRankings'],
    clearRankingsFilter: noop as AppCtx['clearRankingsFilter'],
  };
}
