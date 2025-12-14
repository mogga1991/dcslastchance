# Sprint 1: Database & Company Profile Foundation

**Duration**: 3-4 days
**Goal**: Set up database infrastructure and enable company profile management

---

## Task 1.1: Database Migrations ⏳

### ✅ Subtask 1.1.1: Run saved_opportunities migration
**Status**: PENDING
**Command**:
```bash
supabase db push
```

**Tests**:
- [ ] Migration applies without errors
- [ ] Table exists in Supabase dashboard
- [ ] RLS policies are active
- [ ] Can query table: `SELECT * FROM saved_opportunities LIMIT 1;`

**Acceptance Criteria**:
- ✅ No migration errors
- ✅ Table appears in database
- ✅ RLS prevents unauthorized access

---

### ✅ Subtask 1.1.2: Create company_profiles migration
**Status**: PENDING
**File**: `supabase/migrations/20251214140000_create_company_profiles.sql`

**Required Fields**:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `company_name` (TEXT, required)
- `duns_number` (TEXT)
- `uei_number` (TEXT)
- `cage_code` (TEXT)
- `business_types` (TEXT[])
- `set_aside_certifications` (TEXT[])
- `naics_codes` (TEXT[])
- `primary_naics` (TEXT)
- `years_in_business` (INT)
- `federal_experience_years` (INT)
- `clearance_level` (TEXT)
- `geographic_coverage` (TEXT[])
- `employee_count` (INT)
- Timestamps

**Tests**:
- [ ] Migration file created
- [ ] SQL syntax is valid
- [ ] RLS policies included
- [ ] Indexes created
- [ ] Trigger for updated_at works

**Acceptance Criteria**:
- ✅ Migration file exists
- ✅ All required fields present
- ✅ RLS policies defined

---

### ✅ Subtask 1.1.3: Apply company_profiles migration
**Status**: PENDING
**Command**:
```bash
supabase db push
```

**Tests**:
- [ ] Migration applies cleanly
- [ ] Table appears in Supabase dashboard
- [ ] Check columns: `SELECT * FROM information_schema.columns WHERE table_name = 'company_profiles';`
- [ ] RLS test: Try querying as different user

**Acceptance Criteria**:
- ✅ Table created successfully
- ✅ RLS prevents cross-user access
- ✅ All columns present

---

## Task 1.2: Company Profile API ⏳

### ✅ Subtask 1.2.1: Create GET endpoint
**Status**: PENDING
**File**: `app/api/company-profile/route.ts`

**Functionality**:
- GET: Returns current user's company profile
- Returns 404 if no profile exists
- Requires authentication

**Tests**:
```bash
# Test authenticated request
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/company-profile

# Expected: 200 with profile data OR 404 with error message
```

**Acceptance Criteria**:
- ✅ Returns profile for authenticated user
- ✅ Returns 404 if no profile
- ✅ Returns 401 if not authenticated

---

### ✅ Subtask 1.2.2: Create POST endpoint
**Status**: PENDING
**File**: `app/api/company-profile/route.ts`

**Functionality**:
- POST: Creates new company profile
- Validates required fields
- Links to user_id from auth token

**Tests**:
```bash
# Test profile creation
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"company_name": "Test Corp", "primary_naics": "541511"}' \
  http://localhost:3000/api/company-profile

# Expected: 201 with created profile
```

**Acceptance Criteria**:
- ✅ Creates profile successfully
- ✅ Validates required fields
- ✅ Returns 400 for invalid data
- ✅ Prevents duplicate profiles per user

---

### ✅ Subtask 1.2.3: Create PATCH endpoint
**Status**: PENDING
**File**: `app/api/company-profile/route.ts`

**Functionality**:
- PATCH: Updates existing profile
- Validates field types
- Only updates provided fields

**Tests**:
```bash
# Test profile update
curl -X PATCH \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"employee_count": 50}' \
  http://localhost:3000/api/company-profile

# Expected: 200 with updated profile
```

**Acceptance Criteria**:
- ✅ Updates profile successfully
- ✅ Returns 404 if no profile
- ✅ Validates field types
- ✅ Only updates specified fields

---

## Task 1.3: Company Profile UI ⏳

### ✅ Subtask 1.3.1: Create profile form component
**Status**: PENDING
**File**: `app/dashboard/settings/_components/company-profile-form.tsx`

**Sections**:
1. Basic Information
   - Company Name (required)
   - DUNS, UEI, CAGE Code

