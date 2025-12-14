const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://clxqdctofuxqjjonvytm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    const migrationSql = fs.readFileSync('./supabase/migrations/20251214120000_add_lister_role_to_broker_listings.sql', 'utf8');
    
    console.log('Applying migration...');
    console.log('SQL:', migrationSql);
    
    // Note: Supabase client doesn't support direct SQL execution
    // We need to use the REST API or Supabase Management API
    console.log('\nPlease apply this migration manually in the Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/clxqdctofuxqjjonvytm/sql/new');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

applyMigration();
