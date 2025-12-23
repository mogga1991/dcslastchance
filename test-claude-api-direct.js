/**
 * Direct Claude API Test
 *
 * Tests that the Claude Sonnet API works with the provided key
 * and demonstrates requirement extraction capability
 *
 * Usage: node test-claude-api-direct.js
 */

require('dotenv').config({ path: '.env.local' });
const Anthropic = require('@anthropic-ai/sdk');

const EXTRACTION_PROMPT = `You are an expert at analyzing GSA lease solicitations. Extract requirements from the description below and return ONLY valid JSON.

Return this structure:
{
  "location": {
    "state": "DC",
    "city": "Washington",
    "delineatedArea": "extracted area description or null"
  },
  "space": {
    "minSqFt": number,
    "maxSqFt": number,
    "targetSqFt": number
  },
  "building": {
    "buildingClass": ["A"],
    "adaRequired": true/false,
    "scifRequired": true/false,
    "certifications": ["LEED Gold"]
  },
  "confidence": {
    "overall": 0-100
  }
}`;

const sampleOpportunity = {
  title: 'Office Space Lease - Washington DC',
  description: `
    GSA seeks approximately 75,000 rentable square feet (RSF) of Class A
    office space in downtown Washington, DC.

    Location: Within Washington, DC, preferably within 0.5 miles of Metro Center

    Space Requirements:
    - Minimum: 70,000 RSF
    - Maximum: 80,000 RSF
    - Space must be contiguous

    Building Requirements:
    - Class A office building
    - ADA compliant required
    - LEED Gold certification preferred
    - SCIF capability NOT required

    Occupancy: July 1, 2025
    Lease term: 10 years firm, 5 years option
  `,
  state: 'DC'
};

