import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPropertyImages() {
  console.log('Checking property images...\n');

  try {
    // Get all properties with images
    const { data: properties, error } = await supabase
      .from('broker_listings')
      .select('id, title, street_address, images')
      .not('images', 'is', null);

    if (error) {
      console.error('Error fetching properties:', error);
      return;
    }

    console.log(`Found ${properties.length} properties with images:\n`);

    properties.forEach((property, index) => {
      console.log(`${index + 1}. ${property.title || property.street_address}`);
      console.log(`   ID: ${property.id}`);
      console.log(`   Images (${property.images?.length || 0}):`);
      if (property.images && property.images.length > 0) {
        property.images.forEach((url, i) => {
          console.log(`   ${i + 1}. ${url}`);
        });
      }
      console.log('');
    });

    // Check storage bucket files
    console.log('\nChecking files in storage bucket...');
    const { data: files, error: storageError } = await supabase.storage
      .from('uploads')
      .list('broker-listings', {
        limit: 100,
        offset: 0,
      });

    if (storageError) {
      console.error('Error listing storage files:', storageError);
    } else {
      console.log(`Found ${files.length} files in broker-listings folder`);
      files.forEach((file, i) => {
        console.log(`${i + 1}. ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

checkPropertyImages();
