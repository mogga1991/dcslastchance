import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { organization, companyProfile, user } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authUser.id;
    const data = await req.json();

    // ✅ STEP 0: Ensure user exists in database (create if not exists)
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      // Create user record in database
      await db
        .insert(user)
        .values({
          id: userId,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          role: 'contractor', // Default role
          account_manager_id: data.account_manager_id || null, // Link to account manager
        });
    } else {
      // Update existing user with account manager if provided
      if (data.account_manager_id) {
        await db
          .update(user)
          .set({
            account_manager_id: data.account_manager_id,
          })
          .where(eq(user.id, userId));
      }
    }

    // ✅ STEP 1: Create Organization
    const orgName = data.company_name || 'Unnamed Company';

    const [org] = await db
      .insert(organization)
      .values({
        name: orgName,
        owner_id: userId,
      })
      .returning();

    // ✅ STEP 2: Update User with organization_id
    await db
      .update(user)
      .set({
        organization_id: org.id,
      })
      .where(eq(user.id, userId));

    // ✅ STEP 3: Create company profile (linked to org)
    const [profile] = await db
      .insert(companyProfile)
      .values({
        user_id: userId,
        organization_id: org.id, // Link to organization
        business_type: data.business_type || "", // Agent, Broker, Owner, or None
        user_type: data.user_type || "", // Government Contractor or Government Employee
        onboarding_completed: true, // Mark onboarding as completed
        primary_naics: "", // No longer collecting NAICS
        naics_codes: [],
        core_competencies: data.core_competencies || [],
        keywords: data.keywords || [],
        service_areas: data.service_areas || [],
        certifications: data.certifications || [],
        set_asides: data.set_asides || [],
        is_small_business: true, // Default to true
        employee_count: null, // No longer collecting
        annual_revenue: null, // No longer collecting
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
      message: "Profile created successfully!",
    });
  } catch (error) {
    console.error("Error creating company profile:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}
