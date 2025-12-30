// This script simulates a browser request with proper headers
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const propertyId = 'a50be346-34d2-4c2d-b9c6-a73ab647349f';

async function testDirectDatabaseAccess() {
  console.log('Testing DIRECT database access with Supabase client...');
  console.log('');

  // Create a client with the anon key (like the API route does)
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabase
      .from('broker_listings')
      .select('id, title, street_address, status, images')
      .eq('id', propertyId)
      .single();

    if (error) {
      console.log('❌ ERROR from Supabase:');
      console.log('   Code:', error.code);
      console.log('   Message:', error.message);
      console.log('   Details:', error.details);
      console.log('   Hint:', error.hint);
      console.log('');
      console.log('⚠️  This suggests an RLS policy issue');
      return;
    }

    if (!data) {
      console.log('❌ No data returned (but no error)');
      return;
    }

    console.log('✅ SUCCESS - Data retrieved:');
    console.log('');
    console.log('Title:', data.title);
    console.log('Address:', data.street_address);
    console.log('Status:', data.status);
    console.log('Images count:', data.images?.length || 0);
    console.log('');

    if (data.images && data.images.length > 0) {
      console.log('✅ Images are present:');
      data.images.forEach((url, i) => {
        console.log(`   ${i + 1}. ${url.substring(0, 80)}...`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDirectDatabaseAccess();
