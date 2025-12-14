const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  console.log('Testing Supabase connection...\n');

  // Test properties table
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('id')
    .limit(1);

  if (propertiesError) {
    console.log('❌ Properties table:', propertiesError.message);
  } else {
    console.log('✅ Properties table exists');
  }

  // Test broker_profiles table
  const { data: brokers, error: brokersError } = await supabase
    .from('broker_profiles')
    .select('id')
    .limit(1);

  if (brokersError) {
    console.log('❌ Broker profiles table:', brokersError.message);
  } else {
    console.log('✅ Broker profiles table exists');
  }

  // Test property_scores table
  const { data: scores, error: scoresError } = await supabase
    .from('property_scores')
    .select('id')
    .limit(1);

  if (scoresError) {
    console.log('❌ Property scores table:', scoresError.message);
  } else {
    console.log('✅ Property scores table exists');
  }

  console.log('\n✅ Database setup complete!');
}

testConnection().catch(console.error);
