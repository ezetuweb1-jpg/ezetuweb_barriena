import { useState } from 'react';
import { X, Flag, Check } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { submitReport, submitTipReport } from '@/lib/data';
import type { ReportReason, TipReportReason, LangCode } from '@/lib/types';

type Lang2 = 'es' | 'eu' | 'en';
type ReportTargetType = 'photo' | 'tip';

interface PhotoReasonEntry {
  key: ReportReason;
  icon: string;
  labelKey: 'ai' | 'fake' | 'location' | 'people' | 'stolen';
}

interface TipReasonEntry {
  key: TipReportReason;
  icon: string;
  labelKey: 'spam' | 'abuse' | 'falseInfo';
}

const PHOTO_REASONS: PhotoReasonEntry[] = [
  { key: 'ai_generated', icon: '🤖', labelKey: 'ai' },
  { key: 'fake_place', icon: '🗺️', labelKey: 'fake' },
  { key: 'wrong_place', icon: '📍', labelKey: 'location' },
  { key: 'people_selfie', icon: '👤', labelKey: 'people' },
  { key: 'plagiarism', icon: '📸', labelKey: 'stolen' },
];

const TIP_REASONS: TipReasonEntry[] = [
  { key: 'spam', icon: '📢', labelKey: 'spam' },
  { key: 'abuse', icon: '⚠️', labelKey: 'abuse' },
  { key: 'false_info', icon: '❗', labelKey: 'falseInfo' },
];

export const REPORT_I18N = {
  photo: {
    title: {
      es: 'Denunciar fotografía',
      eu: 'Argazkia salatu',
      en: 'Report photo',
    },
    subtitle: {
      es: 'Ayúdanos a mantener Ezetu libre de imágenes falsas o trampas.',
      eu: 'Lagundu Ezetu irudi faltsurik eta tranparik gabe mantentzen.',
      en: 'Help us keep Ezetu free of fake images or spam.',
    },
    reasons: {
      ai: {
        es: 'Imagen generada con IA',
        eu: 'Adimen Artifizialez sortutako irudia',
        en: 'AI-generated image',
      },
      fake: {
        es: 'Lugar inventado o ficticio',
        eu: 'Asmatutako leku ez-erreala',
        en: 'Non-existent place',
      },
      location: {
        es: 'No se corresponde con este lugar',
        eu: 'Ez dator bat leku honekin',
        en: 'Wrong location tagged',
      },
      people: {
        es: 'Aparecen personas o selfies',
        eu: 'Pertsonak edo selfie-ak agertzen dira',
        en: 'Contains people or selfies',
      },
      stolen: {
        es: 'Plagio o foto robada de internet',
        eu: 'Beste norbaiten argazki lapurtua',
        en: 'Stolen photo or copyright infringement',
      },
    },
  },
  tip: {
    title: {
      es: 'Denunciar consejo',
      eu: 'Aholkua salatu',
      en: 'Report tip',
    },
    subtitle: {
      es: 'Ayúdanos a mantener los consejos útiles y respetuosos.',
      eu: 'Lagundu bidaiarien aholkuak baliagarri eta errespetuzko mantentzen.',
      en: 'Help us keep traveler tips useful and respectful.',
    },
    reasons: {
      spam: {
        es: 'Spam o publicidad',
        eu: 'Spam-a edo publizitatea',
        en: 'Spam or advertising',
      },
      abuse: {
        es: 'Lenguaje ofensivo o inapropiado',
        eu: 'Hizkera iraingarria edo desegokia',
        en: 'Offensive or abusive language',
      },
      falseInfo: {
        es: 'Información falsa o peligrosa',
        eu: 'Informazio faltsua edo arriskutsua',
        en: 'False or dangerous travel advice',
      },
    },
  },
  common: {
    detailsPlaceholder: {
      es: 'Detalles adicionales para los moderadores (opcional)...',
      eu: 'Moderatzaileentzako xehetasun gehiago (aukerakoa)...',
      en: 'Additional details for moderators (optional)...',
    },
    cancelBtn: {
      es: 'Cancelar',
      eu: 'Utzi',
      en: 'Cancel',
    },
    submitBtn: {
      es: 'Enviar denuncia',
      eu: 'Bidali salaketa',
      en: 'Submit report',
    },
    successToast: {
      es: '✓ Denuncia enviada para revisión. Gracias por cuidar la comunidad.',
      eu: '✓ Salaketa bidalita berrikusteko. Eskerrik asko komunitatea zaintzeagatik.',
      en: '✓ Report submitted for review. Thank you for protecting the community.',
    },
  },
};

