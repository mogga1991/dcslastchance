/**
 * Test IOLP adapter directly
 */

const ARCGIS_BASE_URL = 'https://maps.nccs.nasa.gov/mapping/rest/services/hifld_open/government/FeatureServer';
const BUILDINGS_LAYER = 3;

async function testIOLP() {
  console.log("Testing NASA NCCS HIFLD IOLP endpoint...\n");

  // Test 1: Basic query for DC area
  const query1 = new URLSearchParams({
    where: "state = 'DC'",
    outFields: '*',
    returnGeometry: true,
    f: 'json',
    resultRecordCount: '10'
  });

  const url1 = `${ARCGIS_BASE_URL}/${BUILDINGS_LAYER}/query?${query1}`;
  console.log("Test 1: Query DC properties");
  console.log(`URL: ${url1}\n`);

  try {
    const response = await fetch(url1);
    const data = await response.json();

    if (data.error) {
      console.log("❌ Error:", data.error.message);
      console.log("Details:", JSON.stringify(data.error, null, 2));
    } else {
      console.log("✅ Success!");
      console.log(`Features returned: ${data.features?.length || 0}`);

      if (data.features && data.features.length > 0) {
        console.log("\nFirst property:");
        console.log(JSON.stringify(data.features[0].attributes, null, 2));
      }
    }
  } catch (error) {
    console.log("❌ Request failed:", error.message);
  }

  // Test 2: Try a simple count query
  console.log("\n" + "=".repeat(80));
  console.log("Test 2: Count all properties\n");

  const query2 = new URLSearchParams({
    where: '1=1',
    returnCountOnly: 'true',
    f: 'json'
  });

  const url2 = `${ARCGIS_BASE_URL}/${BUILDINGS_LAYER}/query?${query2}`;

  try {
    const response = await fetch(url2);
    const data = await response.json();

    if (data.error) {
      console.log("❌ Error:", data.error.message);
    } else {
      console.log("✅ Total properties in dataset:", data.count);
    }
  } catch (error) {
    console.log("❌ Request failed:", error.message);
  }
}

testIOLP();
