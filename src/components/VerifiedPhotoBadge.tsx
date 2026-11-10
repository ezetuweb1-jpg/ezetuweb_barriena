import { useEffect, useRef, useState } from 'react';
import { Leaf } from 'lucide-react';
import { useApp } from '@/lib/app-context';

const TOOLTIP_TEXT = {
  eu: '🌿 Argazki erreal egiaztatua: Benetako lekuaren kaptura, Adimen Artifizialik gabe.',
  es: '🌿 Foto real verificada: Captura auténtica del lugar, libre de IA generativa.',
  en: '🌿 Verified Real Photo: Authentic camera shot, strictly AI-free.',
};

const TAP_TOOLTIP_MS = 2800;

const DEFAULT_BUTTON_CLASS = 'w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/45 backdrop-blur-md border border-white/15 flex items-center justify-center text-emerald-400 shadow-sm transition-transform active:scale-95';

export function VerifiedPhotoBadge({ buttonClassName = DEFAULT_BUTTON_CLASS }: { buttonClassName?: string }) {
  const { lang } = useApp();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tapped, setTapped] = useState(false);

  const text = lang === 'EUS' ? TOOLTIP_TEXT.eu : lang === 'ES' ? TOOLTIP_TEXT.es : TOOLTIP_TEXT.en;
  const visible = hovered || focused || tapped;

  useEffect(() => {
    if (!tapped) return;
    const timer = setTimeout(() => setTapped(false), TAP_TOOLTIP_MS);
    const onOutside = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setTapped(false);
    };
    document.addEventListener('pointerdown', onOutside);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', onOutside);
    };
  }, [tapped]);

  const onTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTapped((v) => !v);
  };

  return (
    <span
      ref={wrapRef}
      className="relative inline-flex"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHovered(true); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setHovered(false); }}
    >
      <button
        type="button"
        onClick={onTap}
        onFocus={(e) => setFocused(e.currentTarget.matches(':focus-visible'))}
        onBlur={() => setFocused(false)}
        aria-label={text}
        className={buttonClassName}
      >
        <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute top-full left-0 mt-2 z-20 w-max max-w-[15rem] bg-slate-900/95 text-white text-xs leading-snug px-2.5 py-1.5 rounded-lg shadow-xl backdrop-blur-md border border-slate-700 transition-all duration-200 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
        }`}
      >
        {text}
      </span>
    </span>
  );
}
