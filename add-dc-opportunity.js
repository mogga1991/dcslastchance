const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://clxqdctofuxqjjonvytm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk'
);

// DC opportunity that should match our DC/VA/MD properties
const dcOpportunity = {
  notice_id: 'fake-gsa-2025-DC-001',
  title: 'Federal Office Space Lease - Washington DC Metro Area',
  solicitation_number: 'GS-11P-25-RLP-DC01',
  department: 'General Services Administration',
  sub_tier: 'Public Buildings Service',
  office: 'GSA PBS Region 11',
  posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  type: 'Combined Synopsis/Solicitation',
  base_type: 'Solicitation',
  active: 'Yes',
  type_of_set_aside: null,
  type_of_set_aside_description: 'Unrestricted',
  response_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  naics_code: '531120',
  classification_code: 'Y1DA',
  description: 'GSA requires approximately 15,000 to 20,000 SF of Class A or B office space in Washington DC Metro Area (includes DC, Arlington VA, or surrounding areas). Space must meet ADA requirements, provide parking, and have backup power. LEED certification preferred.',
  organization_type: 'OFFICE',
  office_zipcode: '20001',
  office_city: 'Washington',
  office_country_code: 'USA',
  office_state: 'DC',
  pop_street_address: 'Washington DC Metro',
  pop_city_code: 'WASHINGTON',
  pop_city_name: 'Washington',
  pop_state_code: 'DC',
  pop_state_name: 'District of Columbia',
  pop_zip: '20001',
  pop_country_code: 'USA',
  pop_country_name: 'United States',
  ui_link: 'https://sam.gov/opp/fake-gsa-2025-DC-001',
  source: 'gsa_leasing'
};

(async () => {
  try {
    console.log('➕ Adding Washington DC opportunity...');

    const { data, error } = await supabase
      .from('opportunities')
      .insert([dcOpportunity])
      .select();

    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }

    console.log('✅ Added DC opportunity:');
    console.log(`   ${data[0].solicitation_number}: ${data[0].title}`);
    console.log(`   Location: ${data[0].pop_city_name}, ${data[0].pop_state_code}`);
    console.log(`   Description: ${data[0].description.substring(0, 100)}...`);
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
})();
