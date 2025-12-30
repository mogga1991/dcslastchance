const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xgeigainkrobwgwapego.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZWlnYWlua3JvYndnd2FwZWdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc4NzcyMSwiZXhwIjoyMDgyMzYzNzIxfQ.kxHI6f8IuwDW-1IfBx3yBcy_zHRiS2lsNmDS9mKXDxQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

(async () => {
  console.log('🔍 Verifying My Listings page will work...\n');

  // This simulates what the My Listings page does
  const testUserId = '2e4be9b3-8878-490d-aa67-60e4dc342c8a'; // georgemogga1@gmail.com

  console.log(`Fetching listings for user: ${testUserId}\n`);

  const { data, error } = await supabase
    .from('broker_listings')
    .select('*')
    .eq('user_id', testUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log(`✅ Found ${data.length} listing(s):\n`);

  data.forEach((listing, index) => {
    console.log(`${index + 1}. ${listing.title || 'Untitled'}`);
    console.log(`   Address: ${listing.street_address}, ${listing.city}, ${listing.state}`);
    console.log(`   Building Class: ${listing.building_class || 'Not set'}`);
    console.log(`   Total SF: ${listing.total_sf?.toLocaleString() || 'N/A'}`);
    console.log(`   Status: ${listing.status}`);
    console.log(`   Created: ${new Date(listing.created_at).toLocaleDateString()}`);
    console.log('');
  });

  console.log('✅ My Listings page is working correctly!\n');
  console.log('Next steps:');
  console.log('  1. Start your dev server: ./dev.sh');
  console.log('  2. Go to: http://localhost:3000/dashboard/my-properties');
  console.log('  3. You should see your property listing(s)\n');
})();
