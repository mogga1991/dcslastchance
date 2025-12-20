#!/usr/bin/env node

/**
 * Run AI Summaries Migration Directly
 * Uses pg library to connect to Neon database
 */

const fs = require('fs');
const { Client } = require('pg');

// Load env vars manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const DATABASE_URL = envVars.DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

(async () => {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🗄️  Connecting to database...\n');
    await client.connect();
    console.log('✅ Connected to Neon database\n');

    console.log('📋 Running AI Summaries migration...\n');

    const sql = `
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
    `;

    await client.query(sql);

    console.log('✅ Migration completed successfully!\n');
    console.log('Created:');
    console.log('   ✓ Table: ai_summaries');
    console.log('   ✓ Indexes: 3 (opportunity_id, notice_id, expires_at)');
    console.log('   ✓ RLS Policies: 2 (read_all, service_write)');
    console.log('   ✓ Trigger: update_ai_summaries_updated_at');
    console.log('   ✓ Trigger Function: update_ai_summaries_updated_at()');

    // Verify table exists
    console.log('\n🔍 Verifying table creation...');
    const { rows } = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'ai_summaries'
      ORDER BY ordinal_position
    `);

    console.log(`\n✅ Verified: ai_summaries table has ${rows.length} columns:`);
    rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });

    console.log('\n🎉 Migration complete! You can now test the API:\n');
    console.log('   node test-ai-summary.js');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
