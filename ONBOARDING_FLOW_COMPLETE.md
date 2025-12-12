# Complete Onboarding Flow ✅

**Status**: Fully Integrated with Auth Guards

---

## 🎯 End-to-End User Journey

### 1. User Signs In (First Time)
```
User clicks "Sign In" → Clerk/Better Auth → Account created
```

**Database State**:
```
user table:
- id: "user_abc123"
- email: "alice@example.com"
- name: "Alice Smith"
- role: NULL ❌
- organization_id: NULL ❌
- analysis_credits: 3 (default)
```

---

### 2. ProfileChecker Redirects to Onboarding
```
Dashboard loads → ProfileChecker runs → No company_profile → Redirect to /dashboard/onboarding
```

---

### 3. User Completes Onboarding Form

#### Step 1: Business Information
- Primary NAICS Code: **541512**
- Additional NAICS: 541519, 541611
- Small Business: ✅ Yes
- Employee Count: 25
- Annual Revenue: $2,500,000

#### Step 2: Capabilities & Certifications
- Core Competencies: Cloud Migration, Cybersecurity, DevOps
- Service Areas: AWS, Azure, GCP
- Certifications: ISO 27001, SOC 2 Type II
- Set-Asides: 8(a), SDVOSB

#### Step 3: Preferences
- Preferred Agencies: DoD, DHS, NASA
- Preferred States: VA, MD, DC
- Contract Range: $100K - $10M
- Remote Capable: ✅ Yes
- Max Concurrent: 5

**User clicks "Complete Setup"**

---

### 4. POST /api/profile/create (Behind the Scenes)

```typescript
// ✅ STEP 1: Create Organization
INSERT INTO organization (name, owner_id)
VALUES ('541512 Company', 'user_abc123')
RETURNING id; // → org_xyz789

// ✅ STEP 2: Update User
UPDATE "user"
SET organization_id = 'org_xyz789',
    role = 'contractor'
WHERE id = 'user_abc123';

// ✅ STEP 3: Grant Initial Credits
INSERT INTO credit_transaction (user_id, type, amount, balance_after)
VALUES ('user_abc123', 'credit', 3, 3);

// ✅ STEP 4: Create Company Profile
INSERT INTO company_profile (
  user_id,
  organization_id,
  primary_naics,
  naics_codes,
  core_competencies,
  ...
) VALUES (...);
```

**Response**:
```json
{
  "success": true,
  "profile": { /* company_profile record */ },
  "organization": {
    "id": "org_xyz789",
    "name": "541512 Company"
  },
  "credits_granted": 3,
  "message": "Profile created successfully! You have 3 free analyses to get started."
}
```

---

### 5. User Lands on Dashboard

**Database State (AFTER Onboarding)**:
```sql
-- user table
id              | organization_id | role       | analysis_credits
user_abc123     | org_xyz789      | contractor | 3 ✅

-- organization table
id          | name           | owner_id
org_xyz789  | 541512 Company | user_abc123 ✅

-- company_profile table
id       | user_id     | organization_id | primary_naics
profile1 | user_abc123 | org_xyz789      | 541512 ✅

-- credit_transaction table
id    | user_id     | type   | amount | balance_after
ct1   | user_abc123 | credit | 3      | 3 ✅
```

---

## ✅ Auth Guards Now Work!

### Test 1: Create Analysis
```typescript
POST /api/analyses
Body: { document_name: "RFP-2025-001.pdf" }

// Auth guard checks:
1. requireAuth() → ✅ userId exists
2. Session fetches → ✅ { userId, organizationId: "org_xyz789", role: "contractor" }
3. requireCredits(userId, 1) → ✅ balance_after = 3

// Analysis created:
INSERT INTO analysis (user_id, organization_id, document_name, status)
VALUES ('user_abc123', 'org_xyz789', 'RFP-2025-001.pdf', 'draft');

// Credit consumed:
INSERT INTO credit_transaction (user_id, type, amount, balance_after)
VALUES ('user_abc123', 'debit', -1, 2);

Response: { analysis: { id: "...", status: "draft" } }
```

---

### Test 2: View Org-Wide Analyses
```typescript
GET /api/analyses

// Auth guard:
1. requireAuth() → ✅ session.organizationId = "org_xyz789"

// Query:
SELECT a.*, u.name as created_by_name
FROM analysis a
JOIN "user" u ON a.user_id = u.id
WHERE u.organization_id = 'org_xyz789'

// Returns all analyses in the org (if Alice has teammates, shows their work too)
Response: { analyses: [ /* all org analyses */ ] }
```

