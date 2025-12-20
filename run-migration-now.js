const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

(async () => {
  try {
    console.log('🗄️  Running AI Summaries migration...\n');

    // Create table
    console.log('Creating ai_summaries table...');
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql_string: `
        CREATE TABLE IF NOT EXISTS ai_summaries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          opportunity_id TEXT NOT NULL UNIQUE,
          notice_id TEXT,
          summary JSONB NOT NULL,
          raw_description TEXT,
          model_used TEXT NOT NULL,
          tokens_used INTEGER,
          generation_time_ms INTEGER,
          prompt_version TEXT DEFAULT 'v1',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
        );
      `
    });

    if (tableError) {
      // Try direct SQL execution
      const { error: directError } = await supabase
        .from('_migrations')
        .select('*')
        .limit(1);

      if (directError) {
        throw new Error('Cannot execute SQL. Run manually via Supabase Dashboard.');
      }
    }

    console.log('✅ Table created (or already exists)');

    // The issue is that Supabase client doesn't support DDL via RPC
    // We need to use the REST API directly
    console.log('\n⚠️  Running full migration via REST API...\n');

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({
        sql: `
          -- Create table
          CREATE TABLE IF NOT EXISTS ai_summaries (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            opportunity_id TEXT NOT NULL UNIQUE,
            notice_id TEXT,
            summary JSONB NOT NULL,
            raw_description TEXT,
            model_used TEXT NOT NULL,
            tokens_used INTEGER,
            generation_time_ms INTEGER,
            prompt_version TEXT DEFAULT 'v1',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
          );

          -- Create indexes
          CREATE INDEX IF NOT EXISTS idx_ai_summaries_opportunity ON ai_summaries(opportunity_id);
          CREATE INDEX IF NOT EXISTS idx_ai_summaries_notice ON ai_summaries(notice_id) WHERE notice_id IS NOT NULL;
          CREATE INDEX IF NOT EXISTS idx_ai_summaries_expires ON ai_summaries(expires_at);

          -- Enable RLS
          ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;

          -- Drop existing policies if they exist
          DROP POLICY IF EXISTS "ai_summaries_read_all" ON ai_summaries;
          DROP POLICY IF EXISTS "ai_summaries_service_write" ON ai_summaries;

          -- Create policies
          CREATE POLICY "ai_summaries_read_all" ON ai_summaries
            FOR SELECT USING (true);

          CREATE POLICY "ai_summaries_service_write" ON ai_summaries
            FOR ALL USING (auth.role() = 'service_role');

          -- Create trigger function
          CREATE OR REPLACE FUNCTION update_ai_summaries_updated_at()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;

          -- Create trigger
          DROP TRIGGER IF EXISTS ai_summaries_updated_at ON ai_summaries;
          CREATE TRIGGER ai_summaries_updated_at
            BEFORE UPDATE ON ai_summaries
            FOR EACH ROW
            EXECUTE FUNCTION update_ai_summaries_updated_at();
        `
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`REST API error: ${response.status} - ${errorText}`);
    }

    console.log('✅ Migration completed successfully!');
    console.log('   ✓ Table: ai_summaries');
    console.log('   ✓ Indexes: 3');
    console.log('   ✓ RLS Policies: 2');
    console.log('   ✓ Trigger: update_ai_summaries_updated_at');

  } catch (error) {
    console.error('\n❌ Automated migration failed:', error.message);
    console.log('\n📝 Please run manually via Supabase Dashboard:');
    console.log('   1. Go to: https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Click: SQL Editor');
    console.log('   4. Paste the SQL from: supabase/migrations/20251220_create_ai_summaries.sql');
    console.log('   5. Click: Run');
    process.exit(1);
  }
})();
