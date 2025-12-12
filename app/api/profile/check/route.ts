import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { companyProfile } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const result = await auth.api.getSession({
      headers: await headers(),
    });

    if (!result?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = result.session.userId;

    // Check if user has a company profile
    const [profile] = await db
      .select()
      .from(companyProfile)
      .where(eq(companyProfile.user_id, userId))
      .limit(1);

    return NextResponse.json({
      hasProfile: !!profile,
      profile: profile || null,
    });
  } catch (error) {
    console.error("Error checking profile:", error);
    return NextResponse.json(
      { error: "Failed to check profile" },
      { status: 500 }
    );
  }
}
