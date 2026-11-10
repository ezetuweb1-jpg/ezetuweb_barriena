import { PassportModal } from './PassportModal';
import { LEVELS, XP_WEIGHTS, type PassportLang } from '@/lib/passport-progress';
import { type PassportT } from '@/lib/passport-strings';

interface LevelGuideModalProps {
  t: PassportT;
  lang: PassportLang;
  onClose: () => void;
}

const RULES = [
  { key: 'ruleVisit', xp: XP_WEIGHTS.visit },
  { key: 'ruleReview', xp: XP_WEIGHTS.review },
  { key: 'rulePhoto', xp: XP_WEIGHTS.photo },
  { key: 'rulePhotoLike', xp: XP_WEIGHTS.photoLike },
  { key: 'rulePioneer', xp: XP_WEIGHTS.pioneer },
] as const;

export function LevelGuideModal({ t, lang, onClose }: LevelGuideModalProps) {
  return (
    <PassportModal title={t('levelHelpTitle')} onClose={onClose} closeLabel={t('close')}>
      <h3 className="text-xs uppercase tracking-wider text-forest-700/60 dark:text-sand-300/60 mb-2">{t('xpRulesTitle')}</h3>
      <ul className="divide-y divide-forest-100 dark:divide-slate2-800 mb-6">
        {RULES.map((r) => (
          <li key={r.key} className="flex items-center justify-between py-2.5 text-sm text-forest-800 dark:text-sand-100">
            <span>{t(r.key)}</span>
            <span className="font-display font-700 text-terracotta-600 dark:text-terracotta-300">+{r.xp} XP</span>
          </li>
        ))}
      </ul>
      <h3 className="text-xs uppercase tracking-wider text-forest-700/60 dark:text-sand-300/60 mb-2">{t('levelsTitle')}</h3>
      <ol className="space-y-2">
        {LEVELS.map((lv) => (
          <li key={lv.level} className="flex items-center gap-3 p-3 rounded-2xl bg-forest-50 dark:bg-slate2-900">
            <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-forest-600 text-white font-display font-700 text-sm">{lv.level}</span>
            <div className="min-w-0 flex-1">
              <p className="font-600 text-sm text-forest-800 dark:text-sand-100">{lv.names[lang]}</p>
              <p className="text-xs text-forest-700/60 dark:text-sand-300/60">{lv.minXp.toLocaleString(lang === 'eu' ? 'eu-ES' : lang === 'es' ? 'es-ES' : 'en-US')}+ XP</p>
            </div>
          </li>
        ))}
      </ol>
    </PassportModal>
  );
}
