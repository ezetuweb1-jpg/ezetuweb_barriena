import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Camera, Trash2, Info, Users, Footprints } from 'lucide-react';
import { useUserAvatar, saveUserAvatar, removeUserAvatar, downscaleAvatarFile } from '@/lib/user-avatar';
import { type LevelProgress, type PassportLang } from '@/lib/passport-progress';
import { PASSPORT_OWNER, FOLLOWERS_TOTAL, seedFollowers, type SocialProfile } from '@/lib/passport-social';
import { useFollowedUsers } from '@/lib/followed-users';
import { setUserFollowed } from '@/lib/follow-actions';
import { useApp } from '@/lib/app-context';
import { socialText } from '@/lib/translations';
import { type PassportT } from '@/lib/passport-strings';
import { AnimatedBar } from './AnimatedBar';
import { LevelGuideModal } from './LevelGuideModal';
import { SocialListModal } from './SocialListModal';

interface IdentityBlockProps {
  t: PassportT;
  lang: PassportLang;
  xp: number;
  progress: LevelProgress;
  onViewProfile: (name: string) => void;
}

function hueFor(text: string): number {
  return [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 0);
}

export function IdentityBlock({ t, lang, xp, progress, onViewProfile }: IdentityBlockProps) {
  const avatarUrl = useUserAvatar();
  const fileRef = useRef<HTMLInputElement>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [social, setSocial] = useState<'followers' | 'following' | null>(null);
  const followedUsers = useFollowedUsers();
  const { showToast, lang: appLang } = useApp();
  const text = socialText(appLang);
  const following = useMemo<SocialProfile[]>(
    () => followedUsers.map((u) => ({ name: u.name, handle: u.username, hue: hueFor(u.id) })),
    [followedUsers],
  );
  const followers = useMemo(seedFollowers, []);

  const unfollow = async (handle: string) => {
    const user = followedUsers.find((u) => u.username === handle);
    if (!user) return;
    const ok = await setUserFollowed(user, false);
    showToast(ok ? text.unfollowedToast(user.name) : text.followFailed);
  };

  const onPickAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      saveUserAvatar(await downscaleAvatarFile(file));
    } catch { /* unreadable image: keep the current avatar */ }
  };

  const levelName = progress.level.names[lang];
  const nextName = progress.nextLevel?.names[lang];
  const initials = PASSPORT_OWNER.name.split(' ').map((w) => w[0]).join('');

  return (
    <section className="mb-8 rounded-3xl bg-white dark:bg-slate2-850 border border-forest-100 dark:border-slate2-800 shadow-soft p-5 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0 group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden grid place-items-center bg-forest-600 text-white font-display text-2xl font-700 ring-4 ring-forest-100 dark:ring-slate2-800">
              {avatarUrl ? <img src={avatarUrl} alt={PASSPORT_OWNER.name} className="w-full h-full object-cover" /> : initials}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              aria-label={t('changePhoto')}
              title={t('changePhoto')}
              className="absolute -bottom-1 -right-1 grid place-items-center w-9 h-9 rounded-full bg-terracotta-500 text-white shadow-soft hover:bg-terracotta-600 hover:scale-105 transition-all"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-2xl sm:text-3xl font-700 text-forest-800 dark:text-sand-100 truncate">{PASSPORT_OWNER.name}</h2>
            <p className="text-sm text-forest-700/70 dark:text-sand-300/70 truncate">@{PASSPORT_OWNER.handle}</p>
            {avatarUrl && (
              <button onClick={removeUserAvatar} className="mt-1 inline-flex items-center gap-1 text-xs text-forest-700/70 dark:text-sand-300/70 hover:text-terracotta-600 transition-colors">
                <Trash2 className="w-3 h-3" />
                {t('removePhoto')}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 sm:pl-6 sm:border-l sm:border-forest-100 dark:sm:border-slate2-800">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-forest-700/60 dark:text-sand-300/60">{t('levelLabel', { n: progress.level.level })}</p>
              <p className="font-display text-xl font-700 text-forest-800 dark:text-sand-100">{levelName}</p>
            </div>
            <span className="font-display text-lg font-700 text-forest-700 dark:text-forest-300">{t('xpCurrent', { xp })}</span>
          </div>
          <AnimatedBar pct={progress.pct} className="mt-3 h-3 rounded-full bg-forest-100 dark:bg-slate2-800 overflow-hidden" fillClassName="h-full rounded-full bg-gradient-to-r from-forest-500 to-terracotta-500" />
          <p className="mt-2 text-xs text-forest-700/70 dark:text-sand-300/70">
            {progress.nextLevel && nextName
              ? t('xpNext', { n: progress.xpToNext, level: nextName })
              : t('xpMax')}
          </p>
          <button
            onClick={() => setGuideOpen(true)}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-600 bg-forest-50 dark:bg-slate2-900 border border-forest-100 dark:border-slate2-800 text-forest-700 dark:text-sand-200 hover:border-forest-300 dark:hover:border-slate2-700 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            {t('levelHelp')}
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => setSocial('followers')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-forest-50 dark:bg-slate2-900 border border-forest-100 dark:border-slate2-800 text-forest-800 dark:text-sand-100 font-600 text-sm hover:border-forest-300 dark:hover:border-slate2-700 transition-colors"
        >
          <Users className="w-4 h-4 text-forest-600 dark:text-forest-300" />
          <span className="font-display text-base font-700">{FOLLOWERS_TOTAL}</span>
          {t('followersBtn')}
        </button>
        <button
          onClick={() => setSocial('following')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-forest-50 dark:bg-slate2-900 border border-forest-100 dark:border-slate2-800 text-forest-800 dark:text-sand-100 font-600 text-sm hover:border-forest-300 dark:hover:border-slate2-700 transition-colors"
        >
          <Footprints className="w-4 h-4 text-terracotta-600 dark:text-terracotta-300" />
          {t('followingBtn')} ({following.length})
        </button>
      </div>

      {guideOpen && <LevelGuideModal t={t} lang={lang} onClose={() => setGuideOpen(false)} />}
      {social === 'followers' && (
        <SocialListModal t={t} title={t('followersTitle')} profiles={followers} emptyMessage={t('emptyList')} onViewProfile={onViewProfile} onClose={() => setSocial(null)} />
      )}
      {social === 'following' && (
        <SocialListModal t={t} title={t('followingTitle')} profiles={following} emptyMessage={t('followingEmpty')} onViewProfile={onViewProfile} onUnfollow={unfollow} onClose={() => setSocial(null)} />
      )}
    </section>
  );
}
