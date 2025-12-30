/**
 * Daily Sync + Match + Notify Workflow
 *
 * Unified cron job that:
 * 1. Syncs opportunities from SAM.gov
 * 2. Runs property matching immediately after sync
 * 3. Identifies new/updated matches
 * 4. Generates AI insights for perfect/high-quality matches
 * 5. Queues notifications
 * 6. Processes push notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncOpportunitiesFromSAM } from '@/lib/sync-opportunities';
import { matchPropertiesWithOpportunities } from '@/lib/scoring/match-properties';
import { NotificationQueue } from '@/lib/notifications/notification-queue';
import { AIMatchAnalyzer } from '@/lib/notifications/ai-match-analyzer';
import { PushNotificationService } from '@/lib/notifications/push-notification-service';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // 1. Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Starting daily sync + match + notify workflow...');
    const workflowStart = Date.now();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const anthropicKey = process.env.ANTHROPIC_API_KEY!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // STEP 1: Sync opportunities from SAM.gov
    console.log('\n📥 STEP 1: Syncing opportunities from SAM.gov...');
    const syncResult = await syncOpportunitiesFromSAM();

    if (!syncResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Sync failed',
        details: syncResult.message,
      }, { status: 500 });
    }

    console.log(`✅ Sync complete: ${syncResult.stats.inserted} new, ${syncResult.stats.updated} updated`);

    // STEP 2: Run property matching
    console.log('\n🎯 STEP 2: Running property matching...');
    const matchStats = await matchPropertiesWithOpportunities(
      supabaseUrl,
      serviceRoleKey,
      40  // Minimum score threshold
    );

    console.log(`✅ Matching complete: ${matchStats.matched} matches found`);

    // STEP 3: Identify new/updated matches (created/updated in last 5 minutes)
    console.log('\n🔔 STEP 3: Identifying new matches for notification...');
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: newMatches, error: matchError } = await supabase
      .from('property_matches')
      .select(`
        id,
        overall_score,
        grade,
        competitive,
        qualified,
        property_id,
        opportunity_id,
        score_breakdown,
        created_at,
        updated_at,
        broker_listings (
          id,
          user_id,
          street_address,
          city,
          state,
          available_sf,
          building_class,
          ada_compliant,
          has_fiber,
          has_backup_power,
          leed_certified,
          energy_star,
          parking_ratio
        ),
        opportunities (
          id,
          title,
          solicitation_number,
          response_deadline,
          pop_city_name,
          pop_state_code,
          office
        )
      `)
      .gte('created_at', fiveMinutesAgo)
      .order('overall_score', { ascending: false });

    if (matchError || !newMatches || newMatches.length === 0) {
      console.log('⚠️ No new matches found for notification');
      return NextResponse.json({
        success: true,
        message: 'Sync and matching complete, no new matches to notify',
        stats: { syncStats: syncResult.stats, matchStats },
      });
    }

    console.log(`📬 Found ${newMatches.length} new matches to notify`);

    // STEP 4: Categorize matches by tier
    const perfectMatches = newMatches.filter(m => m.grade === 'A' && m.overall_score >= 85 && m.competitive);
    const highQualityMatches = newMatches.filter(m => (m.grade === 'A' || m.grade === 'B') && m.overall_score >= 70 && !perfectMatches.includes(m));
    const standardMatches = newMatches.filter(m => m.overall_score >= 40 && !perfectMatches.includes(m) && !highQualityMatches.includes(m));

    console.log(`  Perfect matches (A, 85+): ${perfectMatches.length}`);
    console.log(`  High-quality matches (A/B, 70+): ${highQualityMatches.length}`);
    console.log(`  Standard matches (40+): ${standardMatches.length}`);

    // STEP 5: Generate AI insights for perfect + high-quality matches
    const aiCandidates = [...perfectMatches, ...highQualityMatches];
    const insights = new Map<string, any>();

    if (aiCandidates.length > 0 && anthropicKey) {
      console.log(`\n🤖 STEP 5: Generating AI insights for ${aiCandidates.length} top matches...`);

      const analyzer = new AIMatchAnalyzer(anthropicKey, supabaseUrl, serviceRoleKey);

      const analysisInputs = aiCandidates.map(match => ({
        propertyId: match.property_id,
        opportunityId: match.opportunity_id,
        matchScore: match.overall_score,
        grade: match.grade,
        factors: match.score_breakdown?.factors || {},
        property: match.broker_listings,
        opportunity: match.opportunities,
      }));

      try {
        const aiInsights = await analyzer.analyzeTopMatches(analysisInputs, {
          concurrency: 2,
          delayMs: 500,
        });

        insights.clear();
        aiInsights.forEach((value, key) => {
          insights.set(key, value);
        });

        console.log(`✅ Generated ${insights.size} AI insights`);
      } catch (error) {
        console.error('⚠️ AI analysis failed:', error);
        // Continue without AI insights
      }
    }

    // STEP 6: Queue notifications
    console.log('\n📮 STEP 6: Queuing notifications...');
    const notificationQueue = new NotificationQueue(supabaseUrl, serviceRoleKey);

    let queuedCount = 0;

    // Perfect matches: Immediate push + in-app
    for (const match of perfectMatches) {
      const property = match.broker_listings;
      const insightKey = `${match.property_id}:${match.opportunity_id}`;
      const aiInsight = insights.get(insightKey);

      await notificationQueue.queue({
        userId: property.user_id,
        type: 'perfect_match',
        priority: 'urgent',
        title: '🎯 Perfect Match Found!',
        message: `Your property at ${property.street_address} is a ${match.overall_score}% match for "${match.opportunities.title}"`,
        actionLabel: 'View Match',
        actionUrl: `/dashboard/my-properties?match=${match.id}`,
        propertyId: match.property_id,
        opportunityId: match.opportunity_id,
        matchId: match.id,
        matchScore: match.overall_score,
        matchGrade: match.grade,
        aiInsight: aiInsight?.summary || null,
        aiGenerated: !!aiInsight,
      }, { sendPush: true });

      queuedCount++;
    }

    // High-quality matches: In-app only (or push if user prefers)
    for (const match of highQualityMatches) {
      const property = match.broker_listings;
      const insightKey = `${match.property_id}:${match.opportunity_id}`;
      const aiInsight = insights.get(insightKey);

      await notificationQueue.queue({
        userId: property.user_id,
        type: 'high_quality_match',
        priority: 'high',
        title: '🌟 High-Quality Match',
        message: `${property.street_address} matches "${match.opportunities.title}" (${match.overall_score}%)`,
        actionLabel: 'View Details',
        actionUrl: `/dashboard/my-properties?match=${match.id}`,
        propertyId: match.property_id,
        opportunityId: match.opportunity_id,
        matchId: match.id,
        matchScore: match.overall_score,
        matchGrade: match.grade,
        aiInsight: aiInsight?.summary || null,
        aiGenerated: !!aiInsight,
      }, { sendPush: false });  // User can enable in preferences

      queuedCount++;
    }

    // Standard matches: In-app only, low priority
    for (const match of standardMatches) {
      const property = match.broker_listings;

      await notificationQueue.queue({
        userId: property.user_id,
        type: 'new_match',
        priority: 'normal',
        title: 'New Match Found',
        message: `${property.street_address} matches "${match.opportunities.title}" (${match.overall_score}%)`,
        actionLabel: 'View',
        actionUrl: `/dashboard/my-properties?match=${match.id}`,
        propertyId: match.property_id,
        opportunityId: match.opportunity_id,
        matchId: match.id,
        matchScore: match.overall_score,
        matchGrade: match.grade,
      }, { sendPush: false });

      queuedCount++;
    }

    console.log(`✅ Queued ${queuedCount} notifications`);

    // STEP 7: Process push notifications
    console.log('\n📱 STEP 7: Processing push notifications...');
    const pushService = new PushNotificationService(supabaseUrl, serviceRoleKey);
    const pushResult = await pushService.processPendingNotifications();

    console.log(`✅ Push notifications: ${pushResult.sent} sent, ${pushResult.failed} failed`);

    const workflowDuration = Date.now() - workflowStart;

    return NextResponse.json({
      success: true,
      message: 'Daily sync + match + notify workflow complete',
      stats: {
        syncStats: syncResult.stats,
        matchStats,
        notifications: {
          perfect: perfectMatches.length,
          highQuality: highQualityMatches.length,
          standard: standardMatches.length,
          queued: queuedCount,
        },
        pushNotifications: pushResult,
        aiInsights: insights.size,
        durationMs: workflowDuration,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Workflow error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
