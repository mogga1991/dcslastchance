import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkImageUrls() {
  console.log('Checking for actual image URLs...\n');

  try {
    // Get first 5 properties to see the raw data
    const { data: properties, error } = await supabase
      .from('broker_listings')
      .select('id, title, street_address, images')
      .limit(5);

    if (error) {
      console.error('Error fetching properties:', error);
      return;
    }

    console.log('Raw image data for first 5 properties:\n');
    properties.forEach((property, index) => {
      console.log(`${index + 1}. ${property.title || property.street_address}`);
      console.log(`   images field type: ${typeof property.images}`);
      console.log(`   images value:`, JSON.stringify(property.images, null, 2));
      console.log('');
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

checkImageUrls();
