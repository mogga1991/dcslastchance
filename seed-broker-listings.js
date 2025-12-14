require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const listings = [
  {
    broker_name: 'Sarah Johnson',
    broker_company: 'Capitol Commercial Realty',
    broker_email: 'sjohnson@capitolcr.com',
    broker_phone: '202-555-0101',
    title: 'Class A Office Space - Downtown DC',
    description: 'Premium office space in the heart of Washington DC, steps from Metro. Perfect for federal contractors and agencies. Features include modern HVAC, fiber internet, and 24/7 security.',
    property_type: 'office',
    status: 'active',
    street_address: '1250 H Street NW',
    suite_unit: 'Suite 500',
    city: 'Washington',
    state: 'DC',
    zipcode: '20005',
    latitude: 38.8991,
    longitude: -77.0292,
    total_sf: 50000,
    available_sf: 15000,
    min_divisible_sf: 5000,
    asking_rent_sf: 65.00,
    lease_type: 'full_service',
    available_date: '2025-03-01',
    features: ['parking', 'conference_rooms', 'secure_entry', 'fiber_internet', 'backup_power'],
    amenities: ['gym', 'cafeteria', 'bike_storage', 'shower_facilities'],
    gsa_eligible: true,
    set_aside_eligible: ['small_business', 'wosb', '8a'],
    federal_score: 92,
    federal_score_data: { score: 92, totalProperties: 245, leasedProperties: 128, ownedProperties: 117, totalRSF: 12500000, vacantRSF: 450000, density: 31.2, percentile: 92 }
  },
  {
    broker_name: 'Michael Chen',
    broker_company: 'Pentagon Properties Group',
    broker_email: 'mchen@pentagonprop.com',
    broker_phone: '703-555-0202',
    title: 'Pentagon City Office Park',
    description: 'Modern office space near Pentagon and Crystal City. Excellent for defense contractors. Metro accessible, ample parking, and SCIF-ready infrastructure available.',
    property_type: 'office',
    status: 'active',
    street_address: '1201 S Hayes Street',
    city: 'Arlington',
    state: 'VA',
    zipcode: '22202',
    latitude: 38.8606,
    longitude: -77.0590,
    total_sf: 35000,
    available_sf: 12000,
    min_divisible_sf: 3000,
    asking_rent_sf: 58.50,
    lease_type: 'modified_gross',
    available_date: '2025-04-15',
    features: ['parking', 'conference_rooms', 'loading_dock', 'secure_entry', 'scif_ready'],
    amenities: ['cafeteria', 'bike_storage'],
    gsa_eligible: true,
    set_aside_eligible: ['small_business', 'sdvosb'],
    federal_score: 88,
    federal_score_data: { score: 88, totalProperties: 198, leasedProperties: 102, ownedProperties: 96, totalRSF: 8900000, vacantRSF: 320000, density: 25.2, percentile: 88 }
  },
  {
    broker_name: 'Jennifer Martinez',
    broker_company: 'MidAtlantic Industrial Realty',
    broker_email: 'jmartinez@midatlanticir.com',
    broker_phone: '301-555-0303',
    title: 'Industrial Warehouse - Silver Spring',
    description: 'Large warehouse facility with excellent highway access. Suitable for federal supply chain and logistics operations. High ceilings, multiple loading docks, and ample yard space.',
    property_type: 'warehouse',
    status: 'active',
    street_address: '11300 Lockwood Drive',
    city: 'Silver Spring',
    state: 'MD',
    zipcode: '20901',
    latitude: 39.0469,
    longitude: -77.0261,
    total_sf: 75000,
    available_sf: 45000,
    asking_rent_sf: 18.50,
    lease_type: 'triple_net',
    available_date: '2025-05-01',
    features: ['loading_dock', 'high_ceilings', 'yard_space', 'truck_access'],
    amenities: ['parking'],
    gsa_eligible: true,
    set_aside_eligible: ['small_business', 'hubzone'],
    federal_score: 72,
    federal_score_data: { score: 72, totalProperties: 112, leasedProperties: 58, ownedProperties: 54, totalRSF: 4200000, vacantRSF: 180000, density: 14.2, percentile: 72 }
  },
  {
    broker_name: 'David Thompson',
    broker_company: 'Dulles Corridor Commercial',
    broker_email: 'dthompson@dullescc.com',
    broker_phone: '703-555-0404',
    title: 'Reston Town Center Office',
    description: 'Class A office space in vibrant Reston Town Center. Popular with government contractors and tech companies. Walking distance to restaurants, shops, and Silver Line Metro.',
    property_type: 'office',
    status: 'active',
    street_address: '1818 Library Street',
    suite_unit: 'Suite 300',
    city: 'Reston',
    state: 'VA',
    zipcode: '20190',
    latitude: 38.9584,
    longitude: -77.3578,
    total_sf: 28000,
    available_sf: 10000,
    min_divisible_sf: 2500,
    asking_rent_sf: 52.00,
    lease_type: 'full_service',
    available_date: '2025-06-01',
    features: ['parking', 'conference_rooms', 'fiber_internet', 'secure_entry'],
    amenities: ['gym', 'cafeteria', 'rooftop_terrace'],
    gsa_eligible: true,
    set_aside_eligible: ['small_business'],
    federal_score: 78,
    federal_score_data: { score: 78, totalProperties: 145, leasedProperties: 76, ownedProperties: 69, totalRSF: 5800000, vacantRSF: 210000, density: 18.4, percentile: 78 }
  },
  {
    broker_name: 'Lisa Patel',
    broker_company: 'Baltimore Harbor Properties',
    broker_email: 'lpatel@baltimoreharborprop.com',
    broker_phone: '410-555-0505',
    title: 'Harbor East Mixed-Use Building',
    description: 'Modern mixed-use space in Baltimore\'s Inner Harbor area. Ground floor retail with office space above. Excellent for federal agencies seeking community presence.',
    property_type: 'mixed_use',
    status: 'active',
    street_address: '1000 Lancaster Street',
    city: 'Baltimore',
    state: 'MD',
    zipcode: '21202',
    latitude: 39.2864,
    longitude: -76.6001,
    total_sf: 32000,
    available_sf: 18000,
    asking_rent_sf: 42.00,
    lease_type: 'modified_gross',
    available_date: '2025-07-01',
    features: ['parking', 'storefront', 'conference_rooms', 'elevator'],
    amenities: ['bike_storage', 'public_transit_access'],
    gsa_eligible: true,
    set_aside_eligible: ['small_business', '8a', 'hubzone'],
    federal_score: 65,
    federal_score_data: { score: 65, totalProperties: 89, leasedProperties: 44, ownedProperties: 45, totalRSF: 3200000, vacantRSF: 145000, density: 11.3, percentile: 65 }
  },
  {
    broker_name: 'Robert Wilson',
    broker_company: 'Rocky Mountain Commercial',
    broker_email: 'rwilson@rockymtncommercial.com',
    broker_phone: '303-555-0606',
    title: 'Denver Federal Center Adjacent Office',
    description: 'Professional office space near Denver Federal Center. Popular with contractors supporting federal agencies. Mountain views, modern amenities.',
    property_type: 'office',
    status: 'active',
    street_address: '155 Inverness Drive West',
    suite_unit: 'Building C',
    city: 'Denver',
    state: 'CO',
    zipcode: '80112',
    latitude: 39.5764,
    longitude: -104.9019,
    total_sf: 22000,
    available_sf: 8000,
    min_divisible_sf: 2000,
    asking_rent_sf: 38.50,
    lease_type: 'full_service',
    available_date: '2025-08-01',
    features: ['parking', 'conference_rooms', 'mountain_views'],
    amenities: ['gym', 'bike_storage'],
    gsa_eligible: true,
    set_aside_eligible: ['small_business', 'wosb'],
    federal_score: 81,
    federal_score_data: { score: 81, totalProperties: 134, leasedProperties: 68, ownedProperties: 66, totalRSF: 4800000, vacantRSF: 175000, density: 17.0, percentile: 81 }
  },
  {
    broker_name: 'Amanda Brooks',
    broker_company: 'Southern Industrial Partners',
    broker_email: 'abrooks@southernindustrial.com',
    broker_phone: '404-555-0707',
    title: 'Atlanta Industrial Complex',
    description: 'Large industrial facility near major interstates and Hartsfield-Jackson Airport. Ideal for federal logistics and distribution operations.',
    property_type: 'industrial',
    status: 'active',
    street_address: '2500 Northeast Expressway',
    city: 'Atlanta',
    state: 'GA',
    zipcode: '30345',
    latitude: 33.8769,
    longitude: -84.3272,
    total_sf: 95000,
    available_sf: 60000,
    asking_rent_sf: 14.25,
    lease_type: 'triple_net',
    available_date: '2025-09-01',
    features: ['loading_dock', 'high_ceilings', 'rail_access', 'yard_space'],
    amenities: ['parking', 'truck_parking'],
    gsa_eligible: true,
    set_aside_eligible: ['small_business'],
    federal_score: 58,
    federal_score_data: { score: 58, totalProperties: 76, leasedProperties: 38, ownedProperties: 38, totalRSF: 2800000, vacantRSF: 125000, density: 9.7, percentile: 58 }
  },
  {
    broker_name: 'Carlos Rodriguez',
    broker_company: 'Alamo Commercial Group',
    broker_email: 'crodriguez@alamocommercial.com',
    broker_phone: '210-555-0808',
    title: 'Military Installation Adjacent Office',
    description: 'Office space near Joint Base San Antonio. Excellent for defense contractors. Secure facility with SCIF capabilities.',
    property_type: 'office',
    status: 'active',
    street_address: '9800 Airport Boulevard',
    suite_unit: 'Suite 100',
    city: 'San Antonio',
    state: 'TX',
    zipcode: '78216',
    latitude: 29.5333,
    longitude: -98.4691,
    total_sf: 18000,
    available_sf: 7500,
    min_divisible_sf: 2500,
    asking_rent_sf: 32.00,
    lease_type: 'modified_gross',
    available_date: '2025-10-01',
    features: ['parking', 'secure_entry', 'scif_ready', 'conference_rooms'],
    amenities: ['cafeteria'],
    gsa_eligible: true,
    set_aside_eligible: ['small_business', 'sdvosb', '8a'],
    federal_score: 75,
    federal_score_data: { score: 75, totalProperties: 122, leasedProperties: 64, ownedProperties: 58, totalRSF: 4100000, vacantRSF: 155000, density: 15.5, percentile: 75 }
  },
  {
    broker_name: 'Dr. Emily Foster',
    broker_company: 'Desert Healthcare Properties',
    broker_email: 'efoster@deserthealthcare.com',
    broker_phone: '602-555-0909',
    title: 'VA Medical Center Adjacent Medical Office',
    description: 'Medical office space adjacent to VA Medical Center. Perfect for healthcare contractors and providers serving veterans. Modern medical infrastructure.',
    property_type: 'medical',
    status: 'active',
    street_address: '650 E Indian School Road',
    suite_unit: 'Building A',
    city: 'Phoenix',
    state: 'AZ',
    zipcode: '85012',
    latitude: 33.4951,
    longitude: -112.0619,
    total_sf: 25000,
    available_sf: 12000,
    min_divisible_sf: 3000,
    asking_rent_sf: 45.00,
    lease_type: 'full_service',
    available_date: '2025-11-01',
    features: ['medical_gas', 'elevator', 'parking', 'exam_rooms'],
    amenities: ['pharmacy', 'lab_access'],
    gsa_eligible: true,
    set_aside_eligible: ['small_business', 'wosb'],
    federal_score: 70,
    federal_score_data: { score: 70, totalProperties: 98, leasedProperties: 51, ownedProperties: 47, totalRSF: 3500000, vacantRSF: 140000, density: 12.4, percentile: 70 }
  },
  {
    broker_name: 'James Park',
    broker_company: 'Puget Sound Commercial Realty',
    broker_email: 'jpark@pugetsoundcr.com',
    broker_phone: '206-555-1010',
    title: 'Downtown Seattle Federal Building Proximity',
    description: 'Modern office space in downtown Seattle, walking distance to federal buildings. Excellent for contractors supporting federal agencies in the Pacific Northwest.',
    property_type: 'office',
    status: 'active',
    street_address: '1201 Third Avenue',
    suite_unit: 'Suite 2000',
    city: 'Seattle',
    state: 'WA',
    zipcode: '98101',
    latitude: 47.6075,
    longitude: -122.3356,
    total_sf: 30000,
    available_sf: 15000,
    min_divisible_sf: 5000,
    asking_rent_sf: 55.00,
    lease_type: 'full_service',
    available_date: '2025-12-01',
    features: ['parking', 'conference_rooms', 'fiber_internet', 'secure_entry', 'water_views'],
    amenities: ['gym', 'cafeteria', 'bike_storage', 'shower_facilities', 'rooftop_terrace'],
    gsa_eligible: true,
    set_aside_eligible: ['small_business', 'hubzone'],
    federal_score: 85,
    federal_score_data: { score: 85, totalProperties: 167, leasedProperties: 88, ownedProperties: 79, totalRSF: 6700000, vacantRSF: 245000, density: 21.2, percentile: 85 }
  }
];

async function seedBrokerListings() {
  try {
    // Get first user
    console.log('Getting user ID...');
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

    if (userError || !userData.users.length) {
      console.error('No users found. Please create a user first.');
      return;
    }

    const userId = userData.users[0].id;
    console.log('Using user ID:', userId);
    console.log('\nInserting broker listings...\n');

    // Insert each listing
    for (const listing of listings) {
      const { error } = await supabase
        .from('broker_listings')
        .insert([{ ...listing, user_id: userId }]);

      if (error) {
        console.error('❌ Error inserting:', listing.title);
        console.error('   ', error.message);
      } else {
        console.log('✓ Inserted:', listing.title);
      }
    }

    console.log('\n✅ All done! Broker listings seeded successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
}

seedBrokerListings();
