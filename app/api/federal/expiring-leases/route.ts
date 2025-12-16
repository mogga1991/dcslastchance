/**
 * Federal Expiring Leases API
 *
 * Returns federal leases expiring within a specified timeframe
 * Sorted by expiration date (soonest first)
 *
 * GET /api/federal/expiring-leases?months=24&state=DC&limit=50
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const months = parseInt(searchParams.get('months') || '24');
    const state = searchParams.get('state');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await createClient();

    // Calculate expiration date threshold
    const expirationThreshold = new Date();
    expirationThreshold.setMonth(expirationThreshold.getMonth() + months);

    // Build query
    let query = supabase
      .from('federal_buildings')
      .select('*', { count: 'exact' })
      .eq('property_type', 'leased')
      .not('lease_expiration_date', 'is', null)
      .gte('lease_expiration_date', new Date().toISOString())
      .lte('lease_expiration_date', expirationThreshold.toISOString())
      .order('lease_expiration_date', { ascending: true });

    // Optional state filter
    if (state) {
      query = query.eq('state', state.toUpperCase());
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: leases, error, count } = await query;

    if (error) {
      throw error;
    }

    // Calculate urgency and group by timeframe
    const now = new Date();
    const enrichedLeases = (leases || []).map((lease) => {
      const expirationDate = new Date(lease.lease_expiration_date);
      const daysUntilExpiration = Math.ceil(
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      const monthsUntilExpiration = Math.floor(daysUntilExpiration / 30);

      let urgency: 'critical' | 'high' | 'medium' | 'low';
      if (daysUntilExpiration <= 90) urgency = 'critical';
      else if (daysUntilExpiration <= 180) urgency = 'high';
      else if (daysUntilExpiration <= 365) urgency = 'medium';
      else urgency = 'low';

      return {
        ...lease,
        daysUntilExpiration,
        monthsUntilExpiration,
        urgency,
        expirationDate: lease.lease_expiration_date,
      };
    });

    // Group by urgency
    const summary = {
      critical: enrichedLeases.filter((l) => l.urgency === 'critical').length,
      high: enrichedLeases.filter((l) => l.urgency === 'high').length,
      medium: enrichedLeases.filter((l) => l.urgency === 'medium').length,
      low: enrichedLeases.filter((l) => l.urgency === 'low').length,
    };

    // Calculate total RSF expiring
    const totalExpiringRSF = enrichedLeases.reduce(
      (sum, lease) => sum + (lease.rsf || 0),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        leases: enrichedLeases,
        summary: {
          totalLeases: count || 0,
          showing: enrichedLeases.length,
          totalExpiringRSF,
          urgencyBreakdown: summary,
          filters: {
            months,
            state: state || 'all',
            limit,
            offset,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching expiring leases:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
