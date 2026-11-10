import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'ezetu_user_avatar';
const MAX_SIZE = 300;

const listeners = new Set<() => void>();

function readStoredAvatar(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function useUserAvatar(): string | null {
  return useSyncExternalStore(subscribe, readStoredAvatar, () => null);
}

export function saveUserAvatar(dataUrl: string) {
  localStorage.setItem(STORAGE_KEY, dataUrl);
  notify();
}

export function removeUserAvatar() {
  localStorage.removeItem(STORAGE_KEY);
  notify();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image-decode'));
    img.src = src;
  });
}

export async function downscaleAvatarFile(file: File): Promise<string> {
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('file-read'));
    reader.readAsDataURL(file);
  });

  const img = await loadImage(source);
  const scale = Math.min(1, MAX_SIZE / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-unavailable');
  ctx.drawImage(img, 0, 0, width, height);

  const webp = canvas.toDataURL('image/webp', 0.9);
  return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.9);
}
