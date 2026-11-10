const PIONEER_KEY = 'ezetu_pioneer_spots';

export function loadPioneerSpotIds(): string[] {
  try {
    const raw = localStorage.getItem(PIONEER_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch { return []; }
}

export function addPioneerSpotId(spotId: string) {
  const ids = loadPioneerSpotIds();
  if (ids.includes(spotId)) return;
  try { localStorage.setItem(PIONEER_KEY, JSON.stringify([...ids, spotId])); } catch { /* ignore */ }
}
