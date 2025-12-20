const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

(async () => {
  try {
    console.log('🗄️  Running AI Summaries migration...\n');

    const sql = fs.readFileSync('./supabase/migrations/20251220_create_ai_summaries.sql', 'utf8');

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql }).single();

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.log('\n📝 Manual execution required:');
      console.log('1. Go to: https://supabase.com/dashboard');
      console.log('2. Select your project → SQL Editor');
      console.log('3. Paste contents of: supabase/migrations/20251220_create_ai_summaries.sql');
      console.log('4. Click "Run"');
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('   Table created: ai_summaries');
    console.log('   Indexes created: 3');
    console.log('   RLS policies created: 2');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Run migration manually via Supabase Dashboard SQL Editor');
    process.exit(1);
  }
})();
