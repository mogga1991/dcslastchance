# API Routes Audit - GSA Leasing MVP

> Complete audit of all API routes to identify unused endpoints

**Audit Date:** December 14, 2024
**Total Routes Found:** 29

---

## ✅ Core MVP Routes (Keep - Actively Used)

### GSA Leasing Features
| Route | Purpose | Used By | Status |
|-------|---------|---------|--------|
| `/api/broker-listings` (GET, POST) | List and create property listings | Broker listing page, GSA Leasing | ✅ Active |
| `/api/broker-listings/[id]` (GET, PATCH, DELETE) | Manage individual listings | Listing detail/edit | ✅ Active |
| `/api/gsa-leasing` | GSA leasing data | GSA Leasing page | ✅ Active |
| `/api/opportunities` | SAM.gov opportunities feed | GSA Leasing page | ✅ Active |
| `/api/saved-opportunities` (GET, POST) | Save/list opportunities | GSA Leasing, Saved page | ✅ Active |
| `/api/saved-opportunities/[id]` (DELETE) | Unsave opportunity | Opportunity cards | ✅ Active |
| `/api/scoring/calculate-match` | Property-opportunity matching | Match scoring system | ✅ Active |

### Authentication
| Route | Purpose | Used By | Status |
|-------|---------|---------|--------|
| `/api/auth/sign-out` | User sign-out | Sign-out button | ✅ Active |

### User Interface
| Route | Purpose | Used By | Status |
|-------|---------|---------|--------|
| `/api/user/usage-stats` | Sidebar usage statistics | Sidebar component | ✅ Active |

---

## ⚠️ Settings-Only Routes (Keep - Used in Settings Page)

These routes are used exclusively in the Settings page tabs. They're ProposalIQ-related features but accessible in the MVP UI.

| Route | Purpose | Used By | Tab | Notes |
|-------|---------|---------|-----|-------|
| `/api/company-profile` (GET, POST, PATCH) | Company business info | CompanyProfileForm | Business Information | Company details, NAICS codes |
| `/api/contractor-profile` (GET, POST, PATCH) | Government contractor eligibility | GovernmentContractors | Government Contractors | Set-asides, certifications |
| `/api/contractor-profile/completeness` | Profile completion status | GovernmentContractors | Government Contractors | Progress tracking |
| `/api/team-members` (GET, POST) | Team member management | AccountManager | Team Overview | Add/remove team members |
| `/api/team-members/[id]` (PATCH, DELETE) | Edit/remove team member | AccountManager | Team Overview | Individual member actions |
| `/api/team-members/[id]/activity` | Member activity log | AccountManager | Team Overview | Activity tracking |

**Recommendation:** Keep for now since Settings is in the MVP navigation. Consider hiding these tabs in a future cleanup if they're not GSA Leasing specific.

---

## 🔍 ProposalIQ Routes (Potentially Unused in GSA MVP)

These are primarily ProposalIQ RFP analysis features. They have references in settings pages but may not be core to GSA Leasing.

| Route | Purpose | References | Notes |
|-------|---------|------------|-------|
| `/api/key-personnel` | Key personnel management | Settings | Used in contractor forms |
| `/api/past-performance` | Past performance tracking | Settings | Government contractor data |
| `/api/constraints` | Proposal constraints | Settings | RFP requirements |
| `/api/solicitations` | Solicitation documents | Settings | ProposalIQ feature |
| `/api/capability-documents` | Capability statements | Settings | Document management |
| `/api/capability-documents/[id]` | Individual capability docs | Settings | Edit/delete docs |
| `/api/qualification-check` | Qualification verification | Settings | Bid/no-bid checks |

**Total ProposalIQ References:** 8 (all in settings components)

**Recommendation:** Keep for now since they're used in accessible Settings tabs. Document for future phase-out if focusing purely on GSA Leasing.

---

## ❌ Unused Routes (Safe to Remove)

These routes have **zero references** in the codebase or are for features explicitly hidden in the MVP.

### Confirmed Zero References
| Route | Purpose | References | Reason |
|-------|---------|------------|--------|
| `/api/piq/analyze` | ProposalIQ RFP analysis | 0 | ProposalIQ feature not in MVP |
| `/api/subscription` | Subscription management | 0 | Payments removed from MVP dashboard |

