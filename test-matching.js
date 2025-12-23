/**
 * Test the property matching system end-to-end
 * This simulates what will happen when the API endpoint is called
 */

const { matchPropertiesWithOpportunities } = require('./lib/scoring/match-properties.ts');

const SUPABASE_URL = 'https://clxqdctofuxqjjonvytm.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk';

(async () => {
  try {
    console.log('🧪 Testing Property Matching System\n');

    const stats = await matchPropertiesWithOpportunities(
      SUPABASE_URL,
      SERVICE_KEY,
      40 // minimum score threshold
    );

    console.log('\n📊 Matching Results:');
    console.log(`   Processed: ${stats.processed} property-opportunity pairs`);
    console.log(`   Matched: ${stats.matched} (score ≥ 40)`);
    console.log(`   Skipped: ${stats.skipped} (score < 40 or invalid)`);
    console.log(`   Duration: ${stats.durationMs}ms`);

    if (stats.errors.length > 0) {
      console.log('\n❌ Errors:');
      stats.errors.forEach(err => console.log(`   - ${err}`));
    } else {
      console.log('\n✅ No errors!');
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
})();
