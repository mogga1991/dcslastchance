import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAndFix() {
  console.log('='.repeat(60));
  console.log('SUPABASE STORAGE VERIFICATION AND FIX');
  console.log('='.repeat(60));
  console.log('Project:', supabaseUrl);
  console.log('');

  try {
    // Step 1: Check if bucket exists
    console.log('Step 1: Checking if "uploads" bucket exists...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    console.log('   Existing buckets:', buckets.map(b => b.name).join(', ') || 'none');

    const uploadsExists = buckets.some(b => b.name === 'uploads');

    if (!uploadsExists) {
      console.log('   ❌ "uploads" bucket does NOT exist');
      console.log('   Creating bucket...');

      const { error: createError } = await supabase.storage.createBucket('uploads', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      });

      if (createError) {
        console.error('   ❌ Error creating bucket:', createError);
        return;
      }

      console.log('   ✅ Bucket created successfully');
    } else {
      console.log('   ✅ "uploads" bucket exists');

      // Check bucket configuration
      const bucket = buckets.find(b => b.name === 'uploads');
      console.log('   Bucket details:');
      console.log('     - Public:', bucket.public);
      console.log('     - File size limit:', bucket.file_size_limit ? `${bucket.file_size_limit / 1024 / 1024}MB` : 'unlimited');
    }

    console.log('');

    // Step 2: Test upload (this will show if policies work)
    console.log('Step 2: Testing bucket access...');

    // Create a small test file
    const testFileName = `test-${Date.now()}.txt`;
    const testFile = new Blob(['test'], { type: 'text/plain' });

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(`test/${testFileName}`, testFile);

    if (uploadError) {
      console.log('   ❌ Upload test failed:', uploadError.message);
      console.log('');
      console.log('   This means storage policies need to be applied.');
    } else {
      console.log('   ✅ Upload test successful');

      // Clean up test file
      await supabase.storage.from('uploads').remove([`test/${testFileName}`]);
      console.log('   ✅ Test file cleaned up');
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('NEXT STEPS:');
    console.log('='.repeat(60));
    console.log('');
    console.log('You need to apply storage policies via Supabase SQL Editor:');
    console.log('');
    console.log('1. Go to: https://supabase.com/dashboard/project/xgeigainkrobwgwapego/sql/new');
    console.log('');
    console.log('2. Copy and paste this SQL:');
    console.log('');
    console.log('   DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;');
    console.log('   DROP POLICY IF EXISTS "Public can view uploaded files" ON storage.objects;');
    console.log('   DROP POLICY IF EXISTS "Authenticated users can update their files" ON storage.objects;');
    console.log('   DROP POLICY IF EXISTS "Authenticated users can delete their files" ON storage.objects;');
    console.log('');
    console.log('   CREATE POLICY "Authenticated users can upload files"');
    console.log('   ON storage.objects FOR INSERT TO authenticated');
    console.log('   WITH CHECK (bucket_id = \'uploads\');');
    console.log('');
    console.log('   CREATE POLICY "Public can view uploaded files"');
    console.log('   ON storage.objects FOR SELECT TO public');
    console.log('   USING (bucket_id = \'uploads\');');
    console.log('');
    console.log('   CREATE POLICY "Authenticated users can update their files"');
    console.log('   ON storage.objects FOR UPDATE TO authenticated');
    console.log('   USING (bucket_id = \'uploads\');');
    console.log('');
    console.log('   CREATE POLICY "Authenticated users can delete their files"');
    console.log('   ON storage.objects FOR DELETE TO authenticated');
    console.log('   USING (bucket_id = \'uploads\');');
    console.log('');
    console.log('3. Click "Run" to execute');
    console.log('');
    console.log('4. Hard refresh your browser (Cmd+Shift+R)');
    console.log('');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyAndFix();
