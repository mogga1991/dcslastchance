import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, AuthError } from "@/lib/auth-guards";
import { getCredits, getTotalCredits, addCredits } from "@/lib/services";

// GET /api/credits - Get user's credits
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const [credits, total] = await Promise.all([
      getCredits(session.userId),
      getTotalCredits(session.userId),
    ]);

    return NextResponse.json({ credits, total });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/credits - Add credits (ADMIN ONLY)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    // 🚨 CRITICAL FIX - Only admins can add credits
    await requireAdmin(session.userId);

    const body = await request.json();

    // Validate required fields
    if (!body.total_credits || body.total_credits <= 0) {
      return NextResponse.json(
        { error: "total_credits is required and must be positive" },
        { status: 400 }
      );
    }

    const credit = await addCredits({
      user_id: body.user_id || session.userId, // Allow admin to add to any user
      credit_type: body.credit_type || "one_time",
      total_credits: body.total_credits,
      expires_at: body.expires_at ? new Date(body.expires_at) : undefined,
    });

    return NextResponse.json({ credit }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Error adding credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
