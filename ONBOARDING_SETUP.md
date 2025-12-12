# Onboarding Flow Setup Guide

**Status**: ⚠️ Needs Updates for Org + Role Setup

---

## 🎯 Current Flow

```mermaid
graph TD
    A[User Signs In] --> B{Has Company Profile?}
    B -->|No| C[/dashboard/onboarding]
    B -->|Yes| D[/dashboard]
    C --> E[Fill Profile Form]
    E --> F[POST /api/profile/create]
    F --> G[Create company_profile]
    G --> D
```

---

## ⚠️ Critical Gaps

### What Onboarding Currently Does ✅
- Creates `company_profile` record
- Collects NAICS codes, capabilities, certifications
- Sets contract preferences

### What's Missing ❌
1. **No Organization Record** - Users aren't part of an org
2. **No Role Assignment** - User role stays default ("contractor")
3. **No Org Linking** - `user.organization_id` is NULL
4. **No Initial Credits** - Users start with 0 credits (can't create analyses!)

---

## 🔧 Required Updates

### 1. Update `/api/profile/create` Route

The onboarding endpoint needs to:
1. Create an Organization for the user
2. Update User record with org_id and role
3. Grant initial credits (e.g., 3 free analyses)
4. Create company_profile

**Updated Flow**:
```typescript
POST /api/profile/create
├─ Create Organization (company_name)
├─ Update User (set organization_id, role="contractor")
├─ Grant initial credits (3 free)
└─ Create CompanyProfile (link to org)
```

---

## 📝 Recommended Implementation

### Option A: Individual Contractor (Default)

Most users will be individual contractors who want to:
- Create their own organization
- Be the admin of that org
- Invite team members later

**Onboarding Steps**:
1. **Company Info** → Creates Organization
2. **Capabilities** → Creates CompanyProfile
3. **Preferences** → Finalizes setup
4. **Grant Credits** → 3 free analyses to start

### Option B: Joining Existing Org (Future)

Some users might want to:
- Join an existing organization
- Accept an invite from a broker/admin
- Collaborate with a team

**Implementation** (Phase 2):
- Add "Join Organization" option on onboarding
- Accept invite code or link
- Skip org creation, just link to existing org

---

## 🚀 Updated API Route

Here's what `/api/profile/create` should do:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { organization, companyProfile, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { addCredits } from "@/lib/services";

export async function POST(req: NextRequest) {
  try {
    const result = await auth.api.getSession({
      headers: await headers(),
    });

    if (!result?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = result.session.userId;
    const data = await req.json();

    // STEP 1: Create Organization
    const orgName = data.company_name || `${data.primary_naics} Company`;
    const [org] = await db
      .insert(organization)
      .values({
        name: orgName,
        owner_id: userId,
      })
      .returning();

    // STEP 2: Update User with org_id and role
    await db
      .update(user)
      .set({
        organization_id: org.id,
        role: "contractor", // Default role for self-signup
      })
      .where(eq(user.id, userId));

    // STEP 3: Grant initial credits (3 free analyses)
    await addCredits({
      user_id: userId,
      credit_type: "one_time",
      total_credits: 3,
    });

    // STEP 4: Create company profile (linked to org)
    const [profile] = await db
      .insert(companyProfile)
      .values({
        user_id: userId,
        organization_id: org.id, // ✅ Link to org!
        primary_naics: data.primary_naics,
        naics_codes: data.naics_codes || [],
        core_competencies: data.core_competencies || [],
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
      organization: org,
      credits_granted: 3,
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}
```

---

## 🎨 Optional: Add Company Name to Onboarding

Currently, the dashboard onboarding doesn't ask for a company name. You might want to add it to Step 1:

```tsx
// In /app/dashboard/onboarding/page.tsx - Step 1
{step === 1 && (
  <>
    {/* Add company name field */}
    <div className="space-y-2">
      <Label htmlFor="company_name">Company Name *</Label>
      <Input
        id="company_name"
        value={formData.company_name || ""}
        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
        placeholder="e.g., ACME Defense Solutions"
        required
      />
    </div>

    {/* Existing fields... */}
    <div className="space-y-2">
      <Label htmlFor="primary_naics">Primary NAICS Code *</Label>
      ...
    </div>
  </>
)}
```

And update the FormData interface:
```typescript
interface FormData {
  company_name: string; // ✅ Add this
  primary_naics: string;
  // ... rest of fields
}
```

---

## ✅ Verification Checklist

After updating `/api/profile/create`, test:

### New User Onboarding
- [ ] Sign in for first time
- [ ] Redirected to /dashboard/onboarding
- [ ] Fill out company profile form
- [ ] Submit form
- [ ] Check database:
  - [ ] `organization` record created with user as owner
  - [ ] `user.organization_id` set to new org
  - [ ] `user.role` = "contractor"
  - [ ] `company_profile` created with org_id
  - [ ] `credit_transaction` shows 3 credits granted
- [ ] Dashboard loads successfully
- [ ] Can create an analysis (uses 1 credit)
- [ ] Dashboard shows org-wide stats

### Auth Guards Work
- [ ] Create analysis → credit validated ✅
- [ ] Try to add credits as non-admin → 403 ✅
- [ ] View analyses → shows org-wide ✅
- [ ] Dashboard → shows org stats ✅

---

## 🔮 Future Enhancements

### Team Invitations
Add ability to invite team members:
1. Admin generates invite link/code
2. New user signs up via invite
3. Skips org creation
4. Gets linked to existing org
5. Gets assigned role by inviter

### Multiple Organizations
Support users who work with multiple orgs:
1. User can belong to multiple orgs
2. Switch between orgs in UI
3. Data scoped to active org

### Custom Roles
Beyond contractor/broker/admin:
1. Capture Manager
2. Proposal Writer
3. BD Executive
4. Viewer (read-only)

---

**Next Step**: Update `/api/profile/create` with the code above!
