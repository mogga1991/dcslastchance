import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { companyProfile } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Check if user has a company profile and has completed onboarding
    const [profile] = await db
      .select()
      .from(companyProfile)
      .where(eq(companyProfile.user_id, userId))
      .limit(1);

    return NextResponse.json({
      hasProfile: !!profile && profile.onboarding_completed === true,
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
