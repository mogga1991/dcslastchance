/**
 * Test script for the new services layer
 * Run with: node test-services.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

// Import services using dynamic import
async function testServices() {
  console.log('🧪 Testing Services Layer\n');
  console.log('='.repeat(50));

  try {
    // Dynamically import the modules
    const { UserService, OpportunityService, AnalysisService, CreditService } = await import('./lib/services.ts');

    console.log('\n✅ Successfully imported services');

    // Test 1: Get a user (if exists)
    console.log('\n📋 Test 1: UserService.getByEmail()');
    try {
      const testEmail = 'test@example.com';
      const user = await UserService.getByEmail(testEmail);
      if (user) {
        console.log(`   Found user: ${user.name} (${user.email})`);
        console.log(`   Credits: ${user.analysis_credits || 0}`);
      } else {
        console.log(`   No user found with email: ${testEmail}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Error: ${error.message}`);
    }

    // Test 2: Get active opportunities
    console.log('\n📋 Test 2: OpportunityService.getActive()');
    try {
      const opportunities = await OpportunityService.getActive(5);
      console.log(`   Found ${opportunities.length} active opportunities`);
      if (opportunities.length > 0) {
        console.log(`   Latest: ${opportunities[0].title}`);
        console.log(`   Agency: ${opportunities[0].agency || 'N/A'}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Error: ${error.message}`);
    }

    // Test 3: Search opportunities
    console.log('\n📋 Test 3: OpportunityService.search()');
    try {
      const searchResults = await OpportunityService.search({
        keyword: 'IT',
        limit: 3
      });
      console.log(`   Found ${searchResults.length} opportunities matching "IT"`);
    } catch (error) {
      console.log(`   ⚠️  Error: ${error.message}`);
    }

    // Test 4: Count analyses
    console.log('\n📋 Test 4: AnalysisService queries');
    try {
      const { query } = await import('./lib/db.ts');
      const analysisCount = await query('SELECT COUNT(*) as count FROM analysis');
      console.log(`   Total analyses in database: ${analysisCount[0].count}`);
    } catch (error) {
      console.log(`   ⚠️  Error: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ All service tests completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

testServices();
