const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Environment variables not found');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Check if broker_listings table exists
(async () => {
  const { data, error } = await supabase
    .from('broker_listings')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Error checking broker_listings table:', error.message);
    console.log('Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('broker_listings table exists.');
    console.log('Sample data:', JSON.stringify(data, null, 2));
  }
})();
