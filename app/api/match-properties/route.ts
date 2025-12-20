import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { matchPropertiesWithOpportunities } from '@/lib/scoring/match-properties';

/**
 * POST /api/match-properties
 *
 * Triggers batch matching of all active properties against GSA opportunities.
 * Protected endpoint - requires authentication.
 *
 * Returns stats about the matching operation.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    // 2. Get request body (optional parameters)
    const body = await request.json().catch(() => ({}));
    const minScore = body.minScore || 40;

    console.log(`🚀 Starting property matching triggered by user ${user.id}...`);

    // 3. Run batch matching using service role credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error - missing Supabase credentials' },
        { status: 500 }
      );
    }

    const stats = await matchPropertiesWithOpportunities(
      supabaseUrl,
      serviceRoleKey,
      minScore
    );

    // 4. Return results
    console.log(`✅ Matching complete:`, stats);

    return NextResponse.json({
      success: stats.errors.length === 0,
      stats: {
        processed: stats.processed,
        matched: stats.matched,
        skipped: stats.skipped,
        durationMs: stats.durationMs,
      },
      errors: stats.errors.length > 0 ? stats.errors : undefined,
    });
  } catch (error) {
    console.error('❌ Error in match-properties endpoint:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/match-properties
 *
 * Returns status/info about the matching system (for debugging)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Count current matches
    const { count: matchCount } = await supabase
      .from('property_matches')
      .select('*', { count: 'exact', head: true });

    // Count active properties
    const { count: propertyCount } = await supabase
      .from('broker_listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Count active opportunities
    const { count: opportunityCount } = await supabase
      .from('opportunities')
      .select('*', { count: 'exact', head: true })
      .eq('active', 'Yes')
      .gte('response_deadline', new Date().toISOString());

    return NextResponse.json({
      status: 'ready',
      stats: {
        totalMatches: matchCount || 0,
        activeProperties: propertyCount || 0,
        activeOpportunities: opportunityCount || 0,
      },
      endpoint: 'POST /api/match-properties to trigger matching',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
