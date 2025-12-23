const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://clxqdctofuxqjjonvytm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk'
);

(async () => {
  try {
    const { data: matches, error } = await supabase
      .from('property_matches')
      .select('id, overall_score, grade, score_breakdown')
      .limit(3);

    if (error) throw error;

    console.log('📊 Current score_breakdown JSONB Structure:\n');

    matches.forEach((match, idx) => {
      console.log(`${idx + 1}. Match ID: ${match.id}`);
      console.log(`   Overall Score: ${match.overall_score} (${match.grade})`);
      console.log(`   score_breakdown structure:`);
      console.log(JSON.stringify(match.score_breakdown, null, 2));
      console.log('\n---\n');
    });

    // Check if it matches expected structure
    const firstMatch = matches[0];
    console.log('🔍 Structure Analysis:');
    console.log(`   Has 'factors' key: ${!!firstMatch.score_breakdown?.factors}`);
    console.log(`   Has 'categoryScores' key: ${!!firstMatch.score_breakdown?.categoryScores}`);
    console.log(`   Has 'overallScore' key: ${!!firstMatch.score_breakdown?.overallScore}`);

    if (firstMatch.score_breakdown?.categoryScores) {
      console.log('\n   ✅ Uses categoryScores (current MatchScoreResult format)');
      console.log('   ❌ NEEDS TRANSFORMATION to factors format for UI component');
    } else if (firstMatch.score_breakdown?.factors) {
      console.log('\n   ✅ Uses factors format (ready for UI component)');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
