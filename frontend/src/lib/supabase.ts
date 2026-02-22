import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform, AppState } from 'react-native';
import Constants from 'expo-constants';
import type { Database } from '../types/supabase';

// ─── Resolve credentials (3 layers for reliability across all build types) ───
// 1. process.env (local dev / Metro with .env file)
// 2. Constants.expoConfig.extra (EAS Build / standalone builds via app.config.js)
// 3. Hardcoded fallback (prevents crash; auth will fail gracefully if both above are absent)
const extra = Constants.expoConfig?.extra ?? {};

const supabaseUrl: string =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  extra.supabaseUrl ||
  'https://blhrcjfybdicasjbyuai.supabase.co';

const supabaseAnonKey: string =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  extra.supabaseAnonKey ||
  'sb_publishable_k4_PJt_DMG2yejBTuwN1rg_9QfL7e4p';

// ─── SSR-safe storage ─────────────────────────────────────────────────────────
// Avoids `window` / AsyncStorage access during server rendering (Expo Router SSR).
const isSSR = typeof window === 'undefined';

const ssrSafeStorage = {
  getItem: (key: string): string | null | Promise<string | null> => {
    if (isSSR) return null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void | Promise<void> => {
    if (isSSR) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      AsyncStorage.setItem(key, value);
    } catch {
      // no-op
    }
  },
  removeItem: (key: string): void | Promise<void> => {
    if (isSSR) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      AsyncStorage.removeItem(key);
    } catch {
      // no-op
    }
  },
};

// ─── Supabase client ──────────────────────────────────────────────────────────
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ssrSafeStorage as any,
    autoRefreshToken: !isSSR,
    persistSession: !isSSR,
    detectSessionInUrl: false,
  },
});

// Pause / resume token refresh based on app state (native only)
if (!isSSR && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
