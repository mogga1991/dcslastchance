# Environment Variables Cleanup Needed

## Current Issues in .env.local

Your `.env.local` has **3 legacy VITE_* variables** that should be removed:

```bash
❌ VITE_OPENAI_API_KEY      # Not needed (ProposalIQ feature)
❌ VITE_GOOGLE_MAPS_API_KEY # Use NEXT_PUBLIC_GOOGLE_MAPS_API_KEY instead
❌ VITE_SAMGOV_API_KEY      # Use SAM_API_KEY instead
```

## Why This Matters

- **VITE_*** variables are from the old Vite build system
- The code has fallbacks, so they still work, but they're deprecated
- Keeping them causes confusion for new developers
- They're not in the new `.env.example` template

## Quick Fix (2 minutes)

### Option 1: Edit .env.local Manually
Open `.env.local` and **delete these 3 lines:**
```bash
VITE_OPENAI_API_KEY=...
VITE_GOOGLE_MAPS_API_KEY=...
VITE_SAMGOV_API_KEY=...
```

The modern equivalents are already set:
- ✅ `SAM_API_KEY` (replaces VITE_SAMGOV_API_KEY)
- ✅ `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (replaces VITE_GOOGLE_MAPS_API_KEY)
- OPENAI_API_KEY not needed for GSA Leasing MVP

### Option 2: Use Clean Example
```bash
# Backup current file
cp .env.local .env.local.backup

# Use the clean example as reference
# Compare with: .env.local.clean-example
```

## Verification

After cleanup, your .env.local should have:

**Required (7):**
- ✅ DATABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ NEXT_PUBLIC_APP_URL
- ✅ SAM_API_KEY
- ✅ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

**Optional (7):**
- SUPABASE_ACCESS_TOKEN
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- CRON_SECRET
- POLAR_ACCESS_TOKEN (placeholder)
- POLAR_WEBHOOK_SECRET (placeholder)
- POLAR_SUCCESS_URL (placeholder)
- NEXT_PUBLIC_STARTER_TIER (placeholder)
- NEXT_PUBLIC_STARTER_SLUG (placeholder)

**Total: 14-16 variables** (not 19 like you currently have)

## Test After Cleanup

```bash
npm run dev
```

If the app still works (it should!), the cleanup was successful.

## Files Created

1. ✅ `.env.example` - New comprehensive template
2. ✅ `.env.local.clean-example` - What your .env.local should look like
3. ✅ `ENV_AUDIT_REPORT.md` - Detailed audit findings
4. ✅ `ENV_CLEANUP_NEEDED.md` - This file
5. ✅ `.env.example.backup` - Backup of old .env.example
6. 📦 `.env.example.mvp` - Already existed (kept for reference)

---

**Next Steps:**
1. Read `ENV_AUDIT_REPORT.md` for full details
2. Clean up .env.local (remove 3 VITE_* variables)
3. Use `.env.example` for future reference
4. Share with new developers for onboarding
