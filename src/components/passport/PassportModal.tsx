import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface PassportModalProps {
  title: string;
  onClose: () => void;
  closeLabel: string;
  children: ReactNode;
}

export function PassportModal({ title, onClose, closeLabel, children }: PassportModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title} className="relative w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-slate2-900 border border-forest-100 dark:border-slate2-800 shadow-lift animate-popIn overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-forest-100 dark:border-slate2-800">
          <h2 className="font-display text-xl font-700 text-forest-800 dark:text-sand-100">{title}</h2>
          <button
            onClick={onClose}
            aria-label={closeLabel}
            className="grid place-items-center w-8 h-8 rounded-full text-forest-700 dark:text-sand-200 hover:bg-forest-100 dark:hover:bg-slate2-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
