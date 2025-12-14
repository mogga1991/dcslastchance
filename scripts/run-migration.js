const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(migrationFile) {
  console.log(`\n📁 Reading migration: ${migrationFile}`);

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log(`📝 Executing SQL (${sql.length} characters)...`);

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try direct execution if rpc fails
      console.log('⚠️  RPC failed, trying direct execution...');
      const { error: directError } = await supabase.from('_supabase_migrations').select('*').limit(1);

      if (directError && directError.code === '42P01') {
        console.log('ℹ️  Migration tracking table doesn\'t exist, executing SQL directly via pg...');

        // For this, we'll just log instructions for manual execution
        console.log('\n' + '='.repeat(60));
        console.log('⚠️  MANUAL MIGRATION REQUIRED');
        console.log('='.repeat(60));
        console.log('\nPlease run this SQL in your Supabase SQL Editor:\n');
        console.log(sql);
        console.log('\n' + '='.repeat(60));
        return false;
      }

      throw error;
    }

    console.log('✅ Migration executed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n' + '='.repeat(60));
    console.log('⚠️  MANUAL MIGRATION REQUIRED');
    console.log('='.repeat(60));
    console.log('\nPlease run this SQL in your Supabase SQL Editor:');
    console.log(`\n${sql}\n`);
    console.log('='.repeat(60) + '\n');
    return false;
  }
}

async function main() {
  console.log('🚀 Supabase Migration Runner\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);

  const migrations = [
    '20251214130000_create_saved_opportunities.sql'
  ];

  for (const migration of migrations) {
    await runMigration(migration);
  }

  console.log('\n✨ Migration process complete!\n');
}

main().catch(console.error);
