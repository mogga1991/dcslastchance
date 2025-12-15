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
