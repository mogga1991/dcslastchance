import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugImages() {
  const { data: properties, error } = await supabase
    .from('broker_listings')
    .select('id, title, street_address, city, images')
    .ilike('street_address', '%275 S 200 E%');

  if (error || !properties || properties.length === 0) {
    console.log('Property not found');
    return;
  }

  const property = properties[0];
  console.log('Property:', property.title);
  console.log('Images stored:', property.images?.length || 0);
  console.log('');

  if (!property.images || property.images.length === 0) {
    console.log('No images in database');
    return;
  }

  console.log('Image URLs in database:\n');
  property.images.forEach((url, i) => {
    console.log(`${i + 1}. ${url}`);
  });

  console.log('\nTesting accessibility:\n');
  for (let i = 0; i < property.images.length; i++) {
    const url = property.images[i];
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`${i + 1}. Status ${response.status} - ${response.ok ? '✅ OK' : '❌ FAIL'}`);
    } catch (err) {
      console.log(`${i + 1}. ❌ ERROR: ${err.message}`);
    }
  }
}

debugImages();
