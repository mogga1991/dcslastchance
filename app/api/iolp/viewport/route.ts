import { NextRequest, NextResponse } from "next/server";
import { iolpAdapter } from "@/lib/iolp";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract viewport bounds
    const swLat = parseFloat(searchParams.get("swLat") || "0");
    const swLng = parseFloat(searchParams.get("swLng") || "0");
    const neLat = parseFloat(searchParams.get("neLat") || "0");
    const neLng = parseFloat(searchParams.get("neLng") || "0");

    if (!swLat || !swLng || !neLat || !neLng) {
      return NextResponse.json(
        { error: "Missing viewport bounds parameters" },
        { status: 400 }
      );
    }

    // Fetch properties in viewport
    const properties = await iolpAdapter.getPropertiesInViewport({
      swLat,
      swLng,
      neLat,
      neLng
    });

    return NextResponse.json({
      success: true,
      count: properties.features.length,
      data: properties // Return the full FeatureCollection as "data"
    });
  } catch (error) {
    console.error("Error fetching IOLP viewport data:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch IOLP viewport data"
      },
      { status: 500 }
    );
  }
}
