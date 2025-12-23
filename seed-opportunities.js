const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://clxqdctofuxqjjonvytm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk' // service_role key for INSERT
);

// Sample opportunities with varying square footage requirements
const opportunities = [
  {
    notice_id: 'fake-gsa-2025-001',
    title: 'Office Space Lease - Seattle Federal Building',
    solicitation_number: 'GS-10P-25-RLP-0001',
    department: 'General Services Administration',
    sub_tier: 'Public Buildings Service',
    office: 'GSA PBS Region 10',
    posted_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Combined Synopsis/Solicitation',
    base_type: 'Presolicitation',
    active: 'Yes',
    type_of_set_aside: 'SBA',
    type_of_set_aside_description: 'Total Small Business Set-Aside',
    response_deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    naics_code: '531120',
    classification_code: 'Y1DA',
    description: 'GSA seeks approximately 25,000 rentable square feet of office space in downtown Seattle for federal agency use. Space must be within Seattle city limits, meet security requirements, and provide adequate parking.',
    organization_type: 'OFFICE',
    office_zipcode: '98101',
    office_city: 'Seattle',
    office_country_code: 'USA',
    office_state: 'WA',
    pop_street_address: 'Downtown Seattle',
    pop_city_code: 'SEATTLE',
    pop_city_name: 'Seattle',
    pop_state_code: 'WA',
    pop_state_name: 'Washington',
    pop_zip: '98101',
    pop_country_code: 'USA',
    pop_country_name: 'United States',
    ui_link: 'https://sam.gov/opp/fake-gsa-2025-001',
    source: 'gsa_leasing'
  },
  {
    notice_id: 'fake-gsa-2025-002',
    title: 'Warehouse Facility Lease - Boston Metro Area',
    solicitation_number: 'GS-01P-25-RLP-0002',
    department: 'General Services Administration',
    sub_tier: 'Public Buildings Service',
    office: 'GSA PBS Region 1',
    posted_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Solicitation',
    base_type: 'Solicitation',
    active: 'Yes',
    type_of_set_aside: 'HZC',
    type_of_set_aside_description: 'HUBZone Set-Aside',
    response_deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    naics_code: '531120',
    classification_code: 'Y1DA',
    description: 'Required: 40,000 SF warehouse space with loading docks in Boston metro area. Must have 24/7 access, climate control, and security systems.',
    organization_type: 'OFFICE',
    office_zipcode: '02109',
    office_city: 'Boston',
    office_country_code: 'USA',
    office_state: 'MA',
    pop_street_address: 'Boston Metro Area',
    pop_city_code: 'BOSTON',
    pop_city_name: 'Boston',
    pop_state_code: 'MA',
    pop_state_name: 'Massachusetts',
    pop_zip: '02109',
    pop_country_code: 'USA',
    pop_country_name: 'United States',
    ui_link: 'https://sam.gov/opp/fake-gsa-2025-002',
    source: 'gsa_leasing'
  },
  {
    notice_id: 'fake-gsa-2025-003',
    title: 'Multi-Floor Office Complex - Chicago Loop',
    solicitation_number: 'GS-05P-25-RLP-0003',
    department: 'General Services Administration',
    sub_tier: 'Public Buildings Service',
    office: 'GSA PBS Region 5',
    posted_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Combined Synopsis/Solicitation',
    base_type: 'Presolicitation',
    active: 'Yes',
    type_of_set_aside: null,
    type_of_set_aside_description: 'Unrestricted',
    response_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    naics_code: '531120',
    classification_code: 'Y1DA',
    description: 'GSA requires 75,000 RSF of contiguous office space in Chicago Loop area. High-rise building with modern amenities, LEED certification preferred.',
    organization_type: 'OFFICE',
    office_zipcode: '60604',
    office_city: 'Chicago',
    office_country_code: 'USA',
    office_state: 'IL',
    pop_street_address: 'Chicago Loop District',
    pop_city_code: 'CHICAGO',
    pop_city_name: 'Chicago',
    pop_state_code: 'IL',
    pop_state_name: 'Illinois',
    pop_zip: '60604',
    pop_country_code: 'USA',
    pop_country_name: 'United States',
    ui_link: 'https://sam.gov/opp/fake-gsa-2025-003',
    source: 'gsa_leasing'
  }
];

(async () => {
  try {
    console.log('🌱 Seeding opportunities table...');

    const { data, error } = await supabase
      .from('opportunities')
      .insert(opportunities)
      .select();

    if (error) {
      console.error('❌ Error inserting opportunities:', error.message);
      process.exit(1);
    }

    console.log(`✅ Successfully inserted ${data.length} opportunities`);
    console.log('\n📋 Inserted opportunities:');
    data.forEach(opp => {
      console.log(`  - ${opp.solicitation_number}: ${opp.title}`);
      console.log(`    Location: ${opp.pop_city_name}, ${opp.pop_state_code}`);
      console.log(`    Description: ${opp.description.substring(0, 80)}...`);
    });
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
})();
