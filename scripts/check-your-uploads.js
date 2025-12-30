import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUploads() {
  console.log('Checking for uploaded images...\n');

  try {
    // Get user
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === 'georgemogga1@gmail.com');

    if (!user) {
      console.error('User not found');
      return;
    }

    // Check all properties for this user
    const { data: properties, error } = await supabase
      .from('broker_listings')
      .select('id, title, street_address, images, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log(`Found ${properties.length} properties:\n`);

    properties.forEach((prop, index) => {
      const imageCount = prop.images?.length || 0;
      const hasImages = imageCount > 0;

      console.log(`${index + 1}. ${prop.title || prop.street_address}`);
      console.log(`   Images: ${imageCount} ${hasImages ? '✅' : '❌'}`);
      if (hasImages) {
        console.log(`   First image: ${prop.images[0].substring(0, 80)}...`);
      }
      console.log(`   Created: ${new Date(prop.created_at).toLocaleString()}`);
      console.log('');
    });

    // Check storage bucket for uploaded files
    console.log('\nChecking Supabase Storage...');
    const { data: files, error: storageError } = await supabase.storage
      .from('uploads')
      .list(`broker-listings/${user.id}`, {
        limit: 100,
        offset: 0,
      });

    if (storageError) {
      console.log('No files in storage:', storageError.message);
    } else {
      console.log(`Files in your broker-listings folder: ${files.length}`);
      files.forEach((file, i) => {
        console.log(`${i + 1}. ${file.name}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkUploads();
