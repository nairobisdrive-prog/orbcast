/**
 * app.config.js — Dynamic Expo config
 * Reads EXPO_PUBLIC_* vars from .env (local dev) OR from EAS environment variables (builds).
 * Values are embedded into `extra` so they're always available via Constants.expoConfig.extra.
 */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL,
    eas: {
      projectId: config.extra?.eas?.projectId,
    },
  },
});
