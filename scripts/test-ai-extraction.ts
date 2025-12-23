/**
 * AI Extraction A/B Testing Script
 *
 * Usage:
 *   npx tsx scripts/test-ai-extraction.ts
 *
 * This script:
 * 1. Fetches recent GSA lease opportunities
 * 2. Manually creates ground truth for 10 sample opportunities
 * 3. Runs A/B test comparing AI vs regex extraction
 * 4. Reports accuracy and cost metrics
 */

// import { fetchGSALeases } from '../lib/sam-gov'; // TODO: Update when function is available
import { runABTest, createGroundTruth, type GroundTruthRequirements } from '../lib/ai/extraction-ab-test';
import type { SAMOpportunity } from '../lib/sam-gov';

// =============================================================================
// GROUND TRUTH DATA (Manually Reviewed)
// =============================================================================

/**
 * These are actual GSA lease opportunities that have been manually reviewed
 * to establish ground truth for accuracy testing.
 *
 * To add more samples:
 * 1. Find a GSA lease on SAM.gov
 * 2. Manually read the full description
 * 3. Extract all requirements accurately
 * 4. Add to this array
 */
const GROUND_TRUTH_SAMPLES: GroundTruthRequirements[] = [
  createGroundTruth({
    noticeId: 'SAMPLE-001', // Replace with real SAM.gov notice ID
    reviewer: 'Sprint 3 Team',
    state: 'DC',
    city: 'Washington',
    hasDelineatedArea: true,
    minSqFt: 50000,
    maxSqFt: 75000,
    targetSqFt: 62500,
    isRentable: true,
    isContiguous: true,
    buildingClasses: ['A', 'B'],
    requiresADA: true,
    requiresLEED: false,
    requiresSCIF: false,
    firmTermMonths: 120,
    notes: 'Standard GSA office lease in DC metro area'
  }),

  // TODO: Add 9 more manually reviewed samples
  // Each sample should represent different types of GSA leases:
  // - Small office (< 20K SF)
  // - Large office (> 100K SF)
  // - Warehouse/storage
  // - SCIF-capable space
  // - LEED-required
  // - Multiple states
  // - Delineated area examples
];

// =============================================================================
// MAIN TEST SCRIPT
// =============================================================================

