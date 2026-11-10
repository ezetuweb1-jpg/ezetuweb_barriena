import { useEffect, useRef, useState } from 'react';
import { X, Search, Camera, Upload, MapPin, Check, MapPinPlus, Star } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { searchSpots, deviceId } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { flagEmoji, basqueName, getLocalizedCountry } from '@/lib/utils';
import { Ikurrina } from './Ikurrina';
import type { Spot } from '@/lib/types';

export function UploadModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => void }) {
  const { t, lang, setAddPlaceWithPhotoOpen } = useApp();
  const [mode, setMode] = useState<'menu' | 'photo'>('menu');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Spot[]>([]);
  const [selected, setSelected] = useState<Spot | null>(null);
  const [searching, setSearching] = useState(false);
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pledge, setPledge] = useState(false);
  const [exifData, setExifData] = useState<{ camera_model?: string; lens?: string; aperture?: string; shutter_speed?: string; iso?: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try { setResults(await searchSpots(query)); }
      catch { setResults([]); }
      setSearching(false);
    }, 250);
  }, [query]);

  const readExif = (file: File) => {
    // Basic EXIF extraction from JPEG via DataView
    const reader = new FileReader();
    reader.onload = () => {
      const buf = reader.result as ArrayBuffer;
      const view = new DataView(buf);
      if (view.getUint16(0) !== 0xFFD8) { setExifData(null); return; }
      let offset = 2;
      const exif: { camera_model?: string; lens?: string; aperture?: string; shutter_speed?: string; iso?: number } = {};
      while (offset < view.byteLength) {
        if (view.getUint16(offset) !== 0xFFE1) { offset += 2; continue; }
        const tiffOffset = offset + 8;
        const bigEndian = view.getUint16(tiffOffset) === 0x4D4D;
        const read16 = (o: number) => bigEndian ? view.getUint16(o) : view.getUint16(o, true);
        const read32 = (o: number) => bigEndian ? view.getUint32(o) : view.getUint32(o, true);
        const ifd0 = tiffOffset + 6;
        const numEntries = read16(ifd0);
        for (let i = 0; i < numEntries; i++) {
          const entry = ifd0 + 2 + i * 12;
          const tag = read16(entry);
          const type = read16(entry + 2);
          const count = read32(entry + 4);
          const valOffset = entry + 8;
          if (tag === 0x010F && type === 2) {
            const s = readString(view, valOffset, count, bigEndian);
            if (s) exif.camera_model = s;
          }
          if (tag === 0x0110 && type === 2) {
            const s = readString(view, valOffset, count, bigEndian);
            if (s) exif.camera_model = exif.camera_model ? `${exif.camera_model} ${s}` : s;
          }
        }
        break;
      }
      setExifData(Object.keys(exif).length > 0 ? exif : null);
    };
    reader.readAsArrayBuffer(file.slice(0, 65536));
  };

  const readString = (view: DataView, offset: number, count: number, bigEndian: boolean): string => {
    let str = '';
    for (let i = 0; i < count - 1; i++) {
      const c = bigEndian ? view.getUint8(offset + i) : view.getUint8(offset + i);
      if (c === 0) break;
      str += String.fromCharCode(c);
    }
    return str;
  };

  const onFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Only image files'); return; }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
    readExif(file);
  };

  const submit = async () => {
    if (!selected || !imageUrl || !pledge) return;
    setSubmitting(true);
    setError(null);
    try {
      const img = new Image();
      img.src = imageUrl;
      await new Promise((res) => { img.onload = res; img.onerror = res; });
      const w = img.naturalWidth || 1200;
      const h = img.naturalHeight || 800;
      const { error: insErr } = await supabase.from('photos').insert({
        spot_id: selected.id,
        image_url: imageUrl,
        width: w,
        height: h,
        author: author || 'Viajero',
        device_id: deviceId,
        season: 'summer',
        likes: 0,
        trend_score: 50,
        is_hero: false,
        camera_model: exifData?.camera_model ?? null,
        lens: exifData?.lens ?? null,
        aperture: exifData?.aperture ?? null,
        shutter_speed: exifData?.shutter_speed ?? null,
        iso: exifData?.iso ?? null,
      });
      if (insErr) throw insErr;
      setDone(true);
      setTimeout(() => { onUploaded(); onClose(); }, 1200);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-sand-50 dark:bg-slate2-900 shadow-lift animate-popIn">
        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-forest-100 dark:border-slate2-800 bg-sand-50 dark:bg-slate2-900 z-10">
          <h2 className="font-display text-xl font-700 text-forest-800 dark:text-sand-100 flex items-center gap-2">
            <Camera className="w-5 h-5 text-terracotta-500" />
            {t('uploadPhotoTitle')}
          </h2>
          <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-full hover:bg-forest-100 dark:hover:bg-slate2-800 text-forest-700 dark:text-sand-300"><X className="w-5 h-5" /></button>
        </div>

        {done ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-forest-100 dark:bg-forest-900 grid place-items-center mx-auto mb-3">
              <Check className="w-7 h-7 text-forest-600 dark:text-forest-300" />
            </div>
            <p className="font-600 text-forest-800 dark:text-sand-100">{t('save')} ✓</p>
          </div>
        ) : mode === 'menu' ? (
          <div className="p-5 space-y-3">
            {/* Sub-option 1.1: Existing place */}
            <button
              onClick={() => setMode('photo')}
              className="w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-850 hover:border-forest-400 dark:hover:border-forest-500 transition-all hover:shadow-soft text-left group"
            >
              <div className="grid place-items-center w-12 h-12 rounded-xl bg-forest-50 dark:bg-slate2-800 shrink-0 group-hover:scale-105 transition-transform">
                <MapPin className="w-6 h-6 text-forest-600 dark:text-forest-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-700 text-forest-800 dark:text-sand-100">{t('uploadExistingCard')}</div>
                <div className="text-xs text-forest-700/50 dark:text-sand-300/50 mt-0.5">{t('searchPlace')}</div>
              </div>
            </button>
            {/* Sub-option 1.2: New place + photo */}
            <button
              onClick={() => { onClose(); setAddPlaceWithPhotoOpen(true); }}
              className="w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 border-terracotta-200 dark:border-terracotta-800/40 bg-terracotta-50 dark:bg-terracotta-900/20 hover:border-terracotta-400 dark:hover:border-terracotta-600 transition-all hover:shadow-soft text-left group"
            >
              <div className="grid place-items-center w-12 h-12 rounded-xl bg-terracotta-100 dark:bg-terracotta-900/30 shrink-0 group-hover:scale-105 transition-transform">
                <MapPinPlus className="w-6 h-6 text-terracotta-600 dark:text-terracotta-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-700 text-terracotta-700 dark:text-terracotta-300">{t('uploadNewPlaceCard')}</div>
                <div className="text-xs text-terracotta-600/50 dark:text-terracotta-300/50 mt-0.5">{t('searchWorldwide')}</div>
              </div>
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Place search — existing spots only */}
            <div>
              <label className="text-xs font-600 text-forest-700/70 dark:text-sand-300/70 uppercase tracking-wider">{t('searchPlace')}</label>
              {selected ? (
                <div className="mt-2 flex items-center justify-between p-3 rounded-2xl bg-forest-50 dark:bg-slate2-850 border border-forest-200 dark:border-slate2-700">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-forest-600 dark:text-forest-300 shrink-0" />
                    <span className="text-sm font-600 text-forest-800 dark:text-sand-100 truncate">{lang === 'EUS' && selected.euskal_herria ? basqueName(selected.id, selected.name) : selected.name}</span>
                    {lang === 'EUS' && selected.euskal_herria ? <Ikurrina className="w-4 h-2.5" /> : <span className="text-base">{flagEmoji(selected.country_code)}</span>}
                  </div>
                  <button onClick={() => setSelected(null)} className="text-xs text-terracotta-600 dark:text-terracotta-300 font-600 shrink-0">{t('cancel')}</button>
                </div>
              ) : (
                <div className="relative mt-2">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-850 focus-within:border-forest-400 transition-colors">
                    <Search className="w-4 h-4 text-forest-700/50 dark:text-sand-300/50" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t('searchPlace')}
                      className="flex-1 bg-transparent text-sm text-forest-800 dark:text-sand-100 outline-none placeholder:text-forest-700/40 dark:placeholder:text-sand-300/40"
                    />
                    {searching && <div className="w-4 h-4 rounded-full border-2 border-forest-200 border-t-forest-500 animate-spin" />}
                  </div>
                  {results.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-2xl border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-900 shadow-lift overflow-hidden max-h-60 overflow-y-auto">
                      {results.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => { setSelected(s); setQuery(''); setResults([]); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-forest-50 dark:hover:bg-slate2-800 transition-colors"
                        >
                          <span className="text-base">{lang === 'EUS' && s.euskal_herria ? '🟢' : flagEmoji(s.country_code)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-600 text-forest-800 dark:text-sand-100 truncate">{lang === 'EUS' && s.euskal_herria ? basqueName(s.id, s.name) : s.name}</div>
                            <div className="text-[11px] text-forest-700/50 dark:text-sand-300/50 truncate">{getLocalizedCountry(s, lang).name} · {s.category}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {query && !searching && results.length === 0 && (
                    <p className="mt-2 text-xs text-forest-700/50 dark:text-sand-300/50">{t('noResults')}</p>
                  )}
                </div>
              )}
            </div>

            {/* Photo upload with drag & drop */}
            <div>
              <label className="text-xs font-600 text-forest-700/70 dark:text-sand-300/70 uppercase tracking-wider">{t('uploadPhoto')}</label>
              <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
              {imageUrl ? (
                <div className="mt-2 relative rounded-2xl overflow-hidden border border-forest-100 dark:border-slate2-800">
                  <img src={imageUrl} alt="preview" className="w-full max-h-64 object-cover" />
                  <button onClick={() => { setImageUrl(''); setExifData(null); }} className="absolute top-2 right-2 grid place-items-center w-8 h-8 rounded-full bg-black/60 text-white"><X className="w-4 h-4" /></button>
                  {exifData && (
                    <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5">
                      {exifData.camera_model && (
                        <span className="px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] font-600 flex items-center gap-1 backdrop-blur-sm">
                          <Camera className="w-3 h-3" /> {exifData.camera_model}
                        </span>
                      )}
                      {exifData.aperture && (
                        <span className="px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] font-600 backdrop-blur-sm">f/{exifData.aperture}</span>
                      )}
                      {exifData.iso != null && (
                        <span className="px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] font-600 backdrop-blur-sm">ISO {exifData.iso}</span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  ref={dragRef}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
                  onClick={() => fileInput.current?.click()}
                  className={`mt-2 w-full py-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center gap-2 ${
                    dragOver
                      ? 'border-terracotta-400 bg-terracotta-50 dark:bg-terracotta-900/20 scale-[1.01]'
                      : 'border-forest-200 dark:border-slate2-700 hover:border-forest-400 dark:hover:border-forest-500'
                  } text-forest-700/60 dark:text-sand-300/60`}
                >
                  <Upload className="w-7 h-7" />
                  <span className="text-sm font-600">{t('upload')}</span>
                  <span className="text-[11px] text-forest-700/40 dark:text-sand-300/40">Drag & drop o clic para subir</span>
                </div>
              )}
            </div>

            {/* Author */}
            <div>
              <label className="text-xs font-600 text-forest-700/70 dark:text-sand-300/70 uppercase tracking-wider">{t('authorName')}</label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value.slice(0, 40))}
                className="mt-2 w-full px-3 py-2 rounded-xl border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-850 text-sm text-forest-800 dark:text-sand-100 outline-none focus:border-forest-400"
              />
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            {/* Anti-AI pledge */}
            <label className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-colors ${pledge ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-850 hover:border-forest-300'}`}>
              <input
                type="checkbox"
                checked={pledge}
                onChange={(e) => setPledge(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded accent-emerald-600 shrink-0"
              />
              <span className="text-xs font-500 text-forest-800 dark:text-sand-100 leading-snug">
                ✓ {t('antiAiPledge')}
              </span>
            </label>

            <div className="flex gap-2">
              <button onClick={() => { setMode('menu'); setSelected(null); setImageUrl(''); setExifData(null); setPledge(false); }} className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-forest-100 dark:border-slate2-800 text-forest-700 dark:text-sand-300 font-600 text-sm hover:bg-forest-50 dark:hover:bg-slate2-850 transition-colors">
                {t('back')}
              </button>
              <button
                onClick={submit}
                disabled={!selected || !imageUrl || !pledge || submitting}
                className="flex-1 py-2.5 rounded-xl bg-terracotta-500 text-white font-600 text-sm disabled:opacity-40 hover:bg-terracotta-600 transition-colors"
              >
                {submitting ? '...' : t('save')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
