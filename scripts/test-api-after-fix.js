// Test API endpoint after adding images
async function testApi() {
  console.log('Testing API endpoints for all properties...\n');

  const propertyIds = [
    { id: '96db5c18', desc: '3702 S State St, Salt Lake City, UT' },
    { id: 'bad31728', desc: '3702 S State St, South Jordan, UT' },
    { id: 'baf60bef', desc: '789 Democracy Ave, Washington, DC' }
  ];

  for (const { id, desc } of propertyIds) {
    console.log(`Testing: ${desc}`);
    console.log(`URL: http://localhost:3002/api/broker-listings/${id}`);

    try {
      const response = await fetch(`http://localhost:3002/api/broker-listings/${id}`);

      if (!response.ok) {
        console.log(`❌ Status: ${response.status} ${response.statusText}`);
        const errorBody = await response.text();
        console.log(`   Error: ${errorBody}`);
      } else {
        const data = await response.json();
        if (data.success && data.data) {
          const imagesCount = data.data.images?.length || 0;
          console.log(`✅ Status: 200 OK`);
          console.log(`   Images: ${imagesCount} ${imagesCount > 0 ? '✅' : '❌'}`);
          if (imagesCount > 0) {
            console.log(`   First image: ${data.data.images[0].substring(0, 60)}...`);
          }
        } else {
          console.log(`⚠️  Unexpected response format`);
        }
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    console.log('');
  }
}

testApi();
