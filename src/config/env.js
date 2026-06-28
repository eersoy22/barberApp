/**
 * Vercel deploy: scripts/generate-env.js generates this file.
 * Local dev: copy env.example.js to env.js.
 */
export function getEnv() {
  if (typeof window !== 'undefined' && window.__ENV__) {
    return window.__ENV__;
  }
  return {
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
  };
}

export function useSupabase() {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = getEnv();
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
