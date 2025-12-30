import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteProperty() {
  // Delete the 789 Democracy Ave property
  const propertyId = 'baf60bef-5b48-4fcf-bb6f-2493a4237a5f';

  console.log('Deleting property: 789 Democracy Ave, Washington, DC');
  console.log('Property ID:', propertyId);
  console.log('');

  try {
    // First, get property details
    const { data: property, error: fetchError } = await supabase
      .from('broker_listings')
      .select('id, title, street_address, city, state')
      .eq('id', propertyId)
      .single();

    if (fetchError || !property) {
      console.log('❌ Property not found');
      return;
    }

    console.log('Found property:');
    console.log('  Title:', property.title);
    console.log('  Address:', property.street_address, property.city, property.state);
    console.log('');

    // Delete the property
    const { error: deleteError } = await supabase
      .from('broker_listings')
      .delete()
      .eq('id', propertyId);

    if (deleteError) {
      console.error('❌ Error deleting property:', deleteError);
      return;
    }

    console.log('✅ Property deleted successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

deleteProperty();
