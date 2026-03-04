const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // First get table columns
  const { data, error } = await supabase
    .from('project_configs')
    .select('*')
    .limit(5);

  if (error) { console.error('ERROR:', error); return; }

  for (const p of data) {
    console.log('\n=== PROJECT ===');
    console.log('Columns:', Object.keys(p).join(', '));
    console.log('Values:', JSON.stringify(p, null, 2));
  }
}
main();
