const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://clxqdctofuxqjjonvytm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk'
);

(async () => {
  try {
    const { data: matches, error } = await supabase
      .from('property_matches')
      .select(`
        *,
        broker_listings (city, state, available_sf),
        opportunities (solicitation_number, title)
      `)
      .order('overall_score', { ascending: false });

    if (error) throw error;

    console.log(`✅ Found ${matches.length} matches in database:\n`);

    matches.forEach((match, idx) => {
      console.log(`${idx + 1}. Score: ${match.overall_score} (${match.grade}) - ${match.competitive ? 'COMPETITIVE' : match.qualified ? 'QUALIFIED' : 'MARGINAL'}`);
      console.log(`   Property: ${match.broker_listings.city}, ${match.broker_listings.state} - ${match.broker_listings.available_sf?.toLocaleString()} SF`);
      console.log(`   Opportunity: ${match.opportunities.solicitation_number}`);
      console.log(`   Category Scores: L:${match.location_score} S:${match.space_score} B:${match.building_score} T:${match.timeline_score} E:${match.experience_score}`);
      console.log();
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
