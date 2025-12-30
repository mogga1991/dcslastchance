import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTestPropertyWithImages() {
  console.log('Creating test property with sample images...\n');

  try {
    // Get your user ID from auth
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError || !users || users.length === 0) {
      console.error('Error finding users:', userError);
      return;
    }

    // Find user by email
    const user = users.find(u => u.email === 'georgemogga1@gmail.com');
    if (!user) {
      console.error('User georgemogga1@gmail.com not found');
      console.log('Available users:', users.map(u => u.email));
      return;
    }

    const userId = user.id;

    // Sample professional real estate images from Unsplash
    const sampleImages = [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop', // Modern office building
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop', // Office interior
      'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=1200&h=800&fit=crop', // Conference room
      'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1200&h=800&fit=crop', // Modern workspace
    ];

    // Create test property
    const propertyData = {
      user_id: userId,
      title: 'Premium Downtown Office Tower - With Photos',
      street_address: '1500 Pennsylvania Avenue NW',
      city: 'Washington',
      state: 'DC',
      zipcode: '20220',
      total_sf: 75000,
      available_sf: 25000,
      asking_rent_sf: 55.00,
      property_type: 'office',
      building_class: 'class_a',
      lease_type: 'full_service',
      available_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      gsa_eligible: true,
      status: 'active',
      description: 'Stunning Class A office tower in the heart of downtown Washington DC. Features modern amenities, 24/7 security, and excellent access to public transportation. Perfect for federal agencies and government contractors.',
      broker_email: user.email,
      broker_name: 'George Mogga',
      broker_phone: '555-0123',
      broker_company: 'FedSpace Realty',
      lister_role: 'broker',
      latitude: 38.8977,
      longitude: -77.0365,
      ada_accessible: true,
      parking_spaces: 200,
      leed_certified: true,
      year_built: 2020,
      amenities: ['24/7 Security', 'On-site Parking', 'Metro Access', 'Conference Rooms', 'Fiber Internet'],
      notes: 'Recently renovated with state-of-the-art HVAC and building management systems.',
      images: sampleImages,
    };

    const { data: property, error } = await supabase
      .from('broker_listings')
      .insert([propertyData])
      .select()
      .single();

    if (error) {
      console.error('Error creating property:', error);
      return;
    }

    console.log('✅ Test property created successfully!\n');
    console.log('Property Details:');
    console.log('- ID:', property.id);
    console.log('- Title:', property.title);
    console.log('- Address:', property.street_address);
    console.log('- Images:', property.images.length, 'photos');
    console.log('\nView it at: http://localhost:3002/dashboard/my-properties');
    console.log('Or direct link: http://localhost:3002/dashboard/available-properties/' + property.id);

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

addTestPropertyWithImages();
