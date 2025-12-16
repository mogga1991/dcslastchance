/**
 * Federal Neighborhood Score API Endpoint
 *
 * PATENT #1: 6-factor weighted federal leasing potential score (0-100)
 * Uses R-Tree spatial indexing for O(log n) query performance
 *
 * GET /api/fedspace/neighborhood-score?lat=38.8977&lng=-77.0365&radius=5
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateFederalNeighborhoodScore } from '@/lib/fedspace';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') ?? '5';

    // Validate required parameters
    if (!lat || !lng) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: lat, lng',
        },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusMiles = parseFloat(radius);

    // Validate numeric values
    if (
      isNaN(latitude) ||
      isNaN(longitude) ||
      isNaN(radiusMiles) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180 ||
      radiusMiles <= 0 ||
      radiusMiles > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid parameters: lat (-90 to 90), lng (-180 to 180), radius (0-100 miles)',
        },
        { status: 400 }
      );
    }

    // Check cache first
    const supabase = await createClient();
    const { data: cached, error: cacheError } = await supabase
      .from('federal_neighborhood_scores')
      .select('score_data, hit_count')
      .eq('latitude', latitude)
      .eq('longitude', longitude)
      .eq('radius_miles', radiusMiles)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cached && !cacheError) {
      // Update hit count
      await supabase
        .from('federal_neighborhood_scores')
        .update({
          hit_count: (cached.hit_count || 0) + 1,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('latitude', latitude)
        .eq('longitude', longitude)
        .eq('radius_miles', radiusMiles);

      return NextResponse.json({
        success: true,
        data: cached.score_data,
        cached: true,
      });
    }

    // Calculate new score
    const score = await calculateFederalNeighborhoodScore(
      latitude,
      longitude,
      radiusMiles
    );

    // Store in cache
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await supabase.from('federal_neighborhood_scores').upsert(
      {
        latitude,
        longitude,
        radius_miles: radiusMiles,
        score_data: score,
        overall_score: score.score,
        grade: score.grade,
        percentile: score.percentile,
        total_properties: score.metrics.totalProperties,
        leased_properties: score.metrics.leasedProperties,
        owned_properties: score.metrics.ownedProperties,
        total_rsf: score.metrics.totalRSF,
        expiring_leases_count: score.metrics.expiringLeasesCount,
        expires_at: expiresAt.toISOString(),
      },
      {
        onConflict: 'latitude,longitude,radius_miles',
      }
    );

    return NextResponse.json({
      success: true,
      data: score,
      cached: false,
    });
  } catch (error) {
    console.error('Error calculating federal neighborhood score:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/fedspace/neighborhood-score
 * Batch calculate scores for multiple locations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locations } = body;

    if (!Array.isArray(locations) || locations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Body must contain an array of locations',
        },
        { status: 400 }
      );
    }

    if (locations.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Maximum 50 locations per batch request',
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const results = [];

    for (const location of locations) {
      const { latitude, longitude, radiusMiles = 5 } = location;

      // Validate
      if (
        !latitude ||
        !longitude ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        results.push({
          latitude,
          longitude,
          success: false,
          error: 'Invalid coordinates',
        });
        continue;
      }

      // Check cache
      const { data: cached, error: cacheError } = await supabase
        .from('federal_neighborhood_scores')
        .select('score_data')
        .eq('latitude', latitude)
        .eq('longitude', longitude)
        .eq('radius_miles', radiusMiles)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (cached && !cacheError) {
        results.push({
          latitude,
          longitude,
          success: true,
          data: cached.score_data,
          cached: true,
        });
        continue;
      }

      // Calculate new score
      try {
        const score = await calculateFederalNeighborhoodScore(
          latitude,
          longitude,
          radiusMiles
        );

        // Store in cache
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await supabase.from('federal_neighborhood_scores').upsert(
          {
            latitude,
            longitude,
            radius_miles: radiusMiles,
            score_data: score,
            overall_score: score.score,
            grade: score.grade,
            percentile: score.percentile,
            total_properties: score.metrics.totalProperties,
            leased_properties: score.metrics.leasedProperties,
            owned_properties: score.metrics.ownedProperties,
            total_rsf: score.metrics.totalRSF,
            expiring_leases_count: score.metrics.expiringLeasesCount,
            expires_at: expiresAt.toISOString(),
          },
          {
            onConflict: 'latitude,longitude,radius_miles',
          }
        );

        results.push({
          latitude,
          longitude,
          success: true,
          data: score,
          cached: false,
        });
      } catch (error) {
        results.push({
          latitude,
          longitude,
          success: false,
          error: error instanceof Error ? error.message : 'Calculation failed',
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error in batch neighborhood score calculation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
