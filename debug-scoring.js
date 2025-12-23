const { createClient } = require('@supabase/supabase-js');
const { parseOpportunityRequirements } = require('./lib/scoring/parse-opportunity.ts');
const { calculateMatchScore } = require('./lib/scoring/calculate-match-score.ts');

const supabase = createClient(
  'https://clxqdctofuxqjjonvytm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk'
);

const DEFAULT_BROKER_EXPERIENCE = {
  governmentLeaseExperience: false,
  governmentLeasesCount: 0,
  gsa_certified: false,
  yearsInBusiness: 5,
  totalPortfolioSqFt: 500000,
  references: [],
  willingToBuildToSuit: true,
  willingToProvideImprovements: true,
};

function convertToPropertyData(listing) {
  return {
    location: {
      city: listing.city,
      state: listing.state,
      lat: listing.lat || 0,
      lng: listing.lng || 0,
    },
    space: {
      totalSqFt: listing.total_sf,
      availableSqFt: listing.available_sf,
      usableSqFt: listing.usable_sf || Math.round(listing.available_sf * 0.9),
      minDivisibleSqFt: listing.min_divisible_sf,
      isContiguous: true,
    },
    building: {
      buildingClass: listing.building_class || 'B',
      totalFloors: listing.total_floors || 1,
      availableFloors: [1],
      adaCompliant: listing.ada_compliant !== false,
      publicTransitAccess: false,
      parkingSpaces: listing.parking_spaces || 0,
      parkingRatio: listing.parking_ratio || 0,
      features: {
        fiber: listing.has_fiber || false,
        backupPower: listing.has_backup_power || false,
        loadingDock: listing.has_loading_dock || false,
        security24x7: listing.has_24_7_security || false,
        secureAccess: listing.has_24_7_security || false,
        scifCapable: false,
        dataCenter: false,
        cafeteria: false,
        fitnessCenter: false,
        conferenceCenter: false,
      },
      certifications: [
        ...(listing.leed_certified ? ['LEED Gold'] : []),
        ...(listing.energy_star ? ['Energy Star'] : []),
      ],
    },
    timeline: {
      availableDate: listing.available_date ? new Date(listing.available_date) : new Date(),
      minLeaseTermMonths: listing.min_lease_term || 12,
      maxLeaseTermMonths: listing.max_lease_term || 240,
      buildOutWeeksNeeded: 8,
    },
  };
}

(async () => {
  try {
    // Get DC opportunity
    const { data: dcOpp } = await supabase
      .from('opportunities')
      .select('*')
      .eq('pop_state_code', 'DC')
      .single();

    console.log('🏛️  DC Opportunity:', dcOpp.solicitation_number);

    // Get a DC property
    const { data: dcProp } = await supabase
      .from('broker_listings')
      .select('*')
      .eq('state', 'DC')
      .eq('status', 'active')
      .limit(1)
      .single();

    console.log('📦 DC Property:', `${dcProp.city}, ${dcProp.state} - ${dcProp.available_sf} SF\n`);

    // Parse requirements
    const requirements = parseOpportunityRequirements(dcOpp);
    console.log('📋 Parsed Requirements:');
    console.log(`   State: ${requirements.location.state}`);
    console.log(`   Space: ${requirements.space.minSqFt} - ${requirements.space.maxSqFt} SF`);
    console.log();

    // Convert property
    const propertyData = convertToPropertyData(dcProp);

    // Calculate score
    const score = calculateMatchScore(propertyData, DEFAULT_BROKER_EXPERIENCE, requirements);

    console.log('📊 Match Score Result:');
    console.log(`   Overall: ${score.overallScore} (Grade: ${score.grade})`);
    console.log(`   Competitive: ${score.competitive}`);
    console.log(`   Qualified: ${score.qualified}`);
    console.log();
    console.log('   Category Scores:');
    console.log(`     Location: ${score.categoryScores.location.score}`);
    console.log(`     Space: ${score.categoryScores.space.score}`);
    console.log(`     Building: ${score.categoryScores.building.score}`);
    console.log(`     Timeline: ${score.categoryScores.timeline.score}`);
    console.log(`     Experience: ${score.categoryScores.experience.score}`);

    if (score.disqualifiers.length > 0) {
      console.log('\n   ❌ Disqualifiers:');
      score.disqualifiers.forEach(d => console.log(`     - ${d}`));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
})();
