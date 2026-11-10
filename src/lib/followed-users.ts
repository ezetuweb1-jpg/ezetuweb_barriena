import { useMemo, useSyncExternalStore } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
}

const STORAGE_KEY = 'ezetu_followed_users';
const EMPTY = '[]';
const listeners = new Set<() => void>();

function isUserProfile(value: unknown): value is UserProfile {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.name === 'string' && typeof v.username === 'string';
}

function readRaw(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

function parse(raw: string): UserProfile[] {
  try {
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data) ? data.filter(isUserProfile) : [];
  } catch {
    return [];
  }
}

function writeList(users: UserProfile[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch { /* storage unavailable: the in-session list still updates */ }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function loadFollowedUsers(): UserProfile[] {
  return parse(readRaw());
}

export function isUserFollowed(userId: string): boolean {
  return loadFollowedUsers().some((u) => u.id === userId);
}

export function toggleFollowUser(user: UserProfile): boolean {
  const current = loadFollowedUsers();
  const exists = current.some((u) => u.id === user.id);
  writeList(exists ? current.filter((u) => u.id !== user.id) : [...current, user]);
  return !exists;
}

export function useFollowedUsers(): UserProfile[] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => EMPTY);
  return useMemo(() => parse(raw), [raw]);
}

export function useIsUserFollowed(userId: string): boolean {
  return useFollowedUsers().some((u) => u.id === userId);
}

export function toUserProfile(name: string, location: string | null = null): UserProfile {
  const username = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .join('_');
  return { id: name, name, username, avatar: null, bio: null, location };
}
