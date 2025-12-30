const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xgeigainkrobwgwapego.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZWlnYWlua3JvYndnd2FwZWdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc4NzcyMSwiZXhwIjoyMDgyMzYzNzIxfQ.kxHI6f8IuwDW-1IfBx3yBcy_zHRiS2lsNmDS9mKXDxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test insert with minimal data
(async () => {
  const testData = {
    user_id: 'test-user-123', // Will fail auth, but shows what fields are required
    street_address: '123 Main St',
    city: 'Washington',
    state: 'DC',
    zipcode: '20001',
    total_sf: 50000,
    available_sf: 25000,
    available_date: '2025-01-01',
    building_class: 'class_a',
    broker_email: 'test@example.com',
    broker_name: 'Test User',
    broker_company: 'Test Company',
    broker_phone: '555-1234',
    title: 'Test Property',
    description: 'Test Description',
    property_type: 'office',
    asking_rent_sf: 35.0,
    lease_type: 'full_service',
    status: 'active'
  };

  console.log('Attempting to insert test data...');
  const { data, error } = await supabase
    .from('broker_listings')
    .insert([testData])
    .select();

  if (error) {
    console.log('ERROR:', error.message);
    console.log('Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('SUCCESS! Inserted:', data);
  }
})();
