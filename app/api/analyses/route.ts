import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireCredits, AuthError } from "@/lib/auth-guards";
import { createAnalysis } from "@/lib/services";
import { sql } from "@/lib/db";

// GET /api/analyses - Get organization's analyses
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // ✅ UPDATED - Show all analyses in user's organization
    const analyses = await sql`
      SELECT
        a.*,
        u.name as created_by_name,
        u.email as created_by_email
      FROM analysis a
      JOIN "user" u ON a.user_id = u.id
      WHERE u.organization_id = ${session.organizationId || session.userId}
      ORDER BY a."createdAt" DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({ analyses });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Error fetching analyses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/analyses - Create new analysis
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    // ✅ CRITICAL FIX - Check credits before creating
    await requireCredits(session.userId, 1);

    const body = await request.json();

    // Validate required fields
    if (!body.document_name && !body.document_url) {
      return NextResponse.json(
        { error: "document_name or document_url is required" },
        { status: 400 }
      );
    }

    const analysis = await createAnalysis({
      user_id: session.userId,
      organization_id: session.organizationId,
      document_type: body.document_type || "rfp",
      document_name: body.document_name,
      document_url: body.document_url,
      opportunity_id: body.opportunity_id,
    });

    // TODO: Trigger analysis processing
    // await triggerAnalysisProcessing(analysis.id);

    return NextResponse.json({ analysis }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Error creating analysis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
