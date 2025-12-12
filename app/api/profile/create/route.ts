import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { organization, companyProfile, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { addCredits } from "@/lib/services";

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const result = await auth.api.getSession({
      headers: await headers(),
    });

    if (!result?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = result.session.userId;
    const data = await req.json();

    // ✅ STEP 1: Create Organization
    // Use company_name if provided, otherwise generate from NAICS
    const orgName = data.company_name || `${data.primary_naics} Company`;

    const [org] = await db
      .insert(organization)
      .values({
        name: orgName,
        owner_id: userId,
      })
      .returning();

    // ✅ STEP 2: Update User with organization_id and role
    await db
      .update(user)
      .set({
        organization_id: org.id,
        role: "contractor", // Default role for self-signup
      })
      .where(eq(user.id, userId));

    // ✅ STEP 3: Grant initial credits (3 free analyses)
    await addCredits({
      user_id: userId,
      credit_type: "one_time",
      total_credits: 3,
    });

    // ✅ STEP 4: Create company profile (linked to org)
    const [profile] = await db
      .insert(companyProfile)
      .values({
        user_id: userId,
        organization_id: org.id, // Link to organization
        primary_naics: data.primary_naics,
        naics_codes: data.naics_codes || [],
        core_competencies: data.core_competencies || [],
        keywords: data.keywords || [],
        service_areas: data.service_areas || [],
        certifications: data.certifications || [],
        set_asides: data.set_asides || [],
        is_small_business: data.is_small_business ?? true,
        employee_count: data.employee_count,
        annual_revenue: data.annual_revenue?.toString(),
        preferred_agencies: data.preferred_agencies || [],
        excluded_agencies: data.excluded_agencies || [],
        min_contract_value: data.min_contract_value?.toString() || "0",
        max_contract_value: data.max_contract_value?.toString() || "999999999",
        preferred_states: data.preferred_states || [],
        remote_work_capable: data.remote_work_capable ?? true,
        current_contracts: 0,
        max_concurrent_contracts: data.max_concurrent_contracts || 10,
      })
      .returning();

    return NextResponse.json({
      success: true,
      profile,
      organization: {
        id: org.id,
        name: org.name,
      },
      credits_granted: 3,
      message: "Profile created successfully! You have 3 free analyses to get started.",
    });
  } catch (error) {
    console.error("Error creating company profile:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}
