import { ExternalLink } from 'lucide-react';
import { PassportModal } from './PassportModal';
import { type SocialProfile } from '@/lib/passport-social';
import { type PassportT } from '@/lib/passport-strings';

interface SocialListModalProps {
  t: PassportT;
  title: string;
  profiles: SocialProfile[];
  emptyMessage: string;
  onViewProfile: (name: string) => void;
  onUnfollow?: (handle: string) => void;
  onClose: () => void;
}

export function SocialListModal({ t, title, profiles, emptyMessage, onViewProfile, onUnfollow, onClose }: SocialListModalProps) {
  return (
    <PassportModal title={title} onClose={onClose} closeLabel={t('close')}>
      {profiles.length === 0 ? (
        <p className="text-center text-sm text-forest-700/60 dark:text-sand-300/60 py-8">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-forest-100 dark:divide-slate2-800">
          {profiles.map((p) => (
            <li key={p.handle} className="flex items-center gap-3 py-3">
              <div
                className="grid place-items-center w-10 h-10 shrink-0 rounded-full text-white text-sm font-700"
                style={{ backgroundColor: `hsl(${p.hue} 55% 42%)` }}
                aria-hidden
              >
                {p.name.split(' ').map((w) => w[0]).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-600 text-sm text-forest-800 dark:text-sand-100 truncate">{p.name}</p>
                <p className="text-xs text-forest-700/60 dark:text-sand-300/60 truncate">@{p.handle}</p>
              </div>
              <button
                onClick={() => onViewProfile(p.name)}
                aria-label={t('viewProfile')}
                title={t('viewProfile')}
                className="grid place-items-center w-8 h-8 shrink-0 rounded-full text-forest-700 dark:text-sand-200 hover:bg-forest-100 dark:hover:bg-slate2-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              {onUnfollow && (
                <button
                  onClick={() => onUnfollow(p.handle)}
                  className="group inline-flex items-center shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-600 border border-forest-200 dark:border-slate2-700 bg-forest-50 dark:bg-slate2-800 text-forest-700 dark:text-sand-200 hover:bg-red-500/10 hover:border-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                >
                  <span className="group-hover:hidden">{t('followingBtn')}</span>
                  <span className="hidden group-hover:inline">{t('unfollow')}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </PassportModal>
  );
}