2. Business Classifications
   - Business Types (checkboxes)
   - Set-Aside Certifications (checkboxes)

3. NAICS Codes
   - Primary NAICS (required)
   - Additional NAICS codes (multi-input)

4. Capabilities
   - Years in Business
   - Federal Experience Years
   - Clearance Level (dropdown)
   - Geographic Coverage (multi-select)
   - Employee Count

**Tests**:
- [ ] Component renders without errors
- [ ] All fields display correctly
- [ ] Form submits successfully
- [ ] Loading states work
- [ ] Error states display

**Acceptance Criteria**:
- ✅ Form renders with all fields
- ✅ Can submit form
- ✅ Shows loading during save
- ✅ Shows errors on failure

---

### ✅ Subtask 1.3.2: Add to Settings page
**Status**: PENDING
**File**: `app/dashboard/settings/page.tsx`

**Changes**:
- Add "Company Profile" tab to existing tabs
- Import CompanyProfileForm
- Fetch profile data on load

**Tests**:
- [ ] Navigate to /dashboard/settings
- [ ] See "Company Profile" tab
- [ ] Click tab, form appears
- [ ] Form loads existing data if profile exists

**Acceptance Criteria**:
- ✅ Tab appears in settings
- ✅ Form loads on tab click
- ✅ Existing data loads correctly

---

### ✅ Subtask 1.3.3: Add form validation
**Status**: PENDING
**File**: `app/dashboard/settings/_components/company-profile-form.tsx`

**Validations**:
- Company Name: Required, min 2 chars
- Primary NAICS: Required, exactly 6 digits
- Years in Business: Positive integer
- Employee Count: Positive integer
- Email: Valid email format (if added)

**Tests**:
- [ ] Submit empty form → Shows errors
- [ ] Enter invalid NAICS → Shows error
- [ ] Enter negative numbers → Shows error
- [ ] Fix errors → Can submit successfully

**Acceptance Criteria**:
- ✅ Required fields validated
- ✅ NAICS format validated
- ✅ Numeric fields validated
- ✅ Error messages are clear

---

## Sprint 1 Testing Checkpoint ✅

### Complete User Flow Test
**Scenario**: New user creates company profile

**Steps**:
1. [ ] Log in as new user
2. [ ] Navigate to Settings → Company Profile
3. [ ] Fill out form with valid data
4. [ ] Submit form
5. [ ] See success message
6. [ ] Refresh page
7. [ ] Verify data persisted
8. [ ] Edit some fields
9. [ ] Save changes
10. [ ] Verify updates saved

**Expected Results**:
- ✅ Form submission successful
- ✅ Data persists across sessions
- ✅ Edits save correctly
- ✅ No console errors
- ✅ Good UX/UI

---

### RLS Security Test
**Scenario**: Verify users can't access other profiles

**Steps**:
1. [ ] Create profile as User A
2. [ ] Log out
3. [ ] Log in as User B
4. [ ] Try to access User A's profile via API
5. [ ] Verify access denied

**Expected Results**:
- ✅ User B cannot see User A's profile
- ✅ API returns 401/403 error
- ✅ RLS policies working

---

### Edge Cases Test

**Test Cases**:
1. [ ] User without profile visits Settings
   - Expected: Empty form with "Create Profile" button

2. [ ] User creates profile with minimum required fields
   - Expected: Saves successfully

3. [ ] User tries to create duplicate profile
   - Expected: Error message or updates existing

4. [ ] Network error during save
   - Expected: Error message, data not lost

5. [ ] Very long company name (>100 chars)
   - Expected: Validation error or truncation

---

## Sprint 1 Deployment Checklist ✅

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Accessibility check
- [ ] Code reviewed

### Deployment
- [ ] Push to GitHub
- [ ] Verify build passes
- [ ] Deploy to Vercel
- [ ] Run migrations on production database

### Post-Deployment
- [ ] Test on production URL
- [ ] Verify database tables exist
- [ ] Create test profile on prod
- [ ] Monitor error logs
- [ ] Gather initial user feedback

---

## Blockers & Issues

### Current Blockers
- None

### Known Issues
- None yet

### Questions
- None yet

---

## Notes

- Keep forms simple for MVP
- Can add more fields later
- Focus on getting core profile working
- Don't over-engineer validation initially

---

**Status**: Ready to begin
**Next Action**: Start with Task 1.1.1 - Run saved_opportunities migration
**Assigned To**: Claude Code
**Started**: 2025-12-14
