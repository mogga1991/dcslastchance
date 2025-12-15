import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  requireResourceOrgAccess,
  requireOwnershipOrAdmin,
  AuthError
} from "@/lib/auth-guards";
import { updateAnalysis } from "@/lib/services";
import { sql } from "@/lib/db";

// GET /api/analyses/[id] - Get single analysis
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // ✅ UPDATED - Allow viewing if user is in same org
    await requireResourceOrgAccess(session.userId, "analysis", id);

    const analysisResult = await sql`
      SELECT
        a.*,
        u.name as created_by_name,
        u.email as created_by_email,
        u.role as created_by_role
      FROM analysis a
      JOIN "user" u ON a.user_id = u.id
      WHERE a.id = ${id}
      LIMIT 1
    ` as any[];

    if (!analysisResult || analysisResult.length === 0) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ analysis: analysisResult[0] });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/analyses/[id] - Update analysis
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // ✅ UPDATED - Only owner or admin can edit
    await requireOwnershipOrAdmin(session.userId, "analysis", id);

    const body = await request.json();

    const analysis = await updateAnalysis(id, body);

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Error updating analysis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
