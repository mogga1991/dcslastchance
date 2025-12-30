import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function searchProperties() {
  const { data: properties, error } = await supabase
    .from('broker_listings')
    .select('id, title, street_address, city, state, images, created_at')
    .or('street_address.ilike.%200%,title.ilike.%200%')
    .order('created_at', { ascending: false });

  if (error) {
    console.log('Error:', error.message);
    return;
  }

  console.log(`Found ${properties.length} properties with "200" in address:\n`);
  properties.forEach((p, i) => {
    console.log(`${i + 1}. ${p.title || p.street_address}`);
    console.log(`   Address: ${p.street_address}, ${p.city}, ${p.state}`);
    console.log(`   ID: ${p.id.substring(0, 8)}...`);
    console.log(`   Images: ${p.images?.length || 0}`);
    console.log(`   Created: ${p.created_at}`);

    if (p.images && p.images.length > 0) {
      console.log(`   Image URLs:`);
      p.images.forEach((url, j) => {
        console.log(`     ${j + 1}. ${url}`);
      });
    }
    console.log('');
  });
}

searchProperties();
