const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://clxqdctofuxqjjonvytm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk'
);

(async () => {
  try {
    console.log('🗑️  Deleting old matches with categoryScores format...');

    const { error: deleteError } = await supabase
      .from('property_matches')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('❌ Error deleting:', deleteError.message);
      process.exit(1);
    }

    console.log('✅ Deleted all old matches');
    console.log('\n🔄 Re-running matching with new factors format...\n');

    // Import and run matching
    const { matchPropertiesWithOpportunities } = require('./lib/scoring/match-properties.ts');

    const stats = await matchPropertiesWithOpportunities(
      'https://clxqdctofuxqjjonvytm.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk',
      40
    );

    console.log('\n✅ Matching complete with NEW format!');
    console.log(`   Matched: ${stats.matched}`);
    console.log(`   Duration: ${stats.durationMs}ms`);

    // Verify new format
    console.log('\n🔍 Verifying new format...');
    const { data: sample } = await supabase
      .from('property_matches')
      .select('score_breakdown')
      .limit(1)
      .single();

    if (sample?.score_breakdown?.factors) {
      console.log('✅ score_breakdown.factors exists!');
      console.log('✅ Sample factor:', JSON.stringify(sample.score_breakdown.factors.location, null, 2));
    } else {
      console.log('❌ ERROR: factors not found in score_breakdown');
      console.log('   Found keys:', Object.keys(sample?.score_breakdown || {}));
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
})();
