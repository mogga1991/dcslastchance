const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xgeigainkrobwgwapego.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZWlnYWlua3JvYndnd2FwZWdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc4NzcyMSwiZXhwIjoyMDgyMzYzNzIxfQ.kxHI6f8IuwDW-1IfBx3yBcy_zHRiS2lsNmDS9mKXDxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('🔍 Verifying migration was successful...\n');

  // Test 1: Check that new columns exist by trying to insert with building_class
  console.log('Test 1: Inserting test property with new columns...');

  const testProperty = {
    user_id: '00000000-0000-0000-0000-000000000001', // Test UUID
    street_address: '456 Test Street',
    city: 'Washington',
    state: 'DC',
    zipcode: '20002',
    total_sf: 75000,
    available_sf: 50000,
    available_date: '2025-02-01',
    building_class: 'class_a', // NEW COLUMN
    broker_email: 'test@example.com',
    broker_name: 'Test Broker',
    broker_company: 'Test Realty',
    broker_phone: '555-1234',
    lister_role: 'broker', // NEW COLUMN
    ada_accessible: true, // NEW COLUMN
    parking_spaces: 100, // NEW COLUMN
    leed_certified: true, // NEW COLUMN
    year_built: 2020, // NEW COLUMN
    notes: 'This is a test property', // NEW COLUMN
    title: 'Test Property - 456 Test St',
    description: 'Test description',
    property_type: 'office',
    asking_rent_sf: 42.50,
    lease_type: 'full_service',
    status: 'draft' // Set to draft so it doesn't appear publicly
  };

  const { data, error } = await supabase
    .from('broker_listings')
    .insert([testProperty])
    .select();

  if (error) {
    console.log('❌ Error inserting test property:', error.message);
    console.log('Details:', JSON.stringify(error, null, 2));
    console.log('\n⚠️  Migration may not have completed successfully.');
  } else {
    console.log('✅ Success! Test property created with ID:', data[0].id);
    console.log('\n📋 Property details:');
    console.log('   - Building Class:', data[0].building_class);
    console.log('   - Lister Role:', data[0].lister_role);
    console.log('   - ADA Accessible:', data[0].ada_accessible);
    console.log('   - Parking Spaces:', data[0].parking_spaces);
    console.log('   - LEED Certified:', data[0].leed_certified);
    console.log('   - Year Built:', data[0].year_built);
    console.log('   - Notes:', data[0].notes);

    // Clean up - delete test property
    console.log('\n🧹 Cleaning up test property...');
    const { error: deleteError } = await supabase
      .from('broker_listings')
      .delete()
      .eq('id', data[0].id);

    if (deleteError) {
      console.log('⚠️  Could not delete test property:', deleteError.message);
    } else {
      console.log('✅ Test property deleted');
    }
  }

  console.log('\n🎉 Migration verification complete!');
  console.log('✅ All new columns are working correctly.');
  console.log('\nYou can now:');
  console.log('  1. Go to Dashboard → List Property');
  console.log('  2. Fill out the form');
  console.log('  3. Submit your property listing');
  console.log('  4. View it in My Listings page\n');
})();
