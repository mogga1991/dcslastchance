const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://clxqdctofuxqjjonvytm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk'
);

(async () => {
  try {
    console.log('🧪 Testing Score Breakdown UI Integration\n');

    // Simulate the exact query from my-properties-client.tsx
    const { data: matchData, error } = await supabase
      .from('property_matches')
      .select(`
        property_id,
        opportunity_id,
        overall_score,
        grade,
        qualified,
        competitive,
        score_breakdown,
        opportunities (
          id,
          solicitation_number,
          title,
          department
        )
      `)
      .gte('overall_score', 40)
      .order('overall_score', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (!matchData || matchData.length === 0) {
      console.log('❌ No matches found');
      return;
    }

    const match = matchData[0];
    console.log('✅ Sample Match Data (as UI will receive it):');
    console.log(`   Opportunity: ${match.opportunities.solicitation_number}`);
    console.log(`   Overall Score: ${match.overall_score}`);
    console.log(`   Grade: ${match.grade}`);
    console.log(`   Competitive: ${match.competitive}`);
    console.log(`   Qualified: ${match.qualified}`);
    console.log();

    // Verify score_breakdown structure
    console.log('🔍 Verifying score_breakdown.factors structure:');
    const factors = match.score_breakdown?.factors;

    if (!factors) {
      console.log('❌ ERROR: factors not found in score_breakdown');
      return;
    }

    const factorNames = ['location', 'space', 'building', 'timeline', 'experience'];
    let allValid = true;

    factorNames.forEach(name => {
      const factor = factors[name];
      const hasName = !!factor?.name;
      const hasScore = typeof factor?.score === 'number';
      const hasWeight = typeof factor?.weight === 'number';
      const hasWeighted = typeof factor?.weighted === 'number';
      const hasDetails = !!factor?.details;

      const valid = hasName && hasScore && hasWeight && hasWeighted && hasDetails;
      const icon = valid ? '✅' : '❌';

      console.log(`   ${icon} ${name}:`);
      console.log(`      name: "${factor?.name}" ${hasName ? '✓' : '✗'}`);
      console.log(`      score: ${factor?.score} ${hasScore ? '✓' : '✗'}`);
      console.log(`      weight: ${factor?.weight} ${hasWeight ? '✓' : '✗'}`);
      console.log(`      weighted: ${factor?.weighted} ${hasWeighted ? '✓' : '✗'}`);
      console.log(`      details: ${hasDetails ? 'present' : 'missing'} ${hasDetails ? '✓' : '✗'}`);

      if (!valid) allValid = false;
    });

    console.log();
    if (allValid) {
      console.log('✅ ALL CHECKS PASSED! UI component will receive correct data structure.');
      console.log('\n📋 ScoreBreakdown component will receive:');
      console.log('   breakdown = {');
      console.log(`     overall: ${match.overall_score},`);
      console.log(`     grade: "${match.grade}",`);
      console.log(`     competitive: ${match.competitive},`);
      console.log(`     qualified: ${match.qualified},`);
      console.log('     factors: {');
      factorNames.forEach(name => {
        console.log(`       ${name}: { name, score, weight, weighted, details },`);
      });
      console.log('     }');
      console.log('   }');
    } else {
      console.log('❌ INTEGRATION ERROR: Data structure does not match UI component requirements');
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
})();
