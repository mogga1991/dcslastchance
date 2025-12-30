import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Different image sets for variety
const imageSets = [
  // Set 1: Modern office building
  [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=800&fit=crop'
  ],
  // Set 2: Commercial property
  [
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&h=800&fit=crop'
  ],
  // Set 3: Professional space
  [
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=1200&h=800&fit=crop'
  ]
];

async function addImagesToAllProperties() {
  console.log('Adding images to ALL properties in database...\n');

  try {
    // Get ALL properties
    const { data: properties, error } = await supabase
      .from('broker_listings')
      .select('id, title, street_address, city, state, images')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
      return;
    }

    if (!properties || properties.length === 0) {
      console.log('No properties found in database');
      return;
    }

    console.log(`Found ${properties.length} properties. Adding images...\n`);

    // Add images to each property
    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];
      const imageSet = imageSets[i % imageSets.length]; // Cycle through image sets

      console.log(`${i + 1}. ${prop.street_address}, ${prop.city}, ${prop.state}`);
      console.log(`   ID: ${prop.id.substring(0, 8)}...`);
      console.log(`   Current images: ${prop.images?.length || 0}`);

      // Update with new images
      const { error: updateError } = await supabase
        .from('broker_listings')
        .update({ images: imageSet })
        .eq('id', prop.id);

      if (updateError) {
        console.log(`   ❌ Error: ${updateError.message}`);
      } else {
        console.log(`   ✅ Added ${imageSet.length} images`);
      }
      console.log('');
    }

    console.log('✅ Finished adding images to all properties!');

  } catch (error) {
    console.error('Error:', error);
  }
}

addImagesToAllProperties();
