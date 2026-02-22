import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform, AppState } from 'react-native';
import type { Database } from '../types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// SSR-safe storage: avoids `window` access during server rendering (Expo Router SSR)
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
