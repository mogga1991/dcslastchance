const { Client } = require('pg');
const fs = require('fs');

// Load env vars
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const DATABASE_URL = envVars.DATABASE_URL || process.env.DATABASE_URL;

(async () => {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const { rows } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'ai_summaries'
      );
    `);

    if (rows[0].exists) {
      console.log('✅ ai_summaries table EXISTS');

      // Check structure
      const { rows: columns } = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'ai_summaries'
        ORDER BY ordinal_position
      `);

      console.log(`   Columns: ${columns.length}`);
      columns.slice(0, 5).forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
      if (columns.length > 5) {
        console.log(`   ... and ${columns.length - 5} more`);
      }
    } else {
      console.log('❌ ai_summaries table DOES NOT EXIST');
      console.log('   Run: node run-migration-neon.js');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
})();
