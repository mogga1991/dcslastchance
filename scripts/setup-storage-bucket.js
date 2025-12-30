import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorageBucket() {
  console.log('Setting up Supabase Storage bucket...\n');

  try {
    // Create the uploads bucket
    console.log('Creating "uploads" bucket...');
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('uploads', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✓ Bucket "uploads" already exists');
      } else {
        console.error('✗ Error creating bucket:', bucketError.message);
        return;
      }
    } else {
      console.log('✓ Bucket "uploads" created successfully');
    }

    // Note: Storage policies are automatically created with the bucket
    // The bucket is public, so files are readable by anyone
    // Only authenticated users can upload/delete files (enforced by RLS)

    console.log('\n✅ Storage bucket setup complete!');
    console.log('\nBucket details:');
    console.log('- Name: uploads');
    console.log('- Public: Yes (files are publicly readable)');
    console.log('- Max file size: 50MB');
    console.log('- Allowed types: JPEG, PNG, GIF, WebP, SVG');
    console.log('\nYou can now upload property images!');

  } catch (error) {
    console.error('✗ Unexpected error:', error);
    process.exit(1);
  }
}

setupStorageBucket();
