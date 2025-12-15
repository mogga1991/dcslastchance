import { NextRequest, NextResponse } from "next/server";
import { iolpAdapter } from "@/lib/iolp";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract parameters
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radiusMiles = parseFloat(searchParams.get("radiusMiles") || "5");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Missing lat/lng parameters" },
        { status: 400 }
      );
    }

    if (radiusMiles < 0.1 || radiusMiles > 50) {
      return NextResponse.json(
        { error: "radiusMiles must be between 0.1 and 50" },
        { status: 400 }
      );
    }

    // Fetch nearby properties and calculate score in parallel
    const [properties, score] = await Promise.all([
      iolpAdapter.getPropertiesNearby(lat, lng, radiusMiles),
      iolpAdapter.calculateFederalNeighborhoodScore(lat, lng, radiusMiles)
    ]);

    return NextResponse.json({
      success: true,
      location: { lat, lng },
      radiusMiles,
      properties: properties.features,
      neighborhoodScore: score
    });
  } catch (error) {
    console.error("Error fetching nearby IOLP properties:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch nearby properties"
      },
      { status: 500 }
    );
  }
}
