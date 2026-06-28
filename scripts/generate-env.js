import fs from 'fs';

const envJs = `window.__ENV__ = ${JSON.stringify({
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
}, null, 2)};
`;

fs.writeFileSync('env.js', envJs);
console.log('env.js generated');
