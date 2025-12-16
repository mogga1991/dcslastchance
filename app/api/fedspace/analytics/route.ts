/**
 * FedSpace Analytics API Endpoint
 *
 * Provides insights into:
 * - Federal score distribution
 * - Match score performance
 * - Early termination efficiency
 * - Top performing properties
 *
 * GET /api/fedspace/analytics?type=federal_scores|match_scores|early_termination|top_properties
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Some analytics require authentication
    const requiresAuth = ['top_properties', 'my_properties'];
    if (requiresAuth.includes(type) && !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let data: any = {};

    switch (type) {
      case 'federal_scores':
        data = await getFederalScoreAnalytics(supabase);
        break;

      case 'match_scores':
        data = await getMatchScoreAnalytics(supabase);
        break;

      case 'early_termination':
        data = await getEarlyTerminationAnalytics(supabase);
        break;

      case 'top_properties':
        data = await getTopPropertiesAnalytics(supabase);
        break;

      case 'my_properties':
        if (!user) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
          );
        }
        data = await getMyPropertiesAnalytics(supabase, user.id);
        break;

      case 'all':
        data = {
          federalScores: await getFederalScoreAnalytics(supabase),
          matchScores: await getMatchScoreAnalytics(supabase),
          earlyTermination: await getEarlyTerminationAnalytics(supabase),
        };
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid analytics type. Valid types: federal_scores, match_scores, early_termination, top_properties, my_properties, all',
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      data,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ==================== Analytics Functions ====================

async function getFederalScoreAnalytics(supabase: any) {
  // Get score distribution
  const { data: distribution } = await supabase
    .from('federal_score_distribution')
    .select('*');

  // Get summary stats
  const { data: scores } = await supabase
    .from('federal_neighborhood_scores')
    .select('overall_score, grade, total_properties, total_rsf, expiring_leases_count')
    .gt('expires_at', new Date().toISOString());

  const summary = {
    totalCached: scores?.length || 0,
    averageScore: scores?.reduce((sum, s) => sum + parseFloat(s.overall_score), 0) / (scores?.length || 1),
    averageProperties: scores?.reduce((sum, s) => sum + (s.total_properties || 0), 0) / (scores?.length || 1),
    totalRSF: scores?.reduce((sum, s) => sum + (s.total_rsf || 0), 0),
    totalExpiringLeases: scores?.reduce((sum, s) => sum + (s.expiring_leases_count || 0), 0),
  };

  return {
    distribution,
    summary,
  };
}

async function getMatchScoreAnalytics(supabase: any) {
  // Get score distribution
  const { data: distribution } = await supabase
    .from('match_score_distribution')
    .select('*');

  // Get summary stats
  const { data: scores } = await supabase
    .from('property_match_scores')
    .select('overall_score, grade, qualified, competitive, computation_time_ms, early_terminated')
    .gt('expires_at', new Date().toISOString());

  const summary = {
    totalCached: scores?.length || 0,
    averageScore: scores?.reduce((sum, s) => sum + parseFloat(s.overall_score), 0) / (scores?.length || 1),
    qualifiedPercentage: (scores?.filter(s => s.qualified).length || 0) / (scores?.length || 1) * 100,
    competitivePercentage: (scores?.filter(s => s.competitive).length || 0) / (scores?.length || 1) * 100,
    earlyTerminationRate: (scores?.filter(s => s.early_terminated).length || 0) / (scores?.length || 1) * 100,
    averageComputationMs: scores?.reduce((sum, s) => sum + (s.computation_time_ms || 0), 0) / (scores?.length || 1),
  };

  // Grade breakdown
  const gradeBreakdown = {
    A: scores?.filter(s => s.grade === 'A').length || 0,
    B: scores?.filter(s => s.grade === 'B').length || 0,
    C: scores?.filter(s => s.grade === 'C').length || 0,
    D: scores?.filter(s => s.grade === 'D').length || 0,
    F: scores?.filter(s => s.grade === 'F').length || 0,
  };

  return {
    distribution,
    summary,
    gradeBreakdown,
  };
}

async function getEarlyTerminationAnalytics(supabase: any) {
  // Get early termination stats from view
  const { data: analytics } = await supabase
    .from('early_termination_analytics')
    .select('*');

  // Get detailed breakdown
  const { data: terminated } = await supabase
    .from('property_match_scores')
    .select('failed_constraint, computation_saved_pct, computation_time_ms')
    .eq('early_terminated', true)
    .gt('expires_at', new Date().toISOString());

  const summary = {
    totalTerminated: terminated?.length || 0,
    averageComputationSaved: terminated?.reduce((sum, t) => sum + (t.computation_saved_pct || 0), 0) / (terminated?.length || 1),
    averageTerminationTimeMs: terminated?.reduce((sum, t) => sum + (t.computation_time_ms || 0), 0) / (terminated?.length || 1),
  };

  // Calculate actual disqualification rates from data
  const constraintCounts = {
    STATE_MATCH: 0,
    RSF_MINIMUM: 0,
    SET_ASIDE: 0,
    ADA: 0,
    CLEARANCE: 0,
  };

  terminated?.forEach(t => {
    if (t.failed_constraint && constraintCounts.hasOwnProperty(t.failed_constraint)) {
      constraintCounts[t.failed_constraint as keyof typeof constraintCounts]++;
    }
  });

  const total = terminated?.length || 1;
  const actualRates = {
    STATE_MATCH: Math.round((constraintCounts.STATE_MATCH / total) * 100),
    RSF_MINIMUM: Math.round((constraintCounts.RSF_MINIMUM / total) * 100),
    SET_ASIDE: Math.round((constraintCounts.SET_ASIDE / total) * 100),
    ADA: Math.round((constraintCounts.ADA / total) * 100),
    CLEARANCE: Math.round((constraintCounts.CLEARANCE / total) * 100),
  };

  return {
    analytics,
    summary,
    actualDisqualificationRates: actualRates,
    efficiency: {
      expectedComputationSaved: 73, // Patent claim
      actualComputationSaved: summary.averageComputationSaved,
      verification: Math.abs(73 - summary.averageComputationSaved) < 10 ? 'VERIFIED' : 'NEEDS_TUNING',
    },
  };
}

async function getTopPropertiesAnalytics(supabase: any) {
  const { data: topProperties } = await supabase
    .from('top_performing_properties')
    .select('*')
    .limit(20);

  return {
    topProperties: topProperties || [],
  };
}

async function getMyPropertiesAnalytics(supabase: any, userId: string) {
  // Get user's properties
  const { data: properties } = await supabase
    .from('broker_listings')
    .select('id, street_address, city, state, federal_score')
    .eq('user_id', userId);

  if (!properties || properties.length === 0) {
    return {
      properties: [],
      summary: {
        totalProperties: 0,
        averageFederalScore: 0,
        averageMatchScore: 0,
        competitiveMatches: 0,
      },
    };
  }

  const propertyIds = properties.map(p => p.id);

  // Get match scores for user's properties
  const { data: matchScores } = await supabase
    .from('property_match_scores')
    .select('property_id, overall_score, competitive, qualified')
    .in('property_id', propertyIds)
    .gt('expires_at', new Date().toISOString());

  // Calculate analytics per property
  const propertiesWithAnalytics = properties.map(property => {
    const propertyMatches = matchScores?.filter(m => m.property_id === property.id) || [];

    return {
      ...property,
      matchCount: propertyMatches.length,
      averageMatchScore: propertyMatches.reduce((sum, m) => sum + parseFloat(m.overall_score), 0) / (propertyMatches.length || 1),
      competitiveMatches: propertyMatches.filter(m => m.competitive).length,
      qualifiedMatches: propertyMatches.filter(m => m.qualified).length,
    };
  });

  const summary = {
    totalProperties: properties.length,
    averageFederalScore: properties.reduce((sum, p) => sum + (p.federal_score || 0), 0) / properties.length,
    averageMatchScore: matchScores?.reduce((sum, m) => sum + parseFloat(m.overall_score), 0) / (matchScores?.length || 1),
    competitiveMatches: matchScores?.filter(m => m.competitive).length || 0,
    totalMatches: matchScores?.length || 0,
  };

  return {
    properties: propertiesWithAnalytics,
    summary,
  };
}

/**
 * POST: Clear expired cache entries
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Call cleanup function
    const { data, error } = await supabase.rpc('cleanup_expired_cache');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      deletedCount: data,
      message: `Cleaned up ${data} expired cache entries`,
    });
  } catch (error) {
    console.error('Error cleaning up cache:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
