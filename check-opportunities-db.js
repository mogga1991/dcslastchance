const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDB() {
  // Check total opportunities
  const { data: all, error: allError, count } = await supabase
    .from('opportunities')
    .select('*', { count: 'exact', head: true });
    
  console.log('Total opportunities in DB:', count);
  
  // Check by source
  const { data: gsaData, error: gsaError, count: gsaCount } = await supabase
    .from('opportunities')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'gsa_leasing');
    
  console.log('GSA leasing opportunities (source=gsa_leasing):', gsaCount);
  
  // Get a sample record
  const { data: sample } = await supabase
    .from('opportunities')
    .select('*')
    .limit(1);
    
  if (sample && sample[0]) {
    console.log('\nSample record:');
    console.log('  source:', sample[0].source);
    console.log('  notice_id:', sample[0].notice_id);
    console.log('  title:', sample[0].title?.substring(0, 60));
  }
}

checkDB().catch(console.error);
