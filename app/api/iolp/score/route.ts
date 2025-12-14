import { NextRequest, NextResponse } from 'next/server';
import { iolpAdapter } from '@/lib/iolp';

/**
 * GET /api/iolp/score
 * Returns Federal Neighborhood Score only (lighter endpoint)
 *
 * Query params:
 * - lat: number (latitude)
 * - lng: number (longitude)
 * - radiusMiles: number (optional, default 5)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract and validate coordinates
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radiusMiles = parseFloat(searchParams.get('radiusMiles') || '5');

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid coordinates. Required: lat, lng'
        },
        { status: 400 }
      );
    }

    // Validate latitude and longitude ranges
    if (lat < -90 || lat > 90) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid latitude: must be between -90 and 90'
        },
        { status: 400 }
      );
    }

    if (lng < -180 || lng > 180) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid longitude: must be between -180 and 180'
        },
        { status: 400 }
      );
    }

    if (isNaN(radiusMiles) || radiusMiles <= 0 || radiusMiles > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid radius: must be between 0 and 100 miles'
        },
        { status: 400 }
      );
    }

    // Calculate Federal Neighborhood Score
    const federalScore = await iolpAdapter.calculateFederalNeighborhoodScore(
      lat,
      lng,
      radiusMiles
    );

    return NextResponse.json({
      success: true,
      data: federalScore,
      meta: {
        location: { lat, lng },
        radiusMiles
      }
    });
  } catch (error) {
    console.error('Error calculating federal score:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate federal score',
        data: {
          score: 0,
          totalProperties: 0,
          leasedProperties: 0,
          ownedProperties: 0,
          totalRSF: 0,
          vacantRSF: 0,
          density: 0,
          percentile: 0
        }
      },
      { status: 500 }
    );
  }
}
