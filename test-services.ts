/**
 * Test script for the new services layer
 * Run with: npx tsx test-services.ts
 */

import { UserService, OpportunityService, AnalysisService, CreditService, getDashboardStats } from './lib/services';
import { query } from './lib/db';

async function testServices() {
  console.log('🧪 Testing Services Layer\n');
  console.log('='.repeat(50));

  try {
    // Test 1: Database connection
    console.log('\n📋 Test 1: Database Connection');
    try {
      const result = await query('SELECT NOW() as current_time');
      console.log(`   ✅ Connected! Server time: ${result[0].current_time}`);
    } catch (error: any) {
      console.log(`   ❌ Connection failed: ${error.message}`);
      return;
    }

    // Test 2: Count users
    console.log('\n📋 Test 2: Count Users');
    try {
      const users = await query('SELECT COUNT(*) as count FROM "user"');
      console.log(`   Total users: ${users[0].count}`);
    } catch (error: any) {
      console.log(`   ⚠️  Error: ${error.message}`);
    }

    // Test 3: Get active opportunities
    console.log('\n📋 Test 3: OpportunityService.getActive()');
    try {
      const opportunities = await OpportunityService.getActive(5);
      console.log(`   Found ${opportunities.length} active opportunities`);
      if (opportunities.length > 0) {
        console.log(`   Latest: ${opportunities[0].title}`);
        console.log(`   Agency: ${opportunities[0].agency || 'N/A'}`);
      }
    } catch (error: any) {
      console.log(`   ⚠️  Error: ${error.message}`);
    }

    // Test 4: Count analyses
    console.log('\n📋 Test 4: Count Analyses');
    try {
      const analyses = await query('SELECT COUNT(*) as count FROM "analysis"');
      console.log(`   Total analyses: ${analyses[0].count}`);
    } catch (error: any) {
      console.log(`   ⚠️  Error: ${error.message}`);
    }

    // Test 5: Count opportunity matches
    console.log('\n📋 Test 5: Count Opportunity Matches');
    try {
      const matches = await query('SELECT COUNT(*) as count FROM "opportunity_match"');
      console.log(`   Total matches: ${matches[0].count}`);
    } catch (error: any) {
      console.log(`   ⚠️  Error: ${error.message}`);
    }

    // Test 6: Get first user and their stats
    console.log('\n📋 Test 6: Get User Stats');
    try {
      const users = await query('SELECT id, email, name, analysis_credits FROM "user" LIMIT 1');
      if (users.length > 0) {
        const user = users[0];
        console.log(`   User: ${user.name} (${user.email})`);
        console.log(`   Credits: ${user.analysis_credits || 0}`);

        // Try to get dashboard stats for this user
        try {
          const stats = await getDashboardStats(user.id);
          console.log(`   Dashboard Stats:`, stats);
        } catch (error: any) {
          console.log(`   ⚠️  Stats error: ${error.message}`);
        }
      } else {
        console.log(`   No users found in database`);
      }
    } catch (error: any) {
      console.log(`   ⚠️  Error: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ All service tests completed!');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testServices();
