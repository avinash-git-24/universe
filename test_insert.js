const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && key.trim() && !key.startsWith('#')) acc[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
  return acc;
}, {});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const { data, error } = await supabase.from('delivery_assignments').insert({ request_id: '00000000-0000-0000-0000-000000000000', runner_id: '00000000-0000-0000-0000-000000000000', status: 'active' });
  console.log('Error from insert:', error);
})();
