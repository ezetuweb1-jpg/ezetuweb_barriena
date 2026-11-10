import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, ShieldAlert, BadgeCheck, Footprints, Bookmark, MapPin, Trophy, Navigation, Flag, Mountain, List, X, ChevronRight, CircleCheck as CheckCircle2 } from 'lucide-react';
import { ProtectedPhoto } from './ProtectedPhoto';
import { PlaceBreadcrumb } from './PlaceBreadcrumb';

try {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
} catch { /* leaflet icon fix — safe to ignore */ }
import type { Spot } from '@/lib/types';
import { useApp } from '@/lib/app-context';
import { useSpots, type SpotWithRelations } from '@/lib/data';
import { categoryColor, flagEmoji, basqueName, getLocalizedCountry } from '@/lib/utils';
import { SpotDrawer } from './SpotDrawer';
import { Ikurrina } from './Ikurrina';

const MAX_LIST_SPOTS = 12;
const INITIAL_CENTER: [number, number] = [46.5, 6.5];
const INITIAL_ZOOM = 5;

type PinMode = 'flags' | 'icons';
type MobileView = 'map' | 'list';

const CAT_COLORS: Record<string, string> = {
  nature: '#16a34a',
  village: '#92400e',
  city: '#64748b',
};

const CAT_ICON_SVG: Record<string, string> = {
  nature: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>',
  village: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  city: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v8h4"/><path d="M18 9h2a2 2 0 0 1 2 2v11h-4"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/></svg>',
};

function rankBadgeClass(rank: number): string {
  if (rank === 1) return 'bg-gradient-to-br from-amber-400 to-amber-600 text-white';
  if (rank === 2) return 'bg-gradient-to-br from-slate-300 to-slate-500 text-white';
  if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white';
  return 'bg-forest-100 dark:bg-slate2-800 text-forest-700 dark:text-sand-300';
}