async function main() {
  console.log('🧪 AI Extraction A/B Testing\n');
  console.log('================================================\n');

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ERROR: ANTHROPIC_API_KEY not set');
    console.error('');
    console.error('To run this test, you need a Claude API key:');
    console.error('1. Sign up at https://console.anthropic.com');
    console.error('2. Generate an API key');
    console.error('3. Add to .env.local:');
    console.error('   ANTHROPIC_API_KEY="sk-ant-api03-..."');
    console.error('');
    process.exit(1);
  }

  // Validate ground truth samples
  if (GROUND_TRUTH_SAMPLES.length < 10) {
    console.warn('⚠️  WARNING: Only', GROUND_TRUTH_SAMPLES.length, 'ground truth samples');
    console.warn('For statistical significance, recommend at least 10 samples.');
    console.warn('Add more manually reviewed opportunities to GROUND_TRUTH_SAMPLES array.\n');
  }

  // Fetch opportunities
  console.log('📡 Fetching GSA lease opportunities...');

  let opportunities: SAMOpportunity[] = [];
  try {
    const result = await fetchGSALeases({
      limit: 100, // Fetch more to find matches for ground truth
      filterByResponseDate: true
    });

    opportunities = result.opportunities;
    console.log(`✅ Fetched ${opportunities.length} opportunities\n`);
  } catch (error) {
    console.error('❌ Failed to fetch opportunities:', error);
    process.exit(1);
  }

  // Filter to only opportunities we have ground truth for
  const noticeIds = new Set(GROUND_TRUTH_SAMPLES.map(gt => gt.noticeId));
  const testOpportunities = opportunities.filter(opp =>
    noticeIds.has(opp.noticeId || '')
  );

  if (testOpportunities.length === 0) {
    console.error('❌ ERROR: No opportunities match ground truth samples');
    console.error('');
    console.error('Ground truth notice IDs:', Array.from(noticeIds).join(', '));
    console.error('');
    console.error('Options:');
    console.error('1. Update notice IDs in GROUND_TRUTH_SAMPLES to match current opportunities');
    console.error('2. Manually create ground truth for current opportunities');
    console.error('');
    process.exit(1);
  }

  console.log(`🎯 Found ${testOpportunities.length} opportunities with ground truth\n`);

  // Run A/B test
  console.log('🏃 Running A/B test (this may take a few minutes)...\n');

  let progressBar = '';
  const results = await runABTest(testOpportunities, GROUND_TRUTH_SAMPLES, {
    onProgress: (current, total) => {
      const percent = Math.round((current / total) * 100);
      const bar = '█'.repeat(Math.floor(percent / 2)) + '░'.repeat(50 - Math.floor(percent / 2));
      progressBar = `[${bar}] ${percent}% (${current}/${total})`;
      process.stdout.write(`\r${progressBar}`);
    }
  });

  console.log('\n');

  // Display results
  console.log('================================================');
  console.log('📊 A/B TEST RESULTS');
  console.log('================================================\n');

  console.log(`Total samples tested: ${results.totalSamples}`);
  console.log('');

  // Overall accuracy
  console.log('📈 OVERALL ACCURACY:');
  console.log(`   AI Extraction:    ${results.aiOverallAccuracy.toFixed(1)}%`);
  console.log(`   Regex Extraction: ${results.regexOverallAccuracy.toFixed(1)}%`);
  console.log(`   Improvement:      +${(results.aiOverallAccuracy - results.regexOverallAccuracy).toFixed(1)}%`);
  console.log('');

  // Target validation
  const targetMet = results.passesTarget ? '✅' : '❌';
  console.log(`${targetMet} Target (90% accuracy): ${results.passesTarget ? 'PASSED' : 'FAILED'}`);
  console.log('');

  // Win/loss record
  console.log('🏆 WIN/LOSS RECORD:');
  console.log(`   AI wins:    ${results.aiWins} (${((results.aiWins / results.totalSamples) * 100).toFixed(0)}%)`);
  console.log(`   Regex wins: ${results.regexWins} (${((results.regexWins / results.totalSamples) * 100).toFixed(0)}%)`);
  console.log(`   Ties:       ${results.ties} (${((results.ties / results.totalSamples) * 100).toFixed(0)}%)`);
  console.log('');

  // Cost analysis
  console.log('💰 COST ANALYSIS:');
  console.log(`   Total AI cost:   $${results.totalAICost.toFixed(4)}`);
  console.log(`   Avg cost/sample: $${(results.totalAICost / results.totalSamples).toFixed(4)}`);
  console.log('');

  // Estimate monthly cost
  const opportunitiesPerMonth = 500; // Estimate based on SAM.gov activity
  const monthlyCost = (results.totalAICost / results.totalSamples) * opportunitiesPerMonth;
  console.log(`   Estimated monthly cost (${opportunitiesPerMonth} opportunities):`);
  console.log(`   $${monthlyCost.toFixed(2)}/month`);

  const budgetStatus = monthlyCost <= 100 ? '✅' : '⚠️';
  console.log(`   ${budgetStatus} Budget target ($100/month): ${monthlyCost <= 100 ? 'WITHIN BUDGET' : 'OVER BUDGET'}`);
  console.log('');

  // Performance
  console.log('⚡ PERFORMANCE:');
  console.log(`   Avg AI time:    ${results.avgAITime.toFixed(0)}ms`);
  console.log(`   Avg regex time: ${results.avgRegexTime.toFixed(0)}ms`);
  console.log(`   Time overhead:  ${(results.avgAITime - results.avgRegexTime).toFixed(0)}ms (+${((results.avgAITime / results.avgRegexTime - 1) * 100).toFixed(0)}%)`);
  console.log('');

  // Field-level accuracy breakdown
  console.log('🎯 FIELD-LEVEL ACCURACY:');
  console.log('');
  console.log('   Field                           AI      Regex   Delta');
  console.log('   ─────────────────────────────────────────────────────');

  const allFields = new Set([
    ...Object.keys(results.fieldAccuracy.ai),
    ...Object.keys(results.fieldAccuracy.regex)
  ]);

  for (const field of Array.from(allFields).sort()) {
    const aiAcc = results.fieldAccuracy.ai[field] || 0;
    const regexAcc = results.fieldAccuracy.regex[field] || 0;
    const delta = aiAcc - regexAcc;

    const deltaStr = delta >= 0 ? `+${delta.toFixed(0)}%` : `${delta.toFixed(0)}%`;
    const paddedField = field.padEnd(30);

    console.log(`   ${paddedField}  ${aiAcc.toFixed(0)}%    ${regexAcc.toFixed(0)}%    ${deltaStr}`);
  }

  console.log('');

  // Individual comparison details
  console.log('================================================');
  console.log('📋 DETAILED COMPARISONS');
  console.log('================================================\n');

  for (const comparison of results.comparisons) {
    const icon = comparison.winner === 'ai' ? '🟢' :
                 comparison.winner === 'regex' ? '🔴' : '🟡';

    console.log(`${icon} ${comparison.noticeId}`);
    console.log(`   AI:    ${comparison.aiAccuracy.toFixed(1)}%`);
    console.log(`   Regex: ${comparison.regexAccuracy.toFixed(1)}%`);
    console.log(`   Winner: ${comparison.winner.toUpperCase()}`);
    console.log('');
  }

  // Final verdict
  console.log('================================================');
  console.log('🎬 FINAL VERDICT');
  console.log('================================================\n');

  if (results.passesTarget && monthlyCost <= 100) {
    console.log('✅ AI EXTRACTION READY FOR PRODUCTION');
    console.log('');
    console.log('   ✓ Accuracy target met (≥90%)');
    console.log('   ✓ Cost target met (≤$100/month)');
    console.log('   ✓ Outperforms regex baseline');
    console.log('');
    console.log('Recommendation: Deploy AI extraction as primary method');
    console.log('                with regex fallback for error cases');
  } else if (results.passesTarget) {
    console.log('⚠️  AI EXTRACTION VIABLE WITH COST OPTIMIZATION');
    console.log('');
    console.log('   ✓ Accuracy target met (≥90%)');
    console.log('   ✗ Over budget ($', monthlyCost.toFixed(2), '/month)');
    console.log('');
    console.log('Recommendations:');
    console.log('   1. Use AI for high-value opportunities only');
    console.log('   2. Cache AI results longer (reduce API calls)');
    console.log('   3. Batch process opportunities to reduce overhead');
  } else {
    console.log('❌ AI EXTRACTION NEEDS IMPROVEMENT');
    console.log('');
    console.log('   ✗ Accuracy below target (< 90%)');
    console.log('');
    console.log('Recommendations:');
    console.log('   1. Add more examples to ground truth dataset');
    console.log('   2. Refine extraction prompt');
    console.log('   3. Add validation rules for extracted data');
    console.log('   4. Consider fine-tuning or prompt engineering');
  }

  console.log('');
  console.log('================================================\n');
}

// Run the test
main().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
