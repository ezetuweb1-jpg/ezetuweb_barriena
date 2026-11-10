import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type MouseEvent as ReactMouseEvent, type KeyboardEvent } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import type { LangCode, Spot } from '@/lib/types';
import { loadGeoAtlas, territoryIdsForSpot, type GeoAtlas } from '@/lib/geo-atlas';
import {
  IDENTITY_VIEWPORT, panBy, zoomAt, type Viewport, type ViewBox,
} from '@/lib/map-viewport';
import { countryName, COUNTRY_NAMES } from '@/lib/utils';
import { Ikurrina } from './Ikurrina';
import { Plus, Minus, RotateCcw } from 'lucide-react';

interface Selection {
  kind: 'country' | 'entity';
  key: string;
  title: string;
}

interface Props {
  spots: Spot[];
  lang: string;
}

const VIEW: ViewBox = { width: 960, height: 480 };
const TAP_TOLERANCE = 4;
const EUSKAL_HERRIA = COUNTRY_NAMES.eu.EH;

interface PointerState {
  points: Map<number, { x: number; y: number }>;
  pinchDistance: number;
  moved: boolean;
}

export function WorldMap({ spots, lang }: Props) {
  const isEus = lang === 'EUS';
  const [atlas, setAtlas] = useState<GeoAtlas | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [viewport, setViewport] = useState<Viewport>(IDENTITY_VIEWPORT);
  const [animate, setAnimate] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const pointerRef = useRef<PointerState>({ points: new Map(), pinchDistance: 0, moved: false });

  useEffect(() => {
    let cancelled = false;
    loadGeoAtlas()
      .then((loaded) => { if (!cancelled) setAtlas(loaded); })
      .catch(() => { if (!cancelled) setLoadFailed(true); });
    return () => { cancelled = true; };
  }, []);

  const visitedIsos = useMemo(() => new Set(spots.map((s) => s.country_code)), [spots]);
  const entityVisited = useMemo(() => spots.some((s) => territoryIdsForSpot(s).length > 0), [spots]);

  const projection = useMemo(() => {
    if (!atlas) return null;
    return geoNaturalEarth1().fitExtent([[8, 8], [VIEW.width - 8, VIEW.height - 8]], atlas.countries);
  }, [atlas]);

  useEffect(() => {
    if (!selection) return;
    const timer = setTimeout(() => setSelection(null), 3000);
    return () => clearTimeout(timer);
  }, [selection]);

  if (loadFailed) {
    return (
      <p className="py-16 text-center text-sm text-terracotta-600 dark:text-terracotta-300">
        {isEus ? 'Ezin izan da mapa kargatu.' : 'No se pudo cargar el mapa.'}
      </p>
    );
  }
  if (!atlas || !projection) {
    return (
      <div className="grid place-items-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-forest-300 border-t-forest-600 animate-spin" />
      </div>
    );
  }

  const toView = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VIEW.width,
      y: ((clientY - rect.top) / rect.height) * VIEW.height,
    };
  };

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    const state = pointerRef.current;
    e.currentTarget.setPointerCapture(e.pointerId);
    state.points.set(e.pointerId, toView(e.clientX, e.clientY));
    if (state.points.size === 1) state.moved = false;
    if (state.points.size === 2) {
      const [a, b] = [...state.points.values()];
      state.pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
      state.moved = true;
    }
    setAnimate(false);
  };

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const state = pointerRef.current;
    const prev = state.points.get(e.pointerId);
    if (!prev) return;
    const cur = toView(e.clientX, e.clientY);
    state.points.set(e.pointerId, cur);
    if (state.points.size === 1) {
      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      if (Math.abs(dx) + Math.abs(dy) > TAP_TOLERANCE) {
        state.moved = true;
        setSelection(null);
      }
      setViewport((v) => panBy(v, dx, dy, VIEW));
    } else if (state.points.size === 2) {
      const [a, b] = [...state.points.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const ratio = state.pinchDistance > 0 ? distance / state.pinchDistance : 1;
      state.pinchDistance = distance;
      setViewport((v) => zoomAt(v, ratio, (a.x + b.x) / 2, (a.y + b.y) / 2, VIEW));
    }
  };

  const onPointerEnd = (e: ReactPointerEvent<SVGSVGElement>) => {
    pointerRef.current.points.delete(e.pointerId);
  };

  const onDoubleClick = (e: ReactMouseEvent<SVGSVGElement>) => {
    const point = toView(e.clientX, e.clientY);
    setAnimate(true);
    setViewport((v) => zoomAt(v, 2, point.x, point.y, VIEW));
  };

  const zoomBy = (factor: number) => {
    setAnimate(true);
    setViewport((v) => zoomAt(v, factor, VIEW.width / 2, VIEW.height / 2, VIEW));
  };
  const resetView = () => {
    setAnimate(true);
    setViewport(IDENTITY_VIEWPORT);
  };

  const pathFor = geoPath(projection);
  const selectionVisited = selection?.kind === 'entity'
    ? entityVisited
    : selection ? visitedIsos.has(selection.key) : false;

  const choose = (selected: Selection) => {
    if (pointerRef.current.moved) return;
    setSelection({ ...selected });
  };

  const interactive = (selected: Selection) => ({
    onClick: () => choose(selected),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') choose(selected);
    },
    tabIndex: 0,
    role: 'button' as const,
    'aria-label': selected.title,
  });

  const controlClass = 'w-9 h-9 grid place-items-center rounded-lg bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100 shadow-soft hover:bg-white dark:hover:bg-slate-700 transition-colors';

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-950 border border-forest-100 dark:border-slate-800">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="world-map w-full h-auto select-none touch-none cursor-grab active:cursor-grabbing"
        role="img"
        aria-label="Mapa del mundo"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onPointerLeave={onPointerEnd}
        onDoubleClick={onDoubleClick}
      >
        <g
          className={animate ? 'passport-zoom-anim' : undefined}
          style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.k})`, transformOrigin: '0 0' }}
        >
          {atlas.countries.features.map((f, i) => {
            const iso = f.properties.iso ?? `c${i}`;
            const visited = visitedIsos.has(iso);
            const name = countryName(iso, lang as LangCode, f.properties.name);
            return (
              <path
                key={`c-${iso}-${i}`}
                d={pathFor(f) ?? ''}
                className={`passport-area ${visited ? 'passport-visited' : ''}`}
                {...interactive({ kind: 'country', key: iso, title: name })}
              >
                <title>{name}</title>
              </path>
            );
          })}

          {isEus && atlas.euskalHerria.features.map((f, i) => (
            <path
              key={`eh-${i}`}
              d={pathFor(f) ?? ''}
              className={`passport-entity ${entityVisited ? 'passport-visited' : ''}`}
              {...interactive({ kind: 'entity', key: 'euskal-herria', title: EUSKAL_HERRIA })}
            >
              <title>{EUSKAL_HERRIA}</title>
            </path>
          ))}
        </g>
      </svg>

      {selection && (
        <div
          key={`${selection.kind}-${selection.key}`}
          className="pointer-events-none absolute left-1/2 top-4 z-30 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-4 py-2 text-xs font-medium text-white shadow-2xl backdrop-blur-md animate-popIn sm:text-sm"
        >
          {selection.kind === 'entity'
            ? <Ikurrina className="w-4 h-2.5 shrink-0" />
            : null}
          <span className="truncate">{selection.kind === 'entity' ? selection.title : `📍 ${selection.title}`}</span>
          {selectionVisited && (
            <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
              {isEus ? '✓ Esploratua' : '✓ Conquistado'}
            </span>
          )}
        </div>
      )}

      <div className="absolute right-3 bottom-3 flex flex-col gap-1.5">
        <button type="button" aria-label="Zoom in" className={controlClass} onClick={() => zoomBy(1.5)}><Plus className="w-4 h-4" /></button>
        <button type="button" aria-label="Zoom out" className={controlClass} onClick={() => zoomBy(1 / 1.5)}><Minus className="w-4 h-4" /></button>
        <button type="button" aria-label="Reset" className={controlClass} onClick={resetView}><RotateCcw className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
