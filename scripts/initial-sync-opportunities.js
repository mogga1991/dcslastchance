/**
 * Initial sync script to populate the opportunities table from SAM.gov
 *
 * Run this once to initially populate the database:
 * node scripts/initial-sync-opportunities.js
 */

const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.resolve(__dirname, '../.env.local') });

async function runInitialSync() {
  const CRON_SECRET = process.env.CRON_SECRET;
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';

  if (!CRON_SECRET) {
    console.error('❌ CRON_SECRET not found in environment variables');
    process.exit(1);
  }

  console.log('🚀 Starting initial sync of opportunities from SAM.gov...');
  console.log(`📍 API URL: ${BASE_URL}/api/sync-opportunities`);

  try {
    const response = await fetch(`${BASE_URL}/api/sync-opportunities`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Sync completed successfully!');
      console.log(`\n📊 Stats:`);
      console.log(`   Total opportunities: ${result.stats.total}`);
      console.log(`   Newly inserted: ${result.stats.inserted}`);
      console.log(`   Updated: ${result.stats.updated}`);
      console.log(`   Errors: ${result.stats.errors}`);
      console.log(`\n⏰ Timestamp: ${result.timestamp}`);
    } else {
      console.error('❌ Sync failed:', result.error || 'Unknown error');
      console.error('Response:', result);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during sync:', error.message);
    process.exit(1);
  }
}

runInitialSync();
