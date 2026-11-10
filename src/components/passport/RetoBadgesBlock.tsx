import { Medal, Mountain, Home, Waves, MapPin, Camera, Plane } from 'lucide-react';
import { AnimatedBar } from './AnimatedBar';
import { RETOS, type RetoId, type Tier } from '@/lib/passport-progress';
import { type PassportKey, type PassportT } from '@/lib/passport-strings';

interface RetoBadgesBlockProps {
  t: PassportT;
  values: Record<RetoId, number>;
  tiers: Record<RetoId, Tier>;
}

const ICONS: Record<RetoId, typeof Mountain> = {
  cabra: Mountain,
  alma: Home,
  calas: Waves,
  pionero: MapPin,
  ojo: Camera,
  trotamundos: Plane,
};

const COPY_KEYS: Record<RetoId, { name: PassportKey; desc: PassportKey }> = {
  cabra: { name: 'retoName_cabra', desc: 'retoDesc_cabra' },
  alma: { name: 'retoName_alma', desc: 'retoDesc_alma' },
  calas: { name: 'retoName_calas', desc: 'retoDesc_calas' },
  pionero: { name: 'retoName_pionero', desc: 'retoDesc_pionero' },
  ojo: { name: 'retoName_ojo', desc: 'retoDesc_ojo' },
  trotamundos: { name: 'retoName_trotamundos', desc: 'retoDesc_trotamundos' },
};

const MEDAL_COLORS: Record<Tier, string> = {
  0: 'text-slate-300 dark:text-slate2-700',
  1: 'text-amber-600',
  2: 'text-slate-400',
  3: 'text-yellow-500',
};

export function RetoBadgesBlock({ t, values, tiers }: RetoBadgesBlockProps) {
  const tierName = (tier: Tier) => (tier === 3 ? t('tierGold') : tier === 2 ? t('tierSilver') : t('tierBronze'));

  return (
    <section className="mb-8">
      <h2 className="font-display text-2xl font-700 text-forest-800 dark:text-sand-100 mb-4">{t('retosTitle')}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RETOS.map((reto) => {
          const Icon = ICONS[reto.id];
          const tier = tiers[reto.id];
          const value = values[reto.id];
          const base = tier > 0 ? reto.thresholds[tier - 1] : 0;
          const target = reto.thresholds[Math.min(tier, 2)];
          const pct = tier === 3 ? 100 : ((value - base) / (target - base)) * 100;
          return (
            <div key={reto.id} className="p-5 rounded-2xl bg-white dark:bg-slate2-850 border border-forest-100 dark:border-slate2-800 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="grid place-items-center w-11 h-11 rounded-2xl bg-forest-50 dark:bg-slate2-900 text-forest-600 dark:text-forest-300">
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-600 ${tier > 0 ? 'text-forest-800 dark:text-sand-100' : 'text-forest-700/50 dark:text-sand-300/50'}`}>
                  <Medal className={`w-4 h-4 ${MEDAL_COLORS[tier]}`} />
                  {tier > 0 ? tierName(tier) : t('tierNone')}
                </div>
              </div>
              <h3 className="font-600 text-forest-800 dark:text-sand-100 mt-3">{t(COPY_KEYS[reto.id].name)}</h3>
              <p className="text-xs text-forest-700/60 dark:text-sand-300/60 mt-0.5">{t(COPY_KEYS[reto.id].desc)}</p>
              <AnimatedBar pct={pct} className="mt-4 h-2 rounded-full bg-forest-100 dark:bg-slate2-800 overflow-hidden" fillClassName="h-full rounded-full bg-gradient-to-r from-forest-500 to-terracotta-500" />
              <p className="mt-2 text-xs text-forest-700/70 dark:text-sand-300/70">
                {tier === 3
                  ? t('tierDone')
                  : t('nextTier', { value, total: target, tier: tierName((tier + 1) as Tier) })}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
