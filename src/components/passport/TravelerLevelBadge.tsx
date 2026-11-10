import { Zap } from 'lucide-react';
import { levelProgress } from '@/lib/passport-progress';
import { createPassportT, passportLocale, type PassportLang } from '@/lib/passport-strings';

interface TravelerLevelBadgeProps {
  xp: number;
  lang: PassportLang;
}

export function TravelerLevelBadge({ xp, lang }: TravelerLevelBadgeProps) {
  const t = createPassportT(lang);
  const { level } = levelProgress(xp);
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-600 bg-emerald-400/20 text-emerald-50 ring-1 ring-emerald-300/50 shadow-[0_0_14px_rgba(52,211,153,0.45)]">
      <Zap className="w-3 h-3 fill-emerald-300 text-emerald-300" />
      {t('levelBadge', {
        level: level.level,
        levelName: level.names[lang],
        xp: xp.toLocaleString(passportLocale(lang)),
      })}
    </span>
  );
}
