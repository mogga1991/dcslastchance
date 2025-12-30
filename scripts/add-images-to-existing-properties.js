import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Different sets of professional real estate images
const imageSets = [
  [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=1200&h=800&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&h=800&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1565183928294-7d22f1d12a0e?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1200&h=800&fit=crop',
  ],
];

async function addImagesToProperties() {
  console.log('Adding images to your existing properties...\n');

  try {
    // Get user
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === 'georgemogga1@gmail.com');

    if (!user) {
      console.error('User not found');
      return;
    }

    // Get user's properties without images
    const { data: properties, error } = await supabase
      .from('broker_listings')
      .select('id, title, street_address, city, images')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
      return;
    }

    console.log(`Found ${properties.length} of your properties\n`);

    let updated = 0;
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const hasImages = property.images && property.images.length > 0;

      if (!hasImages) {
        // Add images to this property
        const imageSet = imageSets[i % imageSets.length];

        const { error: updateError } = await supabase
          .from('broker_listings')
          .update({ images: imageSet })
          .eq('id', property.id);

        if (updateError) {
          console.error(`✗ Failed to update ${property.title || property.street_address}:`, updateError.message);
        } else {
          console.log(`✓ Added ${imageSet.length} images to: ${property.title || property.street_address}, ${property.city}`);
          updated++;
        }
      } else {
        console.log(`○ Already has images: ${property.title || property.street_address}`);
      }
    }

    console.log(`\n✅ Updated ${updated} properties with images!`);
    console.log('\nRefresh your browser to see the changes:');
    console.log('http://localhost:3002/dashboard/my-properties');

  } catch (error) {
    console.error('Error:', error);
  }
}

addImagesToProperties();
