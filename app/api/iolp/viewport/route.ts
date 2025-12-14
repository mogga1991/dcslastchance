import { NextRequest, NextResponse } from 'next/server';
import { iolpAdapter, type ViewportBounds } from '@/lib/iolp';

/**
 * GET /api/iolp/viewport
 * Returns GSA properties within map viewport bounds as GeoJSON-like structure
 *
 * Query params:
 * - swLat: number (southwest latitude)
 * - swLng: number (southwest longitude)
 * - neLat: number (northeast latitude)
 * - neLng: number (northeast longitude)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract and validate bounds
    const swLat = parseFloat(searchParams.get('swLat') || '');
    const swLng = parseFloat(searchParams.get('swLng') || '');
    const neLat = parseFloat(searchParams.get('neLat') || '');
    const neLng = parseFloat(searchParams.get('neLng') || '');

    if (isNaN(swLat) || isNaN(swLng) || isNaN(neLat) || isNaN(neLng)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid bounds parameters. Required: swLat, swLng, neLat, neLng'
        },
        { status: 400 }
      );
    }

    // Validate bounds
    if (swLat >= neLat || swLng >= neLng) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid bounds: southwest corner must be south and west of northeast corner'
        },
        { status: 400 }
      );
    }

    const bounds: ViewportBounds = { swLat, swLng, neLat, neLng };

    // Query IOLP data
    const properties = await iolpAdapter.getPropertiesInViewport(bounds);

    return NextResponse.json({
      success: true,
      data: properties,
      meta: {
        count: properties.features.length,
        bounds
      }
    });
  } catch (error) {
    console.error('Error fetching IOLP viewport data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch IOLP data',
        data: { features: [] }
      },
      { status: 500 }
    );
  }
}
