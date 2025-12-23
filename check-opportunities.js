const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://clxqdctofuxqjjonvytm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk'
);

(async () => {
  try {
    const { data, error, count } = await supabase
      .from('opportunities')
      .select('*', { count: 'exact' })
      .limit(3);

    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }

    console.log('✅ Opportunities table exists');
    console.log('📊 Total records:', count || 0);

    if (data && data.length > 0) {
      console.log('\n📄 Sample opportunity:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('\n⚠️  No opportunities found - need to sync from SAM.gov');
    }
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
})();
