const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xgeigainkrobwgwapego.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZWlnYWlua3JvYndnd2FwZWdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc4NzcyMSwiZXhwIjoyMDgyMzYzNzIxfQ.kxHI6f8IuwDW-1IfBx3yBcy_zHRiS2lsNmDS9mKXDxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('Testing insert with minimal data (no building_class)...\n');

  const testData = {
    user_id: '00000000-0000-0000-0000-000000000000', // Fake UUID for testing
    street_address: '123 Main St',
    city: 'Washington',
    state: 'DC',
    zipcode: '20001',
    total_sf: 50000,
    available_sf: 25000,
    available_date: '2025-01-01',
    broker_email: 'test@example.com'
  };

  console.log('Test data:', JSON.stringify(testData, null, 2));

  const { data, error } = await supabase
    .from('broker_listings')
    .insert([testData])
    .select();

  if (error) {
    console.log('\n❌ Error:', error.message);
    console.log('Details:', JSON.stringify(error, null, 2));
  } else {
    console.log('\n✅ Success! Inserted:', data);
  }
})();
