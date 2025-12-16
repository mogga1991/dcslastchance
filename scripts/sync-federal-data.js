#!/usr/bin/env node
/**
 * Manual Federal Data Sync Command
 *
 * Usage:
 *   node scripts/sync-federal-data.js
 *   npm run sync-federal-data
 *
 * Fetches all federal buildings and leases from IOLP and stores in Supabase
 */

const API_URL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000';

async function syncFederalData() {
  console.log('🚀 Starting federal data sync...\n');
  console.log(`API URL: ${API_URL}/api/cron/sync-federal-data?force=true\n`);

  const startTime = Date.now();

  try {
    const response = await fetch(
      `${API_URL}/api/cron/sync-federal-data?force=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    const duration = Date.now() - startTime;

    console.log('✅ Sync completed successfully!\n');
    console.log('📊 Statistics:');
    console.log(`   Buildings processed: ${data.stats.buildingsProcessed}`);
    console.log(`   Leases processed:    ${data.stats.leasesProcessed}`);
    console.log(`   Total processed:     ${data.stats.totalProcessed}`);
    console.log(`   Duration:            ${Math.round(duration / 1000)}s`);

    if (data.stats.errors && data.stats.errors.length > 0) {
      console.log(`\n⚠️  Errors (${data.stats.errors.length}):`);
      data.stats.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }

    console.log('\n✨ Done!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Sync failed:');
    console.error(`   ${error.message}\n`);

    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure your dev server is running:');
      console.log('   npm run dev\n');
    }

    if (error.message.includes('503') || error.message.includes('Service Unavailable')) {
      console.log('💡 IOLP service appears to be unavailable.');
      console.log('   Try again later when the service is back online.\n');
    }

    process.exit(1);
  }
}

// Run the sync
syncFederalData();
