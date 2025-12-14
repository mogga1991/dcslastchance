import { NextRequest, NextResponse } from 'next/server';
import { iolpAdapter } from '@/lib/iolp';

type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

interface LeaseWithUrgency {
  feature: any;
  urgency: UrgencyLevel;
  monthsUntilExpiration: number;
}

/**
 * Calculate urgency level based on months until expiration
 */
function calculateUrgency(expirationDate: string): {
  urgency: UrgencyLevel;
  monthsUntilExpiration: number;
} {
  const today = new Date();
  const expiration = new Date(expirationDate);
  const monthsDiff = (expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);

  let urgency: UrgencyLevel;
  if (monthsDiff <= 6) {
    urgency = 'critical';
  } else if (monthsDiff <= 12) {
    urgency = 'high';
  } else if (monthsDiff <= 18) {
    urgency = 'medium';
  } else {
    urgency = 'low';
  }

  return {
    urgency,
    monthsUntilExpiration: Math.round(monthsDiff * 10) / 10
  };
}

/**
 * GET /api/iolp/expiring-leases
 * Returns GSA leases expiring within specified timeframe with urgency levels
 *
 * Query params:
 * - monthsAhead: number (optional, default 24)
 * - state: string (optional, two-letter state code)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract and validate parameters
    const monthsAhead = parseInt(searchParams.get('monthsAhead') || '24');
    const state = searchParams.get('state') || undefined;

    if (isNaN(monthsAhead) || monthsAhead <= 0 || monthsAhead > 120) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid monthsAhead: must be between 1 and 120'
        },
        { status: 400 }
      );
    }

    // Validate state code if provided
    if (state && state.length !== 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid state code: must be 2 characters (e.g., "VA", "DC")'
        },
        { status: 400 }
      );
    }

    // Fetch expiring leases
    const leases = await iolpAdapter.getExpiringLeases(
      monthsAhead,
      state?.toUpperCase()
    );

    // Add urgency levels to each lease
    const leasesWithUrgency: LeaseWithUrgency[] = leases.features
      .filter(f => f.attributes.lease_expiration_date)
      .map(feature => {
        const { urgency, monthsUntilExpiration } = calculateUrgency(
          feature.attributes.lease_expiration_date!
        );
        return {
          feature,
          urgency,
          monthsUntilExpiration
        };
      });

    // Group by urgency
    const grouped = {
      critical: leasesWithUrgency.filter(l => l.urgency === 'critical'),
      high: leasesWithUrgency.filter(l => l.urgency === 'high'),
      medium: leasesWithUrgency.filter(l => l.urgency === 'medium'),
      low: leasesWithUrgency.filter(l => l.urgency === 'low')
    };

    return NextResponse.json({
      success: true,
      data: {
        leases: leasesWithUrgency,
        grouped
      },
      meta: {
        total: leasesWithUrgency.length,
        monthsAhead,
        state: state?.toUpperCase(),
        counts: {
          critical: grouped.critical.length,
          high: grouped.high.length,
          medium: grouped.medium.length,
          low: grouped.low.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching expiring leases:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch expiring leases',
        data: {
          leases: [],
          grouped: {
            critical: [],
            high: [],
            medium: [],
            low: []
          }
        }
      },
      { status: 500 }
    );
  }
}
