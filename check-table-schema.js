const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xgeigainkrobwgwapego.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZWlnYWlua3JvYndnd2FwZWdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc4NzcyMSwiZXhwIjoyMDgyMzYzNzIxfQ.kxHI6f8IuwDW-1IfBx3yBcy_zHRiS2lsNmDS9mKXDxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('Checking broker_listings table schema...\n');

  // Try to select with all possible columns to see what exists
  const { data, error } = await supabase
    .from('broker_listings')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Error:', error.message);
    console.log('Details:', JSON.stringify(error, null, 2));
  } else {
    console.log('Sample row (or empty if no data):');
    console.log(JSON.stringify(data, null, 2));

    if (data && data.length > 0) {
      console.log('\nColumns found in table:');
      console.log(Object.keys(data[0]).sort().join(', '));
    } else {
      console.log('\nTable exists but has no data yet.');
    }
  }
})();
