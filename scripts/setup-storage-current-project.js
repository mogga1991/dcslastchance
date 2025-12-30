import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log('Setting up Supabase Storage bucket...');
  console.log('Project:', supabaseUrl);
  console.log('');

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    console.log('Existing buckets:', buckets.map(b => b.name).join(', ') || 'none');
    console.log('');

    const uploadsExists = buckets.some(b => b.name === 'uploads');

    if (uploadsExists) {
      console.log('✅ "uploads" bucket already exists');
    } else {
      console.log('Creating "uploads" bucket...');

      const { data: newBucket, error: createError } = await supabase.storage.createBucket('uploads', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        return;
      }

      console.log('✅ Created "uploads" bucket');
    }

    console.log('');
    console.log('Storage setup complete!');

  } catch (error) {
    console.error('Error:', error);
  }
}

setupStorage();
