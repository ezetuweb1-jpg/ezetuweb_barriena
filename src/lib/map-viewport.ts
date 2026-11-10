export interface Viewport {
  k: number;
  x: number;
  y: number;
}

export interface ViewBox {
  width: number;
  height: number;
}

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 12;
export const IDENTITY_VIEWPORT: Viewport = { k: 1, x: 0, y: 0 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function clampViewport(v: Viewport, view: ViewBox): Viewport {
  const k = clamp(v.k, MIN_ZOOM, MAX_ZOOM);
  return {
    k,
    x: clamp(v.x, view.width - view.width * k, 0),
    y: clamp(v.y, view.height - view.height * k, 0),
  };
}

export function zoomAt(v: Viewport, factor: number, px: number, py: number, view: ViewBox): Viewport {
  const k = clamp(v.k * factor, MIN_ZOOM, MAX_ZOOM);
  const ratio = k / v.k;
  return clampViewport({ k, x: px - (px - v.x) * ratio, y: py - (py - v.y) * ratio }, view);
}

export function panBy(v: Viewport, dx: number, dy: number, view: ViewBox): Viewport {
  return clampViewport({ k: v.k, x: v.x + dx, y: v.y + dy }, view);
}

export function viewportForBox(box: Box, view: ViewBox): Viewport {
  const bw = Math.max(1, box.x1 - box.x0);
  const bh = Math.max(1, box.y1 - box.y0);
  const k = clamp(Math.min(view.width / bw, view.height / bh) * 0.95, MIN_ZOOM, MAX_ZOOM);
  const cx = (box.x0 + box.x1) / 2;
  const cy = (box.y0 + box.y1) / 2;
  return clampViewport({ k, x: view.width / 2 - k * cx, y: view.height / 2 - k * cy }, view);
}