function lang2(lang: LangCode): Lang2 {
  const map: Record<LangCode, Lang2> = { ES: 'es', EUS: 'eu', EN: 'en', FR: 'en', DE: 'en', IT: 'en' };
  return map[lang] ?? 'en';
}

interface ReportModalProps {
  photoId?: string;
  tipId?: string;
  onClose: () => void;
}

export function ReportModal({ photoId, tipId, onClose }: ReportModalProps) {
  const { lang, showToast } = useApp();
  const l = lang2(lang);

  const targetType: ReportTargetType = tipId ? 'tip' : 'photo';
  const dict = targetType === 'tip' ? REPORT_I18N.tip : REPORT_I18N.photo;

  const [reason, setReason] = useState<ReportReason | TipReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasons = targetType === 'tip'
    ? TIP_REASONS.map((r) => ({ key: r.key, icon: r.icon, label: dict.reasons[r.labelKey][l] }))
    : PHOTO_REASONS.map((r) => ({ key: r.key, icon: r.icon, label: dict.reasons[r.labelKey][l] }));

  const submit = async () => {
    if (!reason) return;
    setSubmitting(true);
    setError(null);
    try {
      if (targetType === 'tip') {
        await submitTipReport(tipId!, reason as TipReportReason, details.trim() || null);
      } else {
        await submitReport(photoId!, reason as ReportReason, details.trim() || null);
      }
      setDone(true);
      setTimeout(() => showToast(REPORT_I18N.common.successToast[l]), 100);
    } catch {
      setError(l === 'eu' ? 'Errorea. Saiatu berriro.' : l === 'es' ? 'Error. Inténtalo de nuevo.' : 'Error. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl bg-sand-50 dark:bg-slate2-900 shadow-lift overflow-hidden animate-popIn pointer-events-auto">
        <div className="flex items-center justify-between p-5 border-b border-forest-100 dark:border-slate2-800">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-terracotta-500 shrink-0" />
            <div>
              <h2 className="font-display text-lg font-700 text-forest-800 dark:text-sand-100 leading-tight">
                {dict.title[l]}
              </h2>
              <p className="text-xs text-forest-700/60 dark:text-sand-300/60 mt-0.5 leading-snug">
                {dict.subtitle[l]}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-full hover:bg-forest-100 dark:hover:bg-slate2-800 text-forest-700 dark:text-sand-300 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-forest-100 dark:bg-forest-900 grid place-items-center mx-auto mb-4">
              <Check className="w-7 h-7 text-forest-600 dark:text-forest-300" />
            </div>
            <p className="text-sm font-600 text-forest-800 dark:text-sand-100 leading-relaxed">
              {REPORT_I18N.common.successToast[l]}
            </p>
            <button onClick={onClose} className="mt-5 px-6 py-2 rounded-xl bg-forest-600 text-white text-sm font-600 hover:bg-forest-700 transition-colors">
              {l === 'eu' ? 'Itxi' : l === 'es' ? 'Cerrar' : 'Close'}
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              {reasons.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setReason(r.key)}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border-2 text-left transition-colors ${
                    reason === r.key
                      ? 'border-terracotta-400 bg-terracotta-50 dark:bg-terracotta-900/20'
                      : 'border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-850 hover:border-forest-300'
                  }`}
                >
                  <span className="text-xl shrink-0">{r.icon}</span>
                  <span className="text-sm font-500 text-forest-800 dark:text-sand-100 leading-snug">
                    {r.label}
                  </span>
                </button>
              ))}
            </div>

            <div>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, 500))}
                rows={3}
                placeholder={REPORT_I18N.common.detailsPlaceholder[l]}
                className="w-full px-3 py-2.5 rounded-xl border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-850 text-sm text-forest-800 dark:text-sand-100 outline-none focus:border-forest-400 resize-none"
              />
              <p className="text-[11px] text-forest-700/40 dark:text-sand-300/40 text-right mt-1">{details.length}/500</p>
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-forest-100 dark:border-slate2-800 text-forest-700 dark:text-sand-300 font-600 text-sm hover:bg-forest-50 dark:hover:bg-slate2-850 transition-colors">
                {REPORT_I18N.common.cancelBtn[l]}
              </button>
              <button
                onClick={submit}
                disabled={!reason || submitting}
                className="flex-1 py-2.5 rounded-xl bg-terracotta-500 text-white font-600 text-sm disabled:opacity-40 hover:bg-terracotta-600 transition-colors"
              >
                {submitting ? '...' : REPORT_I18N.common.submitBtn[l]}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
