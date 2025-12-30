/**
 * Apply chat tables migration directly to Supabase
 * This script executes raw SQL using the service role key
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const SUPABASE_URL = 'https://xgeigainkrobwgwapego.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZWlnYWlua3JvYndnd2FwZWdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc4NzcyMSwiZXhwIjoyMDgyMzYzNzIxfQ.kxHI6f8IuwDW-1IfBx3yBcy_zHRiS2lsNmDS9mKXDxQ';

// Read the migration SQL
const migrationPath = path.join(__dirname, '../supabase/migrations/20251227000000_create_opportunity_chat_history.sql');
const sqlContent = fs.readFileSync(migrationPath, 'utf8');

console.log('📦 Applying chat tables migration to Supabase...\n');
console.log('Project:', SUPABASE_URL);
console.log('Migration file:', migrationPath);
console.log('\n' + '='.repeat(60) + '\n');

// Execute SQL via Supabase REST API
const executeSQL = (sql) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });

    const options = {
      hostname: 'xgeigainkrobwgwapego.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: body });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

// Execute the migration
executeSQL(sqlContent)
  .then((result) => {
    console.log('✅ Migration applied successfully!');
    console.log('\nTables created:');
    console.log('  • opportunity_chats');
    console.log('  • opportunity_chat_messages');
    console.log('\nYou can verify at:', SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/') + '/editor');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 Alternative: Apply via Supabase Dashboard SQL Editor');
    console.log('   1. Go to:', SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/') + '/sql/new');
    console.log('   2. Copy SQL from:', migrationPath);
    console.log('   3. Click "Run"');
    process.exit(1);
  });
