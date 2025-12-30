import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStatus() {
  const propertyId = 'a50be346-34d2-4c2d-b9c6-a73ab647349f';

  console.log('Checking status for property:', propertyId);
  console.log('');

  try {
    const { data, error } = await supabase
      .from('broker_listings')
      .select('id, title, street_address, status, images, created_at')
      .eq('id', propertyId)
      .single();

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (!data) {
      console.log('❌ Property not found');
      return;
    }

    console.log('✅ Property found:');
    console.log('');
    console.log('Title:', data.title);
    console.log('Address:', data.street_address);
    console.log('Status:', data.status);
    console.log('Images count:', data.images?.length || 0);
    console.log('Created:', new Date(data.created_at).toLocaleString());
    console.log('');

    if (data.status !== 'active') {
      console.log('⚠️  PROBLEM FOUND:');
      console.log('   Status is "' + data.status + '" but RLS policy requires "active"');
      console.log('   This is why the API returns 404');
      console.log('');
      console.log('✅ SOLUTION: Update status to "active"');
    } else {
      console.log('✅ Status is "active" - RLS policy should allow access');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkStatus();
