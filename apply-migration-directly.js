const { Client } = require('pg');
const fs = require('fs');

// Supabase connection string (from DATABASE_URL but for Supabase Postgres)
// Note: We need to use the direct Supabase connection, not the Neon pooler
const connectionString = 'postgresql://postgres.xgeigainkrobwgwapego:RbBwNGwAiZwKL35u@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function applyMigration() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    const sql = fs.readFileSync('supabase/migrations/apply_missing_columns.sql', 'utf8');

    console.log('Executing migration...');
    await client.query(sql);
    console.log('✅ Migration applied successfully!\n');

    // Test that columns were added
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'broker_listings'
      ORDER BY column_name;
    `);

    console.log('Current broker_listings columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
  } finally {
    await client.end();
  }
}

applyMigration();
