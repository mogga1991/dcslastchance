import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getFullIds() {
  const { data: properties, error } = await supabase
    .from('broker_listings')
    .select('id, title, street_address, city, state')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Property IDs:\n');
  properties.forEach((prop, i) => {
    console.log(`${i + 1}. ${prop.street_address}, ${prop.city}, ${prop.state}`);
    console.log(`   ID: ${prop.id}`);
    console.log(`   URL: http://localhost:3002/dashboard/available-properties/${prop.id}`);
    console.log('');
  });
}

getFullIds();
