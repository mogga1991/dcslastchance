/**
 * Diagnostic script to analyze property-opportunity match scores
 * 
 * Run with: node diagnose-match-scores.js
 * 
 * This will:
 * 1. Show score breakdowns for top matches
 * 2. Identify which factors are consistently low
 * 3. Suggest fixes based on patterns found
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseScores() {
  console.log('🔍 Diagnosing property-opportunity match scores...\n');

  // Step 1: Get score breakdowns for top matches
  console.log('📊 STEP 1: Score Breakdown for Top 10 Matches');
  console.log('='.repeat(80));
  
  const { data: matches, error: matchesError } = await supabase
    .from('property_matches')
    .select(`
      overall_score,
      grade,
      location_score,
      space_score,
      building_score,
      timeline_score,
      experience_score,
      score_breakdown,
      opportunities:opportunity_id (
        title,
        state,
        city
      )
    `)
    .order('overall_score', { ascending: false })
    .limit(10);

  if (matchesError) {
    console.error('❌ Error fetching matches:', matchesError);
    return;
  }

  if (!matches || matches.length === 0) {
    console.log('⚠️  No matches found');
    return;
  }

  console.log(`Found ${matches.length} matches\n`);

  matches.forEach((match, idx) => {
    const opp = match.opportunities;
    console.log(`\nMatch #${idx + 1} - Score: ${match.overall_score} (${match.grade})`);
    console.log(`  Opportunity: ${opp?.title || 'N/A'}`);
    console.log(`  Location: ${opp?.city || 'N/A'}, ${opp?.state || 'N/A'}`);
    console.log(`  Factor Scores:`);
    console.log(`    Location:   ${match.location_score} (weighted: ${(match.location_score * 0.30).toFixed(1)})`);
    console.log(`    Space:      ${match.space_score} (weighted: ${(match.space_score * 0.25).toFixed(1)})`);
    console.log(`    Building:   ${match.building_score} (weighted: ${(match.building_score * 0.20).toFixed(1)})`);
    console.log(`    Timeline:   ${match.timeline_score} (weighted: ${(match.timeline_score * 0.15).toFixed(1)})`);
    console.log(`    Experience: ${match.experience_score} (weighted: ${(match.experience_score * 0.10).toFixed(1)})`);
    
    // Calculate expected total
    const expected = 
      (match.location_score * 0.30) +
      (match.space_score * 0.25) +
      (match.building_score * 0.20) +
      (match.timeline_score * 0.15) +
      (match.experience_score * 0.10);
    console.log(`  Expected: ${expected.toFixed(1)}, Actual: ${match.overall_score}`);
  });

  // Step 2: Calculate averages and identify patterns
  console.log('\n\n📈 STEP 2: Average Scores Across All Matches');
  console.log('='.repeat(80));

  const { data: allMatches, error: allError } = await supabase
    .from('property_matches')
    .select('location_score, space_score, building_score, timeline_score, experience_score, overall_score');

  if (allError) {
    console.error('❌ Error fetching all matches:', allError);
    return;
  }

  if (allMatches && allMatches.length > 0) {
    const totals = allMatches.reduce((acc, m) => ({
      location: acc.location + (m.location_score || 0),
      space: acc.space + (m.space_score || 0),
      building: acc.building + (m.building_score || 0),
      timeline: acc.timeline + (m.timeline_score || 0),
      experience: acc.experience + (m.experience_score || 0),
      overall: acc.overall + (m.overall_score || 0),
      count: acc.count + 1,
    }), { location: 0, space: 0, building: 0, timeline: 0, experience: 0, overall: 0, count: 0 });

    const averages = {
      location: totals.location / totals.count,
      space: totals.space / totals.count,
      building: totals.building / totals.count,
      timeline: totals.timeline / totals.count,
      experience: totals.experience / totals.count,
      overall: totals.overall / totals.count,
    };

    console.log(`\nAverages across ${totals.count} matches:`);
    console.log(`  Location:   ${averages.location.toFixed(1)} (avg weighted: ${(averages.location * 0.30).toFixed(1)})`);
    console.log(`  Space:      ${averages.space.toFixed(1)} (avg weighted: ${(averages.space * 0.25).toFixed(1)})`);
    console.log(`  Building:   ${averages.building.toFixed(1)} (avg weighted: ${(averages.building * 0.20).toFixed(1)})`);
    console.log(`  Timeline:   ${averages.timeline.toFixed(1)} (avg weighted: ${(averages.timeline * 0.15).toFixed(1)})`);
    console.log(`  Experience: ${averages.experience.toFixed(1)} (avg weighted: ${(averages.experience * 0.10).toFixed(1)})`);
    console.log(`  Overall:    ${averages.overall.toFixed(1)}`);

    // Identify low factors
    console.log('\n🎯 STEP 3: Identifying Low-Scoring Factors');
    console.log('='.repeat(80));

    const issues = [];
    if (averages.location < 60) {
      issues.push({
        factor: 'Location',
        avg: averages.location,
        issue: 'Location scores are low - may be missing city/delineated area matches',
        impact: `Losing ${((70 - averages.location) * 0.30).toFixed(1)} points on average`,
      });
    }
    if (averages.space < 70) {
      issues.push({
        factor: 'Space',
        avg: averages.space,
        issue: 'Space scores are low - properties may not meet size requirements',
        impact: `Losing ${((85 - averages.space) * 0.25).toFixed(1)} points on average`,
      });
    }
    if (averages.building < 60) {
      issues.push({
        factor: 'Building',
        avg: averages.building,
        issue: 'Building scores are low - may be missing features or wrong class',
        impact: `Losing ${((70 - averages.building) * 0.20).toFixed(1)} points on average`,
      });
    }
    if (averages.timeline < 70) {
      issues.push({
        factor: 'Timeline',
        avg: averages.timeline,
        issue: 'Timeline scores are low - properties may not be available in time',
        impact: `Losing ${((85 - averages.timeline) * 0.15).toFixed(1)} points on average`,
      });
    }
    if (averages.experience < 50) {
      issues.push({
        factor: 'Experience',
        avg: averages.experience,
        issue: 'Experience scores are low - using default broker profile (no gov experience)',
        impact: `Losing ${((70 - averages.experience) * 0.10).toFixed(1)} points on average`,
      });
    }

    if (issues.length === 0) {
      console.log('\n✅ All factors are scoring reasonably well');
    } else {
      console.log('\n⚠️  Issues Found:');
      issues.forEach((issue, idx) => {
        console.log(`\n${idx + 1}. ${issue.factor} Factor (avg: ${issue.avg.toFixed(1)})`);
        console.log(`   Problem: ${issue.issue}`);
        console.log(`   Impact:  ${issue.impact} points`);
      });
    }
  }

  // Step 4: Check a sample match breakdown
  console.log('\n\n🔬 STEP 4: Detailed Breakdown for Top Match');
  console.log('='.repeat(80));

  if (matches && matches.length > 0 && matches[0].score_breakdown) {
    const topMatch = matches[0];
    const breakdown = topMatch.score_breakdown;
    
    if (breakdown.factors) {
      console.log('\nFactor Details:');
      Object.entries(breakdown.factors).forEach(([key, factor]) => {
        console.log(`\n${factor.name}:`);
        console.log(`  Score: ${factor.score}`);
        console.log(`  Weight: ${(factor.weight * 100).toFixed(0)}%`);
        console.log(`  Weighted: ${factor.weighted.toFixed(1)}`);
        if (factor.details && typeof factor.details === 'object') {
          console.log(`  Details:`, JSON.stringify(factor.details, null, 2));
        }
      });
    }
  }

  console.log('\n\n✅ Diagnosis complete!\n');
}

diagnoseScores().catch(console.error);
