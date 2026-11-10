import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ChevronDown, Globe, Sun, Moon, Monitor, Mail, Lock, Eye, EyeOff, ToggleLeft, ToggleRight, CircleHelp as HelpCircle, FileText, LogOut, X, Bookmark, Award, ChevronRight, Check, Camera } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useVisits, computeStats, continentOf, CONTINENTS_TOTAL } from '@/lib/data';
import { useSpots } from '@/lib/data';
import { LANGS } from '@/lib/i18n';
import type { LangCode } from '@/lib/types';
import { avatarText } from '@/lib/translations';
import { useUserAvatar, saveUserAvatar, removeUserAvatar, downscaleAvatarFile } from '@/lib/user-avatar';
import { Ikurrina } from './Ikurrina';

export function UserMenu() {
  const { t, lang, setLang, themeMode, setThemeMode, tab, setTab, setWishlistOpen, savedSpotIds } = useApp();
  const { visitedIds } = useVisits();
  const { spots } = useSpots();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [publicPassport, setPublicPassport] = useState(true);
  const [showExif, setShowExif] = useState(false);
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarUrl = useUserAvatar();
  const avatar = avatarText(lang);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Compute level from visited spots
  const level = (() => {
    const n = visitedIds.size;
    if (n >= 50) return 5;
    if (n >= 25) return 4;
    if (n >= 12) return 3;
    if (n >= 5) return 2;
    if (n >= 1) return 1;
    return 0;
  })();

  const levelLabel = (() => {
    if (level >= 5) return t('trotamundos');
    if (level >= 3) return t('cabraMontes');
    if (level >= 1) return t('almaRural');
    return t('guest');
  })();

  const userName = t('guest');
  const userEmail = 'explorer@ezetu.world';
  const avatarInitial = userName.charAt(0).toUpperCase();

  const themeModes: { value: 'light' | 'dark' | 'auto'; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: t('lightMode') },
    { value: 'dark', icon: Moon, label: t('darkMode') },
    { value: 'auto', icon: Monitor, label: t('autoMode') },
  ];

  const handleAvatarFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      saveUserAvatar(await downscaleAvatarFile(file));
      setAvatarError(false);
    } catch {
      setAvatarError(true);
    }
  };

  const handlePasswordUpdate = () => {
    if (pw1 && pw1 === pw2) {
      setPasswordOpen(false);
      setPw1('');
      setPw2('');
    }
  };

  return (
    <div ref={ref} className="relative">
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate2-900 hover:border-forest-300 dark:hover:border-slate2-700 transition-colors"
        aria-label={userName}
      >
        <span className="grid place-items-center w-7 h-7 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 text-white text-xs font-700 shadow-soft overflow-hidden">
          {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : avatarInitial}
        </span>
        <span className="hidden lg:flex items-center gap-0.5">
          <span className="grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-terracotta-500 text-white text-[9px] font-700 leading-none">
            {level}
          </span>
          <ChevronDown className={`w-3 h-3 text-forest-700/60 dark:text-sand-300/60 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-[340px] max-h-[80vh] overflow-y-auto rounded-2xl border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate-900 shadow-lift z-[2100] animate-popIn origin-top-right no-scrollbar">
          {/* HEADER: user info */}
          <div className="sticky top-0 bg-gradient-to-br from-forest-600 to-forest-800 dark:from-slate2-800 dark:to-slate2-950 text-white px-4 pt-4 pb-3 rounded-t-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 grid place-items-center w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  aria-label={avatar.changePhoto}
                  title={avatar.changePhoto}
                  className="group relative grid place-items-center w-11 h-11 rounded-full bg-white/20 text-white font-700 text-lg backdrop-blur overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : avatarInitial}
                  <span className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4" />
                  </span>
                </button>
                <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 grid place-items-center min-w-[16px] h-4 px-1 rounded-full bg-terracotta-500 text-white text-[9px] font-700 ring-2 ring-forest-700 dark:ring-slate2-900">
                  {level}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
              </div>
              <div className="min-w-0">
                <p className="font-700 text-sm truncate">{userName}</p>
                <p className="text-xs text-white/70 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {levelLabel} · {t('level')} {level}
                </p>
                {avatarUrl && (
                  <button
                    onClick={removeUserAvatar}
                    className="mt-1 text-[11px] font-600 text-white/80 underline underline-offset-2 hover:text-white transition-colors"
                  >
                    {avatar.removePhoto}
                  </button>
                )}
                {avatarError && (
                  <p role="alert" className="mt-1 text-[11px] text-terracotta-200">{avatar.uploadFailed}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { setTab('passport'); setOpen(false); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors text-xs font-600"
              >
                <ChevronRight className="w-3 h-3" />
                {t('viewPassport')}
              </button>
              <button
                onClick={() => { setWishlistOpen(true); setOpen(false); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors text-xs font-600"
              >
                <Bookmark className="w-3 h-3" />
                {t('savedWishlist')} ({savedSpotIds.length})
              </button>
            </div>
          </div>

          {/* PREFERENCES */}
          <div className="px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider font-700 text-forest-600/60 dark:text-sand-400/60 mb-2.5">{t('preferences')}</p>

            {/* Language */}
            <div className="mb-3">
              <label className="text-xs font-600 text-forest-700/80 dark:text-sand-300/80 flex items-center gap-1.5 mb-1.5">
                <Globe className="w-3.5 h-3.5" />
                {t('language')}
              </label>
              <div className="relative">
                <button
                  onClick={() => setLangOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-forest-100 dark:border-slate2-800 bg-forest-50/50 dark:bg-slate2-900/60 text-sm text-forest-800 dark:text-sand-100 hover:border-forest-300 dark:hover:border-slate2-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {lang === 'EUS' ? <Ikurrina className="w-4 h-2.5" /> : <span className="text-sm">{LANGS.find((l) => l.code === lang)?.flag}</span>}
                    {LANGS.find((l) => l.code === lang)?.label}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-forest-700/60 dark:text-sand-300/60 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                </button>
                {langOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-forest-100 dark:border-slate2-800 bg-white dark:bg-slate-900 shadow-soft overflow-hidden z-10">
                    {LANGS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code as LangCode); setLangOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                          lang === l.code
                            ? 'bg-forest-50 dark:bg-slate2-800 text-forest-800 dark:text-sand-100 font-600'
                            : 'text-forest-700/80 dark:text-sand-300/80 hover:bg-forest-50/60 dark:hover:bg-slate2-800/60'
                        }`}
                      >
                        <span className="text-base">{l.flag === 'IK' ? <Ikurrina className="w-5 h-3 inline-block align-middle" /> : l.flag}</span>
                        <span className="flex-1 text-left">{l.label}</span>
                        {lang === l.code && <Check className="w-3.5 h-3.5 text-forest-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Theme mode */}
            <div>
              <label className="text-xs font-600 text-forest-700/80 dark:text-sand-300/80 flex items-center gap-1.5 mb-1.5">
                <Sun className="w-3.5 h-3.5" />
                {t('visualMode')}
              </label>
              <div className="flex gap-1 p-0.5 rounded-lg bg-forest-50/50 dark:bg-slate2-900/60 border border-forest-100 dark:border-slate2-800">
                {themeModes.map((tm) => {
                  const Icon = tm.icon;
                  const active = themeMode === tm.value;
                  return (
                    <button
                      key={tm.value}
                      onClick={() => setThemeMode(tm.value)}
                      className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-600 transition-all ${
                        active ? 'bg-forest-600 text-white shadow-soft' : 'text-forest-700/60 dark:text-sand-300/60 hover:text-forest-800 dark:hover:text-sand-100'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="hidden sm:inline">{tm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECURITY */}
          <div className="px-4 py-3 border-t border-forest-100/60 dark:border-slate2-800/60">
            <p className="text-[10px] uppercase tracking-wider font-700 text-forest-600/60 dark:text-sand-400/60 mb-2.5">{t('security')}</p>

            {/* Email display */}
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="grid place-items-center w-8 h-8 rounded-lg bg-forest-50 dark:bg-slate2-800 text-forest-600 dark:text-sand-300 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-forest-700/50 dark:text-sand-300/50">{t('email')}</p>
                <p className="text-xs font-600 text-forest-800 dark:text-sand-100 truncate">{userEmail}</p>
              </div>
            </div>

            {/* Change password */}
            <button
              onClick={() => setPasswordOpen((v) => !v)}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-forest-50/60 dark:hover:bg-slate2-800/60 transition-colors"
            >
              <div className="grid place-items-center w-8 h-8 rounded-lg bg-forest-50 dark:bg-slate2-800 text-forest-600 dark:text-sand-300 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-xs font-600 text-forest-800 dark:text-sand-100 flex-1 text-left">{t('changePassword')}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-forest-700/60 dark:text-sand-300/60 transition-transform ${passwordOpen ? 'rotate-180' : ''}`} />
            </button>
            {passwordOpen && (
              <div className="mt-2 space-y-2 px-2 animate-riseIn">
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pw1}
                    onChange={(e) => setPw1(e.target.value)}
                    placeholder={t('newPassword')}
                    className="w-full px-3 py-2 pr-9 rounded-lg border border-forest-100 dark:border-slate2-800 bg-forest-50/50 dark:bg-slate2-900/60 text-sm text-forest-800 dark:text-sand-100 placeholder:text-forest-700/40 dark:placeholder:text-sand-400/40 focus:outline-none focus:border-forest-400 dark:focus:border-slate2-600"
                  />
                  <button
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-forest-700/50 dark:text-sand-300/50"
                  >
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  placeholder={t('confirmPassword')}
                  className="w-full px-3 py-2 rounded-lg border border-forest-100 dark:border-slate2-800 bg-forest-50/50 dark:bg-slate2-900/60 text-sm text-forest-800 dark:text-sand-100 placeholder:text-forest-700/40 dark:placeholder:text-sand-400/40 focus:outline-none focus:border-forest-400 dark:focus:border-slate2-600"
                />
                <button
                  onClick={handlePasswordUpdate}
                  disabled={!pw1 || pw1 !== pw2}
                  className="w-full py-2 rounded-lg bg-forest-600 text-white text-sm font-600 hover:bg-forest-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {t('update')}
                </button>
              </div>
            )}
          </div>

          {/* PRIVACY */}
          <div className="px-4 py-3 border-t border-forest-100/60 dark:border-slate2-800/60">
            <p className="text-[10px] uppercase tracking-wider font-700 text-forest-600/60 dark:text-sand-400/60 mb-2.5">{t('privacy')}</p>

            {/* Public passport toggle */}
            <button
              onClick={() => setPublicPassport((v) => !v)}
              className="w-full flex items-center gap-2.5 py-2 group"
            >
              <div className="grid place-items-center w-8 h-8 rounded-lg bg-forest-50 dark:bg-slate2-800 text-forest-600 dark:text-sand-300 shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-600 text-forest-800 dark:text-sand-100">{t('publicPassport')}</p>
                <p className="text-[10px] text-forest-700/50 dark:text-sand-300/50 truncate">{t('publicPassportDesc')}</p>
              </div>
              {publicPassport
                ? <ToggleRight className="w-8 h-8 text-forest-500 shrink-0" />
                : <ToggleLeft className="w-8 h-8 text-forest-700/30 dark:text-sand-300/30 shrink-0" />}
            </button>

            {/* EXIF toggle */}
            <button
              onClick={() => setShowExif((v) => !v)}
              className="w-full flex items-center gap-2.5 py-2 group"
            >
              <div className="grid place-items-center w-8 h-8 rounded-lg bg-forest-50 dark:bg-slate2-800 text-forest-600 dark:text-sand-300 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-600 text-forest-800 dark:text-sand-100">{t('showExif')}</p>
                <p className="text-[10px] text-forest-700/50 dark:text-sand-300/50 truncate">{t('showExifDesc')}</p>
              </div>
              {showExif
                ? <ToggleRight className="w-8 h-8 text-forest-500 shrink-0" />
                : <ToggleLeft className="w-8 h-8 text-forest-700/30 dark:text-sand-300/30 shrink-0" />}
            </button>
          </div>

          {/* FOOTER */}
          <div className="px-4 py-3 border-t border-forest-100/60 dark:border-slate2-800/60">
            <div className="flex gap-2 mb-3">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-forest-50 dark:bg-slate2-800 text-xs font-600 text-forest-700 dark:text-sand-300 hover:bg-forest-100 dark:hover:bg-slate2-700 transition-colors">
                <HelpCircle className="w-3.5 h-3.5" />
                {t('helpSupport')}
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-forest-50 dark:bg-slate2-800 text-xs font-600 text-forest-700 dark:text-sand-300 hover:bg-forest-100 dark:hover:bg-slate2-700 transition-colors">
                <FileText className="w-3.5 h-3.5" />
                {t('termsPrivacy')}
              </button>
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-red-200 dark:border-red-900/50 text-sm font-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
              <LogOut className="w-4 h-4" />
              {t('logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