### Orphaned Pages (Not Linked in Navigation)
| Route | Purpose | Used By | Issue |
|-------|---------|---------|-------|
| `/api/upload-image` | Image upload handler | `/dashboard/upload` page | Upload page exists but not linked in nav |

### Commented Out Features
| Route | Purpose | Status | Notes |
|-------|---------|--------|-------|
| `/api/chat` | AI chatbot | Disabled | Chatbot commented out in dashboard layout |

**Recommendation for Removal:**
1. `/api/piq/analyze` - Delete route file ✓
2. `/api/subscription` - Delete route file ✓
3. `/api/upload-image` - Keep if image upload is used elsewhere, or delete with `/dashboard/upload` page
4. `/api/chat` - Delete or document as "future feature"

---

## 📊 Other Routes (Need Context)

| Route | Purpose | Notes |
|-------|---------|-------|
| `/api/analyses` (GET, POST) | Analysis management | 7 references via `use-sentyr.ts` hook |
| `/api/analyses/[id]` (GET, PUT) | Individual analysis | Used with above hook |
| `/api/news` | Market news feed | Unknown usage, need to check |
| `/api/dashboard/stats` | Dashboard statistics | 2 references, but we removed usage in Task 1 |

**Dashboard Stats Issue:**
In Task 1, we replaced `/api/dashboard/stats` with direct Supabase queries for performance. The API route may now be unused.

**Analyses Routes:**
The `use-sentyr.ts` hook references these, but need to verify if that hook is actually used in the MVP.

---

## 🔄 Middleware & Callbacks (Keep)

| Route | Purpose | Status |
|-------|---------|--------|
| `/auth/callback` | OAuth callback handler | ✅ Required |

---

## 📝 Recommendations Summary

### High Priority - Safe to Delete
1. `/api/piq/analyze` - Zero references
2. `/api/subscription` - Zero references

### Medium Priority - Verify Then Delete
1. `/api/dashboard/stats` - Replaced with direct queries
2. `/api/upload-image` - Page not in navigation
3. `/api/chat` - Feature disabled
4. `/dashboard/upload` page - Not linked

### Low Priority - Document & Monitor
1. ProposalIQ routes (8 total) - Used in Settings but may not be GSA-specific
2. `/api/news` - Unknown if used
3. `/api/analyses` - Check if `use-sentyr.ts` hook is used

### Keep All
- GSA Leasing core routes (7 routes)
- Auth routes (2 routes)
- Settings-specific routes (6 routes)
- User interface routes (1 route)

---

## 📂 Files to Review/Remove

### Confirmed Unused
```
app/api/piq/analyze/route.ts
app/api/subscription/route.ts
```

### Likely Unused
```
app/api/dashboard/stats/route.ts (replaced)
app/api/upload-image/route.ts (orphaned)
app/api/chat/route.ts (feature disabled)
app/dashboard/upload/ (not linked in nav)
```

### Settings-Only (Consider for Phase 2 Cleanup)
```
app/api/company-profile/route.ts
app/api/contractor-profile/route.ts
app/api/contractor-profile/completeness/route.ts
app/api/team-members/route.ts
app/api/team-members/[id]/route.ts
app/api/team-members/[id]/activity/route.ts
app/api/key-personnel/route.ts
app/api/past-performance/route.ts
app/api/constraints/route.ts
app/api/solicitations/route.ts
app/api/capability-documents/route.ts
app/api/capability-documents/[id]/route.ts
app/api/qualification-check/route.ts
```

---

## ✅ Next Steps

1. **Delete confirmed unused routes:**
   - Remove `/api/piq/analyze/route.ts`
   - Remove `/api/subscription/route.ts`

2. **Verify and clean orphaned routes:**
   - Check if `/api/upload-image` is used by broker listing image uploads
   - If not, remove both the route and `/dashboard/upload` page
   - Remove `/api/dashboard/stats/route.ts` (replaced with direct queries)

3. **Document disabled features:**
   - Add comment to `/api/chat/route.ts`: "Feature disabled - Chatbot hidden in MVP"
   - Consider moving to `/api/_disabled/` folder

4. **Phase 2 consideration:**
   - Decide if Settings tabs for ProposalIQ features should be hidden
   - If yes, remove associated API routes
   - If no, document as "multi-product features"

---

**Audit Status:** ✅ Complete
**Safe Deletions Identified:** 2 routes
**Further Investigation Needed:** 4 routes
**Keep:** 23 routes
