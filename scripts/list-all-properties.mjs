import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listProperties() {
  const { data: properties, error } = await supabase
    .from('broker_listings')
    .select('id, title, street_address, city, state, images')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.log('Error:', error.message);
    return;
  }

  console.log('Recent properties:\n');
  properties.forEach((p, i) => {
    console.log(`${i + 1}. ${p.title || 'Untitled'}`);
    console.log(`   Address: ${p.street_address}, ${p.city}, ${p.state}`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Images: ${p.images?.length || 0}`);
    if (p.images && p.images.length > 0) {
      console.log(`   First URL: ${p.images[0].substring(0, 80)}...`);
    }
    console.log('');
  });
}

listProperties();
