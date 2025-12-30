const fs = require('fs');

// Read the migration SQL
const sql = fs.readFileSync('supabase/migrations/apply_missing_columns.sql', 'utf8');

const supabaseUrl = 'https://xgeigainkrobwgwapego.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZWlnYWlua3JvYndnd2FwZWdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc4NzcyMSwiZXhwIjoyMDgyMzYzNzIxfQ.kxHI6f8IuwDW-1IfBx3yBcy_zHRiS2lsNmDS9mKXDxQ';

async function applyMigration() {
  console.log('Applying migration via Supabase REST API...\n');

  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute.\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip comments and DO blocks (they need special handling)
      if (statement.trim().startsWith('--') || statement.trim().startsWith('COMMENT')) {
        console.log(`Skipping: ${statement.substring(0, 50)}...`);
        continue;
      }

      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      console.log(`  ${statement.substring(0, 80)}${statement.length > 80 ? '...' : ''}`);

      // Note: Supabase doesn't expose a direct SQL execution endpoint via REST API
      // This approach won't work - we need to use the SQL editor in the dashboard
    }

    console.log('\n⚠️  Cannot execute SQL via REST API.');
    console.log('Please use one of these methods instead:\n');
    console.log('1. Open Supabase Dashboard → SQL Editor');
    console.log('   URL: https://supabase.com/dashboard/project/xgeigainkrobwgwapego/sql');
    console.log('   Copy and paste the contents of: supabase/migrations/apply_missing_columns.sql\n');
    console.log('2. Or use: supabase db push (if you have access)\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

applyMigration();