async function testClaudeAPI() {
  console.log('🧪 Testing Claude Sonnet API\n');
  console.log('================================================\n');

  // Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('❌ ERROR: ANTHROPIC_API_KEY not found in .env.local');
    process.exit(1);
  }

  console.log('✅ API key found');
  console.log(`   Key prefix: ${apiKey.substring(0, 20)}...`);
  console.log('');

  // Initialize client
  console.log('🤖 Initializing Anthropic client...');
  const anthropic = new Anthropic({ apiKey });
  console.log('✅ Client initialized\n');

  // Build message
  const userMessage = `${EXTRACTION_PROMPT}\n\n---\n\nTitle: ${sampleOpportunity.title}\n\nDescription:\n${sampleOpportunity.description}`;

  console.log('📤 Sending request to Claude...');
  console.log(`   Model: claude-3-opus-20240229`);
  console.log(`   Max tokens: 1024`);
  console.log('');

  const startTime = Date.now();

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229', // Using Claude 3 Opus
      max_tokens: 1024,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    const duration = Date.now() - startTime;

    console.log('✅ Response received\n');
    console.log('================================================');
    console.log('📊 API RESPONSE METADATA');
    console.log('================================================\n');

    console.log(`Model: ${response.model}`);
    console.log(`ID: ${response.id}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Stop reason: ${response.stop_reason}`);
    console.log('');

    console.log('Token Usage:');
    console.log(`  Input tokens:  ${response.usage.input_tokens}`);
    console.log(`  Output tokens: ${response.usage.output_tokens}`);
    console.log(`  Total tokens:  ${response.usage.input_tokens + response.usage.output_tokens}`);
    console.log('');

    // Calculate cost
    const inputCost = (response.usage.input_tokens / 1_000_000) * 3.0;
    const outputCost = (response.usage.output_tokens / 1_000_000) * 15.0;
    const totalCost = inputCost + outputCost;

    console.log('Cost Breakdown:');
    console.log(`  Input cost:  $${inputCost.toFixed(6)} ($3.00/1M tokens)`);
    console.log(`  Output cost: $${outputCost.toFixed(6)} ($15.00/1M tokens)`);
    console.log(`  Total cost:  $${totalCost.toFixed(6)}`);
    console.log('');

    // Monthly projection
    const monthlyCost = totalCost * 500;
    console.log(`Projected monthly cost (500 extractions):`);
    console.log(`  $${monthlyCost.toFixed(2)}/month`);

    const budgetStatus = monthlyCost <= 100 ? '✅' : '⚠️';
    console.log(`  ${budgetStatus} Budget target ($100/month): ${monthlyCost <= 100 ? 'WITHIN BUDGET' : 'OVER BUDGET'}`);
    console.log('');

    console.log('================================================');
    console.log('📋 EXTRACTED CONTENT');
    console.log('================================================\n');

    // Get the text content
    const textContent = response.content.find(c => c.type === 'text');

    if (!textContent) {
      console.error('❌ No text content in response');
      process.exit(1);
    }

    console.log('Raw response:');
    console.log(textContent.text);
    console.log('');

    // Try to parse as JSON
    console.log('================================================');
    console.log('🔍 PARSING EXTRACTED REQUIREMENTS');
    console.log('================================================\n');

    let jsonText = textContent.text.trim();

    // Clean markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }

    try {
      const extracted = JSON.parse(jsonText.trim());

      console.log('✅ Successfully parsed JSON\n');
      console.log('Extracted Requirements:');
      console.log('');

      console.log('Location:');
      console.log(`  State: ${extracted.location.state}`);
      console.log(`  City: ${extracted.location.city || 'null'}`);
      console.log(`  Delineated Area: ${extracted.location.delineatedArea || 'null'}`);
      console.log('');

      console.log('Space:');
      console.log(`  Min: ${extracted.space.minSqFt?.toLocaleString() || 'null'} SF`);
      console.log(`  Max: ${extracted.space.maxSqFt?.toLocaleString() || 'null'} SF`);
      console.log(`  Target: ${extracted.space.targetSqFt?.toLocaleString() || 'null'} SF`);
      console.log('');

      console.log('Building:');
      console.log(`  Classes: ${JSON.stringify(extracted.building.buildingClass)}`);
      console.log(`  ADA Required: ${extracted.building.adaRequired}`);
      console.log(`  SCIF Required: ${extracted.building.scifRequired}`);
      console.log(`  Certifications: ${JSON.stringify(extracted.building.certifications || [])}`);
      console.log('');

      console.log('Confidence:');
      console.log(`  Overall: ${extracted.confidence.overall}%`);
      console.log('');

      // Validate results
      console.log('================================================');
      console.log('✅ VALIDATION');
      console.log('================================================\n');

      const checks = [];

      // Check delineated area extraction
      if (extracted.location.delineatedArea && extracted.location.delineatedArea.includes('Metro Center')) {
        checks.push('✅ Delineated area correctly extracted');
      } else {
        checks.push('⚠️  Delineated area: ' + (extracted.location.delineatedArea || 'null'));
      }

      // Check space requirements
      if (extracted.space.minSqFt === 70000 && extracted.space.maxSqFt === 80000) {
        checks.push('✅ Space requirements correct');
      } else {
        checks.push(`⚠️  Space: ${extracted.space.minSqFt} - ${extracted.space.maxSqFt} (expected 70,000 - 80,000)`);
      }

      // Check building class
      if (extracted.building.buildingClass.includes('A')) {
        checks.push('✅ Building class correctly identified');
      } else {
        checks.push('⚠️  Building class: ' + JSON.stringify(extracted.building.buildingClass));
      }

      // Check SCIF (should be false)
      if (extracted.building.scifRequired === false) {
        checks.push('✅ SCIF negation correctly handled');
      } else {
        checks.push('⚠️  SCIF: ' + extracted.building.scifRequired + ' (should be false)');
      }

      // Check confidence
      if (extracted.confidence.overall >= 90) {
        checks.push('✅ Confidence meets 90% target');
      } else {
        checks.push(`⚠️  Confidence: ${extracted.confidence.overall}% (target: ≥90%)`);
      }

      checks.forEach(check => console.log(check));
      console.log('');

      // Final verdict
      console.log('================================================');
      console.log('🎬 FINAL VERDICT');
      console.log('================================================\n');

      const passedChecks = checks.filter(c => c.startsWith('✅')).length;
      const totalChecks = checks.length;

      if (passedChecks === totalChecks && monthlyCost <= 100) {
        console.log('✅ AI EXTRACTION SYSTEM WORKING PERFECTLY\n');
        console.log(`   ✓ All validation checks passed (${passedChecks}/${totalChecks})`);
        console.log(`   ✓ Cost within budget ($${monthlyCost.toFixed(2)}/month)`);
        console.log('   ✓ Handles complex extractions (delineated areas)');
        console.log('   ✓ Handles negations correctly (SCIF not required)');
        console.log('');
        console.log('🚀 READY FOR PRODUCTION DEPLOYMENT');
      } else if (passedChecks >= totalChecks * 0.8) {
        console.log('⚠️  AI EXTRACTION WORKING WITH MINOR ISSUES\n');
        console.log(`   Passed: ${passedChecks}/${totalChecks} checks`);
        console.log('   May need prompt refinement for edge cases');
      } else {
        console.log('❌ AI EXTRACTION NEEDS IMPROVEMENT\n');
        console.log(`   Only ${passedChecks}/${totalChecks} checks passed`);
        console.log('   Review prompt and examples');
      }

    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError.message);
      console.error('\nRaw text:', jsonText);
    }

  } catch (error) {
    console.error('❌ API request failed:', error.message);

    if (error.status) {
      console.error(`   HTTP Status: ${error.status}`);
    }

    if (error.error) {
      console.error('   Error details:', JSON.stringify(error.error, null, 2));
    }

    process.exit(1);
  }

  console.log('\n================================================\n');
}

// Run the test
testClaudeAPI().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