function isValidCoord(lat: unknown, lng: unknown): boolean {
  return typeof lat === 'number' && typeof lng === 'number'
    && !Number.isNaN(lat) && !Number.isNaN(lng)
    && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

const IKURRINA_BODY = '<rect width="280" height="140" fill="#D52B1E"/><path d="M0,0 L14,0 L280,126 L280,140 L266,140 L0,14 Z" fill="#009B48"/><path d="M266,0 L280,0 L280,14 L14,140 L0,140 L0,126 Z" fill="#009B48"/><rect x="130" width="20" height="140" fill="#FFFFFF"/><rect y="60" width="280" height="20" fill="#FFFFFF"/>';

const ikurrinaSvg = (attrs: string) => `<svg viewBox="0 0 280 140" ${attrs} preserveAspectRatio="xMidYMid meet" shape-rendering="geometricPrecision">${IKURRINA_BODY}</svg>`;

function buildPinHtml(spot: Spot, mode: PinMode, size: number, isActive: boolean, lang: string): string {
  const color = CAT_COLORS[spot.category] ?? '#64748b';
  const ringSize = isActive ? 4 : 2;
  const innerSize = size - ringSize * 2 - 4;

  if (mode === 'icons') {
    const iconSvg = CAT_ICON_SVG[spot.category] ?? CAT_ICON_SVG.city;
    return `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:${ringSize}px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:center;
      ${isActive ? 'outline:2px solid ' + color + ';outline-offset:1px' : ''}
    ">${iconSvg.replace(`width="14"`, `width="${innerSize}"`).replace(`height="14"`, `height="${innerSize}"`)}</div>`;
  }

  // Flags mode
  const isEusSpot = lang === 'EUS' && spot.euskal_herria;
  const flagSvg = isEusSpot
    ? ikurrinaSvg('width="100%" height="100%" style="border-radius:2px;overflow:hidden;display:block"')
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:${innerSize * 0.7}px;line-height:1;overflow:hidden;border-radius:2px">${flagEmoji(spot.country_code)}</div>`;

  return `<div style="
    width:${size}px;height:${size}px;border-radius:50%;
    background:${color};border:${ringSize}px solid white;
    box-shadow:0 2px 6px rgba(0,0,0,.35);
    display:flex;align-items:center;justify-content:center;
    overflow:hidden;padding:3px;
    ${isActive ? 'outline:2px solid ' + color + ';outline-offset:1px' : ''}
  ">${flagSvg}</div>`;
}

// Pure dynamic numeric clustering (Airbnb / Google Maps pattern) — all zoom levels.
// Spots within 55 screen pixels fuse into numeric bubbles; isolated spots show as pins.
const PROXIMITY_THRESHOLD_PX = 55;

function weightedCentroid(coords: [number, number][]): [number, number] {
  if (coords.length === 0) return [0, 0];
  const lat = coords.reduce((a, c) => a + c[0], 0) / coords.length;
  const lng = coords.reduce((a, c) => a + c[1], 0) / coords.length;
  return [lat, lng];
}

// Airbnb-style proximity clustering: groups spots whose on-screen pixels are within thresholdPx.
interface ProximityCluster {
  spots: Spot[];
  centroid: [number, number];
  bounds: L.LatLngBounds;
}

function buildProximityClusters(
  spots: Spot[],
  mapInstance: L.Map,
  thresholdPx: number,
): { clusters: ProximityCluster[]; singletons: Spot[] } {
  const points = spots.map((s) => ({
    spot: s,
    px: mapInstance.latLngToContainerPoint(L.latLng(s.latitude, s.longitude)),
  }));

  const visited = new Set<number>();
  const clusters: ProximityCluster[] = [];
  const singletons: Spot[] = [];

  for (let i = 0; i < points.length; i++) {
    if (visited.has(i)) continue;
    visited.add(i);
    const group = [points[i]];

    // Greedily expand: add any unvisited point within thresholdPx of any group member
    let changed = true;
    while (changed) {
      changed = false;
      for (let j = 0; j < points.length; j++) {
        if (visited.has(j)) continue;
        const closeToGroup = group.some((g) =>
          Math.hypot(g.px.x - points[j].px.x, g.px.y - points[j].px.y) < thresholdPx,
        );
        if (closeToGroup) {
          visited.add(j);
          group.push(points[j]);
          changed = true;
        }
      }
    }

    if (group.length >= 2) {
      const coords = group.map((g) => [g.spot.latitude, g.spot.longitude] as [number, number]);
      clusters.push({
        spots: group.map((g) => g.spot),
        centroid: weightedCentroid(coords),
        bounds: L.latLngBounds(coords),
      });
    } else {
      singletons.push(group[0].spot);
    }
  }

  return { clusters, singletons };
}

function numericBubbleHtml(count: number): string {
  const size = count > 30 ? 50 : count >= 10 ? 44 : 38;
  const fontSize = count > 30 ? 18 : count >= 10 ? 16 : 14;
  return `<div style="background-color:#10b981;color:#0f172a;border:3px solid #0f172a;border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:${fontSize}px;box-shadow:0 6px 18px rgba(16,185,129,0.5);cursor:pointer;transition:transform 0.15s ease;user-select:none;">${count}</div>`;
}

export function MapView({ refreshKey }: { refreshKey?: number }) {
  const { t, lang, focusedSpotId, setFocusedSpotId, focusedAreaBounds, setFocusedAreaBounds, mapLayer, setMapLayer, visitedSpotIds, toggleVisited, savedSpotIds } = useApp();
  const { spots, loading } = useSpots(refreshKey);

  const savedIds = useMemo(() => new Set(savedSpotIds), [savedSpotIds]);

  const [selected, setSelected] = useState<SpotWithRelations | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'city' | 'village' | 'nature'>('all');
  const [boundsVersion, setBoundsVersion] = useState(0);
  const [pinMode, setPinMode] = useState<PinMode>('flags');
  const [mobileView, setMobileView] = useState<MobileView>('map');

  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const boundsVersionRef = useRef(0);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const numericClusterMarkersRef = useRef<L.Marker[]>([]);

  // Init Leaflet map — free OSM tiles, Western Europe center
  useEffect(() => {
    if (!mapRef.current || map.current) return;
    let m: L.Map;
    try {
      m = L.map(mapRef.current, {
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        minZoom: 2,
        worldCopyJump: true,
        scrollWheelZoom: true,
        zoomControl: false,
      });
    } catch (e) {
      console.error('[MapView] Failed to init Leaflet', e);
      return;
    }
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(m);
    map.current = m;
    markersGroupRef.current = L.layerGroup().addTo(m);

    requestAnimationFrame(() => {
      m.invalidateSize();
      boundsVersionRef.current++;
      setBoundsVersion(boundsVersionRef.current);
    });
    const resizeTimer = setTimeout(() => m.invalidateSize(), 250);

    const onMove = () => {
      boundsVersionRef.current++;
      setBoundsVersion(boundsVersionRef.current);
    };
    m.on('moveend', onMove);
    m.on('zoomend', onMove);
    m.on('click', () => { setSelected(null); setFocusedSpotId(null); });

    return () => {
      clearTimeout(resizeTimer);
      m.remove();
      map.current = null;
    };
  }, []);

  // Invalidate map size when mobile view switches back to map
  useEffect(() => {
    if (mobileView === 'map' && map.current) {
      const timer = setTimeout(() => map.current?.invalidateSize(), 100);
      return () => clearTimeout(timer);
    }
  }, [mobileView]);

  // All valid spots (fallback for empty bounds)
  const validSpots = useMemo(
    () => spots.filter((s) => isValidCoord(s.latitude, s.longitude)),
    [spots],
  );

  // Visited spots from global state (with pre-seeded fallback for demo)
  const visitedIds = useMemo(() => {
    if (visitedSpotIds.size > 0) return visitedSpotIds;
    return new Set([
      '11111111-1111-4111-8111-111111111101',
      '11111111-1111-4111-8111-111111111102',
      '11111111-1111-4111-8111-111111111103',
      '11111111-1111-4111-8111-111111111108',
    ]);
  }, [visitedSpotIds]);

  const visitedSpots = useMemo(
    () => validSpots.filter((s) => visitedIds.has(s.id)),
    [validSpots, visitedIds],
  );
  const savedSpots = useMemo(
    () => validSpots.filter((s) => savedIds.has(s.id)),
    [validSpots, savedIds],
  );

  // Bounds-based filtering + ranking — falls back to all spots when bounds empty
  const visibleRankedSpots = useMemo(() => {
    if (loading) return [];
    const byCat = (s: Spot) => categoryFilter === 'all' || s.category === categoryFilter;
    if (mapLayer === 'visited') {
      const ranked = validSpots.filter((s) => visitedIds.has(s.id) && byCat(s)).slice();
      ranked.sort((a, b) => b.bayesian_rating - a.bayesian_rating);
      return ranked;
    }
    if (mapLayer === 'saved') {
      const ranked = validSpots.filter((s) => savedIds.has(s.id) && byCat(s)).slice();
      ranked.sort((a, b) => b.bayesian_rating - a.bayesian_rating);
      return ranked;
    }
    if (!map.current) return validSpots.filter(byCat).slice();
    const b = map.current.getBounds();
    const inBounds = validSpots.filter((s) => byCat(s) && b.contains(L.latLng(s.latitude, s.longitude)));
    const ranked = (inBounds.length > 0 ? inBounds : validSpots.filter(byCat)).slice();
    ranked.sort((a, b) => b.bayesian_rating - a.bayesian_rating);
    return ranked;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validSpots, categoryFilter, loading, boundsVersion, mapLayer, visitedIds, savedIds]);

  const topSpots = useMemo(() => visibleRankedSpots.slice(0, MAX_LIST_SPOTS), [visibleRankedSpots]);
  const totalVisible = visibleRankedSpots.length;

  // Pure dynamic numeric clustering — runs at every zoom level (1–18).
  // Spots within 55px on screen fuse into numeric bubbles; loners show as category pins.
  useEffect(() => {
    const group = markersGroupRef.current;
    const m = map.current;
    if (!group) return;

    // Clean up old numeric cluster markers from previous render
    numericClusterMarkersRef.current.forEach((mk) => group.removeLayer(mk));
    numericClusterMarkersRef.current = [];

    // Compute proximity clusters using current screen pixel positions
    const { clusters: proxClusters, singletons } = m
      ? buildProximityClusters(visibleRankedSpots, m, PROXIMITY_THRESHOLD_PX)
      : { clusters: [], singletons: visibleRankedSpots };

    const singletonIds = new Set(singletons.map((s) => s.id));

    // Remove individual markers that are now hidden inside a cluster
    markersRef.current.forEach((mk, id) => {
      if (!singletonIds.has(id)) { group.removeLayer(mk); markersRef.current.delete(id); }
    });

    // Render numeric bubble clusters (Airbnb-style green circles)
    for (const cluster of proxClusters) {
      const count = cluster.spots.length;
      const bubbleSize = count > 30 ? 50 : count >= 10 ? 44 : 38;
      const icon = L.divIcon({
        className: '',
        html: numericBubbleHtml(count),
        iconSize: [bubbleSize, bubbleSize],
        iconAnchor: [bubbleSize / 2, bubbleSize / 2],
      });
      const mk = L.marker(cluster.centroid, { icon }).addTo(group);
      mk.on('click', () => {
        if (m) m.fitBounds(cluster.bounds.pad(0.35), { duration: 0.8 });
      });
      numericClusterMarkersRef.current.push(mk);
    }

    // Render individual pins for singletons (spots with no neighbours within 55px)
    singletons.forEach((s) => {
      const existing = markersRef.current.get(s.id);
      const isActive = hovered === s.id || focusedSpotId === s.id;
      const isVisited = visitedIds.has(s.id);
      const isSaved = savedIds.has(s.id);
      const size = isActive ? 40 : 30;
      const pinHtml = buildPinHtml(s, pinMode, size, isActive, lang);
      const visitedBadge = isVisited
        ? `<span style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;border-radius:50%;background:#16a34a;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.35);pointer-events:none;z-index:2"><svg viewBox=\"0 0 24 24\" width=\"9\" height=\"9\" fill=\"none\" stroke=\"white\" stroke-width=\"3.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\"/></svg></span>` : '';
      const savedBadge = isSaved
        ? `<span style="position:absolute;top:-5px;left:-5px;width:16px;height:16px;border-radius:50%;background:#ef4444;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.35);pointer-events:none;z-index:2"><svg viewBox=\"0 0 24 24\" width=\"8.5\" height=\"8.5\" fill=\"white\"><path d=\"M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z\"/></svg></span>` : '';
      const html = `<div style="position:relative">${pinHtml}${visitedBadge}${savedBadge}</div>`;
      const icon = L.divIcon({
        className: '',
        html: `<div class="ezetu-pin ${s.category} ${isActive ? 'active' : ''} ${isVisited ? 'visited' : ''}" style="width:${size}px;height:${size}px">${html}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
      if (existing) {
        existing.setIcon(icon);
      } else {
        const mk = L.marker([s.latitude, s.longitude], { icon }).addTo(group);
        const label = lang === 'EUS' && s.euskal_herria ? basqueName(s.id, s.name) : s.name;
        mk.bindPopup(`<div style="font-weight:600;font-size:13px">${label}<br/><span style="font-weight:400;font-size:11px;opacity:.7">${getLocalizedCountry(s, lang).name}</span></div>`);
        mk.on('click', () => { setSelected(s); setFocusedSpotId(s.id); });
        mk.on('mouseover', () => setHovered(s.id));
        mk.on('mouseout', () => setHovered((h) => (h === s.id ? null : h)));
        markersRef.current.set(s.id, mk);
      }
    });
  }, [visibleRankedSpots, hovered, focusedSpotId, visitedIds, savedIds, setFocusedSpotId, lang, pinMode, boundsVersion]);

  // Auto-center bounds when visited or saved layer is activated
  useEffect(() => {
    if (mapLayer === 'all' || !map.current) return;
    const targetSpots = mapLayer === 'visited' ? visitedSpots : savedSpots;
    if (targetSpots.length === 0) return;
    const bounds = L.latLngBounds(targetSpots.map((s) => [s.latitude, s.longitude] as [number, number]));
    map.current.fitBounds(bounds.pad(0.3), { duration: 0.6 });
  }, [mapLayer, visitedSpots, savedSpots]);

  // Pan to focused spot when triggered externally
  useEffect(() => {
    if (!focusedSpotId || !map.current) return;
    const s = spots.find((x) => x.id === focusedSpotId);
    if (!s) return;
    const currentZoom = map.current.getZoom();
    map.current.flyTo([s.latitude, s.longitude], Math.max(currentZoom, 8), { duration: 0.8 });
    setSelected(s);
    const timer = setTimeout(() => {
      const el = cardRefs.current.get(focusedSpotId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
    return () => clearTimeout(timer);
  }, [focusedSpotId, spots, setFocusedSpotId]);

  // Fly to broad area bounds when triggered externally (universal search)
  useEffect(() => {
    if (!focusedAreaBounds || !map.current) return;
    map.current.flyToBounds(focusedAreaBounds, { duration: 0.8, padding: [40, 40] });
    const timer = setTimeout(() => {
      boundsVersionRef.current++;
      setBoundsVersion(boundsVersionRef.current);
    }, 900);
    return () => clearTimeout(timer);
  }, [focusedAreaBounds, setFocusedAreaBounds]);

  useEffect(() => {
    leftPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selected?.id]);

  // Scroll card into view on map-hover
  useEffect(() => {
    if (!hovered) return;
    const el = cardRefs.current.get(hovered);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [hovered]);

  const onCardHover = useCallback((id: string | null) => setHovered(id), []);
  const onCardClick = useCallback((s: Spot) => {
    setSelected(s);
    setFocusedSpotId(s.id);
    if (map.current) {
      map.current.flyTo([s.latitude, s.longitude], Math.max(map.current.getZoom(), 8), { duration: 0.6 });
    }
    setMobileView('map');
  }, [setFocusedSpotId]);
  const backToList = useCallback(() => { setSelected(null); setFocusedSpotId(null); }, [setFocusedSpotId]);

  const isEus = (s: Spot) => lang === 'EUS' && s.euskal_herria;

  // Shared ranked-list renderer (used by both desktop sidebar and mobile list view)
  const renderRankedList = () => (
    <>
      {/* Sticky header with dynamic counter + filters */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 shadow-soft">
        <div className="px-4 pt-3 pb-3">
          <h2 className="font-display text-lg font-700 text-forest-800 dark:text-sand-100 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-terracotta-500" />
            {t('zoneRanking')}
          </h2>
          <p className="text-xs text-forest-700/70 dark:text-sand-300/70 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-forest-500" />
            {totalVisible > 0 ? (
              <>{totalVisible} <span className="lowercase">{t('spotsFound')}</span> · {t('ranking').toLowerCase()}</>
            ) : (
              <span className="text-forest-700/50 dark:text-sand-300/50">{t('panHint')}</span>
            )}
          </p>
          <div className="flex gap-1.5 mt-2.5">
            {(['all', 'city', 'village', 'nature'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-600 transition-colors ${
                  categoryFilter === c ? 'bg-forest-600 text-white' : 'bg-forest-50 dark:bg-slate2-900 border border-forest-100 dark:border-slate2-800 text-forest-700/70 dark:text-sand-300/70'
                }`}
              >
                {c === 'all' ? `🌍 ${t('all')}` : c === 'city' ? `🏙️ ${t('cities')}` : c === 'village' ? `🏘️ ${t('villages')}` : `🌲 ${t('nature')}`}
              </button>
            ))}
          </div>

          {/* 3-way Layer Switcher: All / Visited / Saved */}
          <div className="flex gap-0.5 mt-2 p-0.5 rounded-full bg-forest-50 dark:bg-slate2-800 w-fit">
            <button
              onClick={() => setMapLayer('all')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-600 transition-all whitespace-nowrap ${
                mapLayer === 'all'
                  ? 'bg-forest-600 text-white shadow-soft'
                  : 'text-forest-700/60 dark:text-sand-300/60 hover:text-forest-800 dark:hover:text-sand-100'
              }`}
            >
              🌍 {t('allLayer')}
            </button>
            <button
              onClick={() => setMapLayer('visited')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-600 transition-all whitespace-nowrap ${
                mapLayer === 'visited'
                  ? 'bg-terracotta-500 text-white shadow-soft'
                  : 'text-forest-700/60 dark:text-sand-300/60 hover:text-forest-800 dark:hover:text-sand-100'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              {t('visitedLayer')} ({visitedSpots.length})
            </button>
            <button
              onClick={() => setMapLayer('saved')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-600 transition-all whitespace-nowrap ${
                mapLayer === 'saved'
                  ? 'bg-amber-500 text-white shadow-soft'
                  : 'text-forest-700/60 dark:text-sand-300/60 hover:text-forest-800 dark:hover:text-sand-100'
              }`}
            >
              <Bookmark className="w-3 h-3" />
              {t('savedLayer')} ({savedSpots.length})
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable ranked list */}
      <div className="p-3 space-y-2.5">
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shimmer-bg animate-shimmer" />
        ))}

        {!loading && totalVisible === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <Navigation className="w-10 h-10 text-forest-300 dark:text-slate2-700 mb-3" />
            <p className="text-sm text-forest-700/60 dark:text-sand-300/60">{t('noSpotsVisible')}</p>
          </div>
        )}

        {!loading && topSpots.map((s, idx) => {
          const cc = categoryColor(s.category);
          const eus = isEus(s);
          const isActive = hovered === s.id || focusedSpotId === s.id;
          const isVisited = visitedIds.has(s.id);
          const isSaved = savedIds.has(s.id);
          const rank = idx + 1;
          return (
            <div
              key={s.id}
              ref={(el) => { cardRefs.current.set(s.id, el); }}
              onMouseEnter={() => onCardHover(s.id)}
              onMouseLeave={() => onCardHover(null)}
              onClick={() => onCardClick(s)}
              className={`group relative flex gap-3 p-3 rounded-2xl border cursor-pointer transition-all shadow-sm hover:shadow-md ${
                isActive ? 'border-forest-500 dark:border-forest-400 shadow-lift scale-[1.01]' : 'border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/95 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className={`absolute -top-2 -left-2 z-10 grid place-items-center w-7 h-7 rounded-full text-[11px] font-700 shadow-soft ring-2 ring-white dark:ring-slate-900 ${rankBadgeClass(rank)}`}>
                {rank === 1 ? '★' : `#${rank}`}
              </div>

              <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                {s.cover_photo && <ProtectedPhoto src={s.cover_photo.image_url} alt={s.name} loading="lazy" className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-600 ${cc.bg} ${cc.text} ring-1 ${cc.ring}`}>
                    {s.category === 'city' ? '🏙️' : s.category === 'village' ? '🏘️' : '🌲'}
                  </span>
                  {s.verified && <BadgeCheck className="w-3.5 h-3.5 text-forest-500 dark:text-forest-300" />}
                  {eus && <Ikurrina className="w-3.5 h-2" />}
                  {s.protected_zone && <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate mt-1">{eus ? basqueName(s.id, s.name) : s.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 truncate flex items-center gap-1">
                  <PlaceBreadcrumb spot={s} />
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                  <span className="flex items-center gap-0.5 text-slate-900 dark:text-white font-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {s.bayesian_rating.toFixed(1)}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">· {s.ratings_count} {t('bayesian').toLowerCase()}</span>
                  {isVisited && <span className="flex items-center gap-0.5 text-forest-600 dark:text-forest-300 font-600"><Footprints className="w-3 h-3" /></span>}
                  {isSaved && <span className="text-terracotta-500"><Bookmark className="w-3 h-3 fill-terracotta-500" /></span>}
                </div>
              </div>
            </div>
          );
        })}

        {!loading && totalVisible > MAX_LIST_SPOTS && (
          <p className="text-center text-[11px] text-forest-700/40 dark:text-sand-300/40 py-2">
            +{totalVisible - MAX_LIST_SPOTS} {t('spotsFound')} · {t('panHint').toLowerCase()}
          </p>
        )}
      </div>
    </>
  );

  // Shared map overlay controls (pin switcher + legend)
  const renderMapControls = () => (
    <>
      {/* Layer mode banner — exit button */}
      {mapLayer !== 'all' && (
        <div className={`absolute top-3 right-3 z-[500] flex items-center gap-2 px-3 py-1.5 rounded-full text-white shadow-lift ${mapLayer === 'visited' ? 'bg-terracotta-500' : 'bg-amber-500'}`}>
          {mapLayer === 'visited' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          <span className="text-[11px] font-600">{mapLayer === 'visited' ? t('visitedLayer') : t('savedLayer')} ({mapLayer === 'visited' ? visitedSpots.length : savedSpots.length})</span>
          <button
            onClick={() => setMapLayer('all')}
            className="ml-1 grid place-items-center w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Pin style switcher — floating top-center */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] max-w-[calc(100%-2rem)]">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-soft">
          <span className="text-[11px] font-600 text-forest-700/60 dark:text-sand-300/60 hidden sm:inline px-1">{t('pinStyle')}:</span>
          <div className="flex gap-0.5 rounded-full bg-forest-50 dark:bg-slate2-800 p-0.5">
            <button
              onClick={() => setPinMode('flags')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-600 transition-all whitespace-nowrap ${
                pinMode === 'flags'
                  ? 'bg-forest-600 text-white shadow-soft'
                  : 'text-forest-700/60 dark:text-sand-300/60 hover:text-forest-800 dark:hover:text-sand-100'
              }`}
            >
              <Flag className="w-3 h-3" />
              {t('flagsMode')}
            </button>
            <button
              onClick={() => setPinMode('icons')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-600 transition-all whitespace-nowrap ${
                pinMode === 'icons'
                  ? 'bg-forest-600 text-white shadow-soft'
                  : 'text-forest-700/60 dark:text-sand-300/60 hover:text-forest-800 dark:hover:text-sand-100'
              }`}
            >
              <Mountain className="w-3 h-3" />
              {t('iconsMode')}
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[500] p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-soft text-xs space-y-1.5">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: CAT_COLORS.nature }} /> {t('nature')}</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: CAT_COLORS.village }} /> {t('villages')}</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: CAT_COLORS.city }} /> {t('cities')}</div>
      </div>
    </>
  );

  // Mobile bottom sheet for spot preview
  const renderMobileBottomSheet = () => {
    if (!selected || mobileView !== 'map') return null;
    const s = selected;
    const eus = isEus(s);
    const cc = categoryColor(s.category);
    return (
      <div
        className="md:hidden absolute bottom-0 left-0 right-0 z-[1200] animate-slide-up"
        style={{ height: '40vh' }}
      >
        <div className="h-full bg-white dark:bg-slate-900 rounded-t-2xl shadow-lift border-t border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          {/* Drag handle */}
          <div className="flex justify-center pt-2 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
          {/* Close button */}
          <button
            onClick={() => { setSelected(null); setFocusedSpotId(null); }}
            className="absolute top-2 right-3 w-7 h-7 grid place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="flex gap-3 items-start">
              <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                {s.cover_photo && <ProtectedPhoto src={s.cover_photo.image_url} alt={s.name} className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-600 ${cc.bg} ${cc.text} ring-1 ${cc.ring}`}>
                    {s.category === 'city' ? '🏙️' : s.category === 'village' ? '🏘️' : '🌲'}
                  </span>
                  {s.verified && <BadgeCheck className="w-3.5 h-3.5 text-forest-500 dark:text-forest-300" />}
                  {eus && <Ikurrina className="w-4 h-2.5" />}
                  {s.protected_zone && <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <h3 className="font-700 text-sm text-forest-800 dark:text-sand-100 truncate mt-1">{eus ? basqueName(s.id, s.name) : s.name}</h3>
                <p className="text-xs text-forest-700/60 dark:text-sand-300/60 truncate flex items-center gap-1 mt-0.5">
                  <PlaceBreadcrumb spot={s} />
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                  <span className="flex items-center gap-0.5 text-slate-900 dark:text-white font-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {s.bayesian_rating.toFixed(1)}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">· {s.ratings_count} {t('bayesian').toLowerCase()}</span>
                </div>
              </div>
            </div>
            {/* Full details button */}
            <button
              onClick={() => { setMobileView('list'); }}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-forest-600 text-white text-sm font-600 hover:bg-forest-700 transition-colors shadow-soft"
            >
              {t('fullDetails')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ===== Left panel: ranked list OR spot detail ===== */}
      {/* Desktop: always visible sidebar. Mobile: only when mobileView === 'list'. */}
      <div
        ref={leftPanelRef}
        className={`w-full md:w-[380px] lg:w-[440px] h-full shrink-0 overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 z-10 ${
          mobileView === 'list' ? 'block' : 'hidden md:block'
        }`}
      >
        {selected ? (
          <div className="relative">
            {/* Mobile back-to-map button */}
            <button
              onClick={backToList}
              className="md:hidden sticky top-2 left-2 z-10 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-600 text-forest-700 dark:text-sand-200 shadow-soft"
            >
              <X className="w-3.5 h-3.5" />
              {t('close')}
            </button>
            <SpotDrawer
              spot={selected}
              allSpots={spots}
              inline
              onClose={backToList}
              onVisitedChange={() => {}}
              onWishlistChange={() => {}}
              key={selected.id}
            />
          </div>
        ) : renderRankedList()}
      </div>

      {/* ===== Right panel: map ===== */}
      {/* Desktop: flex-1 side panel. Mobile: full screen when mobileView === 'map'. */}
      <div
        className={`flex-1 h-full w-full relative min-h-[400px] ${
          mobileView === 'map' ? 'block' : 'hidden md:block'
        }`}
      >
        <div ref={mapRef} className="absolute inset-0" style={{ height: '100%', width: '100%', minHeight: '100%' }} />
        {renderMapControls()}
        {renderMobileBottomSheet()}
      </div>

      {/* Floating mobile toggle — bottom center */}
      <button
        onClick={() => setMobileView((v) => (v === 'map' ? 'list' : 'map'))}
        className="md:hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-[1500] flex items-center gap-2 px-4 py-2.5 rounded-full bg-forest-600 text-white text-sm font-700 shadow-lift active:scale-95 transition-transform"
      >
        {mobileView === 'map' ? (
          <>
            <List className="w-4 h-4" />
            {t('viewList')} ({totalVisible})
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            {t('viewMap')}
          </>
        )}
      </button>
    </div>
  );
}