---

### Test 3: Dashboard Stats
```typescript
GET /api/dashboard/stats

// Auth guard:
1. requireAuth() → ✅ session.organizationId = "org_xyz789"

// Queries:
SELECT COUNT(*) FROM analysis WHERE org_id = 'org_xyz789'  // Total
SELECT COUNT(*) FROM "user" WHERE organization_id = 'org_xyz789'  // Team

Response: {
  stats: {
    total_analyses: 1,
    completed_analyses: 0,
    strong_bids: 0,
    team_members: 1,
    organization_name: "541512 Company",
    credits_remaining: 2  // After creating 1 analysis
  }
}
```

---

### Test 4: Try to Add Credits (Should Fail)
```typescript
POST /api/credits
Body: { total_credits: 1000 }

// Auth guards:
1. requireAuth() → ✅
2. requireAdmin(userId) → ❌ FAIL (user role = "contractor")

Response: 403 Forbidden
{
  "error": "Forbidden: Requires one of these roles: admin",
  "statusCode": 403
}
```

---

## 🎉 Complete Feature Matrix

| Feature | Status | Details |
|---------|--------|---------|
| User Sign In | ✅ | Clerk/Better Auth |
| Onboarding Check | ✅ | ProfileChecker component |
| Org Creation | ✅ | Auto-created during onboarding |
| Role Assignment | ✅ | Default "contractor" |
| Initial Credits | ✅ | 3 free analyses |
| Profile Setup | ✅ | Full company profile |
| Credit Validation | ✅ | Checked before creating analysis |
| Org-Wide Viewing | ✅ | Team can see each other's work |
| Admin Guards | ✅ | Only admins can add credits |
| Dashboard Stats | ✅ | Shows org-wide metrics |

---

## 🧪 Testing Instructions

### 1. Fresh User Signup
```bash
# Start dev server
npm run dev

# Open incognito browser
# Sign up as new user: test@example.com

# Expected flow:
✅ Sign in → redirected to /dashboard/onboarding
✅ Fill form → submit
✅ See success toast: "Profile created successfully! You have 3 free analyses to get started."
✅ Redirected to /dashboard
✅ Dashboard shows: "Credits: 3" and "Team Members: 1"
```

### 2. Create Analysis (Uses Credit)
```bash
# On dashboard, click "Create Analysis"
# Upload a document

# Expected:
✅ Analysis created (status: "draft")
✅ Credits decremented: 3 → 2
✅ Dashboard updates: "Credits: 2"
```

### 3. Try to Add Credits (Should Fail)
```bash
# Try to POST /api/credits manually
curl -X POST http://localhost:3000/api/credits \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"total_credits": 1000}'

# Expected:
✅ 403 Forbidden
✅ Error: "Requires one of these roles: admin"
```

### 4. Verify Database
```sql
-- Check user has org and role
SELECT id, email, organization_id, role FROM "user" WHERE email = 'test@example.com';
-- Expected: organization_id IS NOT NULL, role = 'contractor'

-- Check organization exists
SELECT * FROM organization WHERE owner_id = (SELECT id FROM "user" WHERE email = 'test@example.com');
-- Expected: 1 row

-- Check credits
SELECT balance_after FROM credit_transaction
WHERE user_id = (SELECT id FROM "user" WHERE email = 'test@example.com')
ORDER BY "createdAt" DESC LIMIT 1;
-- Expected: 2 (after creating 1 analysis)

-- Check company profile linked to org
SELECT user_id, organization_id FROM company_profile
WHERE user_id = (SELECT id FROM "user" WHERE email = 'test@example.com');
-- Expected: organization_id matches org.id
```

---

## 🚀 What's Next

### Phase 1: Core Complete ✅
- [x] Onboarding creates organization
- [x] User linked to org with role
- [x] Initial credits granted
- [x] Auth guards enforced
- [x] Org-wide data viewing

### Phase 2: Team Features (Future)
- [ ] Invite team members
- [ ] Assign roles (admin/contractor/broker)
- [ ] Manage team permissions
- [ ] Org settings page

### Phase 3: Advanced (Future)
- [ ] Multiple orgs per user
- [ ] Org switching in UI
- [ ] Custom roles
- [ ] Activity audit log

---

**Status**: Onboarding is now fully integrated with the auth system! 🎉
