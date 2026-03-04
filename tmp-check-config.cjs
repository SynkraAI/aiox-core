const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Get all project configs
  const { data, error } = await supabase
    .from('project_configs')
    .select('key, name, sheets_config, scoring_params, funnel_config');

  if (error) { console.error('ERROR:', error); return; }

  for (const p of data) {
    console.log(`\n=== PROJECT: ${p.name} (${p.key}) ===`);
    console.log('sheets_config:', JSON.stringify(p.sheets_config, null, 2));
    console.log('scoring_params:', JSON.stringify(p.scoring_params, null, 2));
  }
}
main();
