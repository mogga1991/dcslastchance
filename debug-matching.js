const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://clxqdctofuxqjjonvytm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk'
);

(async () => {
  try {
    // Check properties
    const { data: properties } = await supabase
      .from('broker_listings')
      .select('id, city, state, available_sf, status')
      .eq('status', 'active')
      .limit(5);

    console.log('📦 Sample Properties:');
    properties?.forEach(p => {
      console.log(`   - ${p.city}, ${p.state} - ${p.available_sf?.toLocaleString()} SF`);
    });

    // Check opportunities
    const { data: opportunities } = await supabase
      .from('opportunities')
      .select('solicitation_number, pop_city_name, pop_state_code, description')
      .eq('active', 'Yes');

    console.log('\n🏛️  Opportunities:');
    opportunities?.forEach(o => {
      console.log(`   - ${o.solicitation_number}: ${o.pop_city_name}, ${o.pop_state_code}`);
      const sfMatch = o.description?.match(/(\d{1,3}(?:,\d{3})*)\s*(?:sq\.?\s*ft|SF|RSF)/i);
      if (sfMatch) {
        console.log(`     SF Requirement: ${sfMatch[1]} SF`);
      }
    });

    // Check state matches
    const propertyStates = new Set(properties?.map(p => p.state));
    const opportunityStates = new Set(opportunities?.map(o => o.pop_state_code));

    console.log('\n🗺️  State Coverage:');
    console.log(`   Properties: ${Array.from(propertyStates).join(', ')}`);
    console.log(`   Opportunities: ${Array.from(opportunityStates).join(', ')}`);

    const overlap = Array.from(propertyStates).filter(s => opportunityStates.has(s));
    if (overlap.length > 0) {
      console.log(`   ✅ Overlap: ${overlap.join(', ')}`);
    } else {
      console.log(`   ❌ NO STATE OVERLAP - This is why matching failed!`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
