import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const propertyId = 'a50be346-34d2-4c2d-b9c6-a73ab647349f';

async function testApiEndpoint() {
  console.log('Testing API endpoint for property:', propertyId);
  console.log('');

  try {
    // Test the API endpoint directly
    const apiUrl = `http://localhost:3002/api/broker-listings/${propertyId}`;
    console.log('Calling API:', apiUrl);
    console.log('');

    const response = await fetch(apiUrl);

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('');

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error body:', errorText);
      return;
    }

    const data = await response.json();

    console.log('✅ API Response received');
    console.log('');
    console.log('Property ID:', data.id);
    console.log('Property Title:', data.title);
    console.log('Street Address:', data.street_address);
    console.log('');
    console.log('Images field type:', typeof data.images);
    console.log('Images is array:', Array.isArray(data.images));
    console.log('Images length:', data.images?.length || 0);
    console.log('');

    if (data.images && data.images.length > 0) {
      console.log('✅ API RETURNS IMAGES:');
      data.images.forEach((url, i) => {
        console.log(`   ${i + 1}. ${url}`);
      });
    } else {
      console.log('❌ NO IMAGES IN API RESPONSE');
      console.log('   Images value:', JSON.stringify(data.images));
    }
    console.log('');

    // Test if image URLs are accessible
    if (data.images && data.images.length > 0) {
      console.log('Testing image URLs...');
      for (let i = 0; i < data.images.length; i++) {
        const imageUrl = data.images[i];
        try {
          const imgResponse = await fetch(imageUrl, { method: 'HEAD' });
          console.log(`   Image ${i + 1}: ${imgResponse.ok ? '✅' : '❌'} ${imgResponse.status} - ${imageUrl.substring(0, 80)}...`);
        } catch (error) {
          console.log(`   Image ${i + 1}: ❌ Error - ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testApiEndpoint();
