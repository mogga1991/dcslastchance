const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://xgeigainkrobwgwapego.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZWlnYWlua3JvYndnd2FwZWdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc4NzcyMSwiZXhwIjoyMDgyMzYzNzIxfQ.kxHI6f8IuwDW-1IfBx3yBcy_zHRiS2lsNmDS9mKXDxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// Read migration files
const migrations = [
  'supabase/migrations/20251214120000_add_lister_role_to_broker_listings.sql',
  'supabase/migrations/20251214131000_simplify_broker_listings_mvp.sql'
];

async function applyMigrations() {
  console.log('Starting migration application...\n');

  for (const migrationFile of migrations) {
    const migrationPath = path.join(__dirname, migrationFile);

    if (!fs.existsSync(migrationPath)) {
      console.log(`⚠️  Migration file not found: ${migrationFile}`);
      continue;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log(`📝 Applying: ${path.basename(migrationFile)}`);

    try {
      // Execute SQL using Supabase's RPC (if available) or direct query
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        console.log(`❌ Error: ${error.message}`);
        console.log('   Details:', error);
      } else {
        console.log(`✅ Success!\n`);
      }
    } catch (err) {
      console.log(`❌ Exception: ${err.message}\n`);
    }
  }

  console.log('\n🎉 Migration application complete!');
  console.log('Note: If migrations failed, they may need to be run using supabase db push or directly in the SQL editor.');
}

applyMigrations().catch(console.error);
