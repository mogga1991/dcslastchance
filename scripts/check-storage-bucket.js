/**
 * Verify Supabase Storage bucket configuration
 * Usage: node scripts/check-storage-bucket.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkBucket() {
  console.log('🔍 Checking Supabase Storage bucket...\n');

  // 1. Check if 'uploads' bucket exists
  console.log('1️⃣ Checking if "uploads" bucket exists...');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('❌ Error listing buckets:', listError.message);
    return;
  }

  const uploadsBucket = buckets.find(b => b.id === 'uploads');

  if (!uploadsBucket) {
    console.error('❌ Bucket "uploads" does NOT exist!');
    console.log('\n📝 To fix this, you need to:');
    console.log('   1. Go to Supabase Dashboard → Storage');
    console.log('   2. Create a new bucket named "uploads"');
    console.log('   3. Set it to PUBLIC');
    console.log('   4. Or run the migration: supabase db push');
    return;
  }

  console.log('✅ Bucket "uploads" exists');
  console.log('   - Public:', uploadsBucket.public ? '✓' : '✗ (NEEDS TO BE PUBLIC!)');
  console.log('   - ID:', uploadsBucket.id);
  console.log('   - Name:', uploadsBucket.name);

  if (!uploadsBucket.public) {
    console.error('\n❌ PROBLEM: Bucket is not public!');
    console.log('   Fix: Set bucket to public in Supabase Dashboard');
  }

  // 2. Check for existing files
  console.log('\n2️⃣ Checking for uploaded files...');
  const { data: files, error: filesError } = await supabase.storage
    .from('uploads')
    .list('broker-listings', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (filesError) {
    console.error('❌ Error listing files:', filesError.message);
    return;
  }

  if (!files || files.length === 0) {
    console.log('⚠️  No files found in broker-listings folder');
    console.log('   This might be normal if no properties with images have been created yet');
  } else {
    console.log(`✅ Found ${files.length} files in broker-listings folder`);

    // Show first 5 files
    console.log('\n   Sample files:');
    files.slice(0, 5).forEach((file, i) => {
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(`broker-listings/${file.name}`);
      console.log(`   ${i + 1}. ${file.name}`);
      console.log(`      URL: ${publicUrl}`);
    });
  }

  // 3. Check broker_listings table for image URLs
  console.log('\n3️⃣ Checking broker_listings table for image URLs...');
  const { data: listings, error: dbError } = await supabase
    .from('broker_listings')
    .select('id, title, images')
    .not('images', 'is', null)
    .limit(5);

  if (dbError) {
    console.error('❌ Error querying broker_listings:', dbError.message);
    return;
  }

  if (!listings || listings.length === 0) {
    console.log('⚠️  No listings with images found in database');
  } else {
    console.log(`✅ Found ${listings.length} listings with images in database`);
    listings.forEach((listing, i) => {
      console.log(`\n   ${i + 1}. ${listing.title || listing.id}`);
      console.log(`      Images: ${listing.images?.length || 0} image(s)`);
      if (listing.images && listing.images.length > 0) {
        console.log(`      First URL: ${listing.images[0]}`);
      }
    });
  }

  // 4. Test public access to a sample image
  if (files && files.length > 0) {
    console.log('\n4️⃣ Testing public access to images...');
    const testFile = files[0];
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(`broker-listings/${testFile.name}`);

    console.log(`   Testing URL: ${publicUrl}`);

    try {
      const response = await fetch(publicUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('✅ Image is publicly accessible!');
      } else {
        console.error(`❌ Image returned status: ${response.status}`);
        console.error('   This might indicate the bucket is not public or there are CORS issues');
      }
    } catch (error) {
      console.error('❌ Error accessing image:', error.message);
    }
  }

  console.log('\n✅ Storage check complete!');
}

checkBucket().catch(console.error);
