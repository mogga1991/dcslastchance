import { NextRequest, NextResponse } from "next/server";
import { iolpAdapter } from "@/lib/iolp";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract parameters
    const monthsAhead = parseInt(searchParams.get("monthsAhead") || "24");
    const state = searchParams.get("state") || undefined;

    if (monthsAhead < 1 || monthsAhead > 60) {
      return NextResponse.json(
        { error: "monthsAhead must be between 1 and 60" },
        { status: 400 }
      );
    }

    // Fetch expiring leases
    const leases = await iolpAdapter.getExpiringLeases(monthsAhead, state);

    // Calculate days until expiration for each lease
    const leasesWithDays = leases.features.map(feature => {
      const expirationDate = feature.attributes.lease_expiration_date;
      let daysUntilExpiration = null;

      if (expirationDate) {
        const expDate = new Date(expirationDate);
        const now = new Date();
        const diff = expDate.getTime() - now.getTime();
        daysUntilExpiration = Math.round(diff / (24 * 60 * 60 * 1000));
      }

      return {
        ...feature.attributes,
        latitude: feature.geometry?.y,
        longitude: feature.geometry?.x,
        daysUntilExpiration,
        monthsUntilExpiration: daysUntilExpiration ? Math.round(daysUntilExpiration / 30) : null,
        urgency: daysUntilExpiration && daysUntilExpiration <= 180 ? 'critical' :
                 daysUntilExpiration && daysUntilExpiration <= 365 ? 'warning' : 'normal'
      };
    });

    // Group by urgency
    const grouped = {
      critical: leasesWithDays.filter(l => l.urgency === 'critical'),
      high: leasesWithDays.filter(l => l.urgency === 'warning'),
      medium: leasesWithDays.filter(l => l.urgency === 'normal'),
      low: [] as any[]
    };

    return NextResponse.json({
      success: true,
      data: {
        leases: leasesWithDays,
        grouped
      },
      meta: {
        count: leasesWithDays.length,
        monthsAhead,
        state: state || 'all'
      }
    });
  } catch (error) {
    console.error("Error fetching expiring leases:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch expiring leases"
      },
      { status: 500 }
    );
  }
}
