import { NextRequest, NextResponse } from "next/server";
import { iolpAdapter } from "@/lib/iolp";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract parameters
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const radiusMiles = parseFloat(searchParams.get("radiusMiles") || "5");

    // ✅ FIXED: Use isNaN() to properly validate coordinates (lat=0 and lng=0 are valid!)
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Missing or invalid lat/lng parameters" },
        { status: 400 }
      );
    }

    // Calculate Federal Neighborhood Score
    const score = await iolpAdapter.calculateFederalNeighborhoodScore(lat, lng, radiusMiles);

    return NextResponse.json({
      success: true,
      location: { lat, lng },
      radiusMiles,
      ...score
    });
  } catch (error) {
    console.error("Error calculating Federal Neighborhood Score:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to calculate score"
      },
      { status: 500 }
    );
  }
}
