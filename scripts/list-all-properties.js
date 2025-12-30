import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllProperties() {
  console.log('Listing ALL properties in database...\n');

  try {
    // Get ALL properties (not filtered by user)
    const { data: properties, error } = await supabase
      .from('broker_listings')
      .select('id, title, street_address, city, state, images, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log(`Found ${properties.length} properties:\n`);

    properties.forEach((prop, index) => {
      const imageCount = prop.images?.length || 0;
      const hasImages = imageCount > 0;

      console.log(`${index + 1}. ${prop.title || prop.street_address}, ${prop.city}, ${prop.state}`);
      console.log(`   ID: ${prop.id.substring(0, 8)}...`);
      console.log(`   Status: ${prop.status}`);
      console.log(`   Images: ${imageCount} ${hasImages ? '✅' : '❌ NO IMAGES'}`);
      if (hasImages) {
        console.log(`   → First image: ${prop.images[0].substring(0, 60)}...`);
      }
      console.log(`   Created: ${new Date(prop.created_at).toLocaleString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

listAllProperties();
