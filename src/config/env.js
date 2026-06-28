/**
 * Vercel/Netlify deploy: scripts/generate-env.js bu dosyayı üretir.
 * Yerel geliştirme: env.example.js dosyasını env.js olarak kopyalayın.
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
