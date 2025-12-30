const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase connection details
const connectionString = 'postgresql://postgres.xgeigainkrobwgwapego:RbBwNGwAiZwKL35u@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

async function applyMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/apply_missing_columns.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Applying migration: apply_missing_columns.sql');
    console.log('─'.repeat(60));

    // Execute the migration
    await client.query(sql);

    console.log('✅ Migration applied successfully!\n');

    // Verify the columns were added
    console.log('🔍 Verifying columns were added...');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'broker_listings'
        AND column_name IN (
          'building_class', 'lister_role', 'license_number',
          'brokerage_company', 'ada_accessible', 'parking_spaces',
          'leed_certified', 'year_built', 'notes'
        )
      ORDER BY column_name;
    `);

    console.log('\n✅ New columns in broker_listings table:');
    console.log('─'.repeat(60));
    result.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  ✓ ${row.column_name.padEnd(20)} ${row.data_type.padEnd(20)} ${nullable}`);
    });

    console.log('\n🎉 Migration complete! You can now create property listings.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
