import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findProperty() {
  console.log('Finding property: 4974 W Mellow Way, South Jordan, UT\n');

  try {
    const { data: properties, error } = await supabase
      .from('broker_listings')
      .select('id, title, street_address, city, state, images, created_at')
      .ilike('street_address', '%4974 W Mellow Way%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error:', error);
      return;
    }

    if (!properties || properties.length === 0) {
      console.log('❌ Property not found in database');
      return;
    }

    console.log(`✅ Found ${properties.length} matching property(ies):\n`);

    properties.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.street_address}, ${prop.city}, ${prop.state}`);
      console.log(`   ID: ${prop.id}`);
      console.log(`   Title: ${prop.title || 'No title'}`);
      console.log(`   Images:`);

      if (prop.images && prop.images.length > 0) {
        console.log(`   ✅ Has ${prop.images.length} images:`);
        prop.images.forEach((url, i) => {
          console.log(`      ${i + 1}. ${url}`);
        });
      } else {
        console.log(`   ❌ NO IMAGES (value: ${JSON.stringify(prop.images)})`);
      }

      console.log(`   Created: ${new Date(prop.created_at).toLocaleString()}`);
      console.log(`\n   📋 Property Detail URL:`);
      console.log(`   http://localhost:3002/dashboard/available-properties/${prop.id}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

findProperty();
