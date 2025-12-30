/**
 * Apply chat tables migration to Supabase
 * Run with: node scripts/apply-chat-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('Applying chat tables migration...\n');

  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20251227000000_create_opportunity_chat_history.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split SQL into individual statements (basic split on semicolons)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Skip comments
    if (statement.startsWith('--')) continue;

    console.log(`[${i + 1}/${statements.length}] Executing statement...`);

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        console.error(`Error on statement ${i + 1}:`, error.message);
        console.error('Statement:', statement.substring(0, 100) + '...');

        // Continue with next statement instead of exiting
        continue;
      }

      console.log(`✓ Success\n`);
    } catch (err) {
      console.error(`Unexpected error on statement ${i + 1}:`, err.message);
    }
  }

  console.log('\n✅ Migration application complete!');
  console.log('\nNote: You may need to verify the tables were created correctly.');
  console.log('Check the Supabase dashboard: https://supabase.com/dashboard');
}

applyMigration()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
