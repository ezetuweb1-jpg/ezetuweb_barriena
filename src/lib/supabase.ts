import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseUrl = url ?? '';
export const hasSupabase = !!(url && anon);

export const supabase: SupabaseClient = hasSupabase
  ? createClient(url!, anon!, { auth: { persistSession: false } })
  : new Proxy({} as SupabaseClient, {
      get() {
        throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
      },
    });

const DEVICE_KEY = 'ezetu.device_id';

export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.() ??
        `dev-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return `dev-fallback-${Math.random().toString(36).slice(2)}`;
  }
}
