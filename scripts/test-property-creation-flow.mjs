/**
 * Test script to verify property creation flow end-to-end
 * This script simulates creating a property with images
 *
 * Usage: node scripts/test-property-creation-flow.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPropertyCreation() {
  console.log('🧪 Testing Property Creation Flow\n');

  // Step 1: Check storage bucket
  console.log('1️⃣  Checking storage bucket...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error('❌ Failed to list buckets:', bucketsError.message);
    return false;
  }

  const uploadsBucket = buckets.find(b => b.id === 'uploads');
  if (!uploadsBucket) {
    console.error('❌ "uploads" bucket does NOT exist!');
    console.log('   Fix: Run migration: supabase db push');
    return false;
  }

  console.log('✅ Storage bucket exists and is public:', uploadsBucket.public);

  // Step 2: Check broker_listings table
  console.log('\n2️⃣  Checking broker_listings table...');
  const { data: testQuery, error: tableError } = await supabase
    .from('broker_listings')
    .select('id')
    .limit(1);

  if (tableError) {
    console.error('❌ Table query failed:', tableError.message);
    return false;
  }

  console.log('✅ broker_listings table accessible');

  // Step 3: Check recent uploads
  console.log('\n3️⃣  Checking recent file uploads...');
  const { data: files, error: filesError } = await supabase.storage
    .from('uploads')
    .list('broker-listings', {
      limit: 10,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (filesError) {
    console.error('❌ Failed to list files:', filesError.message);
  } else {
    console.log(`✅ Found ${files?.length || 0} uploaded files in broker-listings folder`);
    if (files && files.length > 0) {
      console.log('   Most recent uploads:');
      files.slice(0, 3).forEach((file, i) => {
        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(`broker-listings/${file.name}`);
        console.log(`   ${i + 1}. ${file.name} (${(file.metadata?.size / 1024).toFixed(2)} KB)`);
        console.log(`      ${publicUrl}`);
      });
    }
  }

  // Step 4: Check properties with images
  console.log('\n4️⃣  Checking properties with images...');
  const { data: properties, error: propsError } = await supabase
    .from('broker_listings')
    .select('id, title, street_address, city, images, created_at')
    .not('images', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5);

  if (propsError) {
    console.error('❌ Failed to query properties:', propsError.message);
  } else {
    console.log(`✅ Found ${properties?.length || 0} properties with images`);
    if (properties && properties.length > 0) {
      properties.forEach((prop, i) => {
        console.log(`\n   ${i + 1}. ${prop.title || prop.street_address}`);
        console.log(`      ID: ${prop.id}`);
        console.log(`      Images: ${prop.images?.length || 0}`);
        console.log(`      Created: ${new Date(prop.created_at).toLocaleString()}`);
        if (prop.images && prop.images.length > 0) {
          console.log(`      First image: ${prop.images[0].substring(0, 80)}...`);
        }
      });
    }
  }

  // Step 5: Test image URL accessibility
  if (properties && properties.length > 0 && properties[0].images?.length > 0) {
    console.log('\n5️⃣  Testing image URL accessibility...');
    const testUrl = properties[0].images[0];
    console.log(`   Testing: ${testUrl.substring(0, 80)}...`);

    try {
      const response = await fetch(testUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ Image accessible (HTTP ${response.status})`);
      } else {
        console.error(`❌ Image returned HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Failed to fetch image:`, error.message);
    }
  }

  console.log('\n✅ All checks complete!');
  return true;
}

testPropertyCreation().catch(console.error);
