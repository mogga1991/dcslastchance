const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xgeigainkrobwgwapego.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZWlnYWlua3JvYndnd2FwZWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3ODc3MjEsImV4cCI6MjA4MjM2MzcyMX0.RIqMGBie50kT2tMQ3xjPBvCWSjNIDK9g0cVYMIujH24';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  console.log('🧪 Testing property listing creation...\n');

  // First, let's check if there are any users
  console.log('Checking for existing users...');

  // We'll use the service role key to check users
  const supabaseAdmin = createClient(
    supabaseUrl,
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZWlnYWlua3JvYndnd2FwZWdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc4NzcyMSwiZXhwIjoyMDgyMzYzNzIxfQ.kxHI6f8IuwDW-1IfBx3yBcy_zHRiS2lsNmDS9mKXDxQ'
  );

  // Get list of users
  const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

  if (usersError) {
    console.log('❌ Error fetching users:', usersError.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log('⚠️  No users found. Please sign up first at:');
    console.log('   http://localhost:3000/sign-up\n');
    return;
  }

  console.log(`✅ Found ${users.length} user(s)\n`);

  // Use the first user
  const testUser = users[0];
  console.log(`Using user: ${testUser.email} (${testUser.id})\n`);

  // Create a test property
  const testProperty = {
    user_id: testUser.id,
    street_address: '789 Democracy Ave',
    city: 'Washington',
    state: 'DC',
    zipcode: '20003',
    total_sf: 100000,
    available_sf: 75000,
    available_date: '2025-03-01',
    building_class: 'class_a',
    broker_email: testUser.email,
    broker_name: testUser.user_metadata?.full_name || 'Test User',
    broker_company: 'Test Realty LLC',
    broker_phone: '555-9876',
    lister_role: 'broker',
    ada_accessible: true,
    parking_spaces: 150,
    leed_certified: false,
    year_built: 2018,
    notes: 'Premium Class A office space in heart of DC',
    title: 'Class A Office Space - 789 Democracy Ave',
    description: 'Stunning office space with views of the Capitol',
    property_type: 'office',
    asking_rent_sf: 45.0,
    lease_type: 'full_service',
    status: 'active' // Make it active so it appears in My Listings
  };

  console.log('Creating test property listing...');
  const { data, error } = await supabaseAdmin
    .from('broker_listings')
    .insert([testProperty])
    .select();

  if (error) {
    console.log('❌ Error:', error.message);
    console.log('Details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ SUCCESS! Property created!\n');
    console.log('📋 Property Details:');
    console.log('   ID:', data[0].id);
    console.log('   Title:', data[0].title);
    console.log('   Address:', `${data[0].street_address}, ${data[0].city}, ${data[0].state}`);
    console.log('   Building Class:', data[0].building_class);
    console.log('   Total SF:', data[0].total_sf.toLocaleString());
    console.log('   Status:', data[0].status);
    console.log('\n✅ This property will appear in:');
    console.log('   - My Listings page (http://localhost:3000/dashboard/my-properties)');
    console.log('   - Available Properties (if public API is implemented)\n');
  }
})();
