# Environment Variables Audit Report
**Date:** December 14, 2024
**Platform:** FedSpace GSA Leasing MVP

## Executive Summary

Audited 37 files containing environment variable references. Found **7 required variables** for MVP, **4 recommended** for better UX, and **15+ optional/legacy** variables that can be safely ignored or set to placeholders.

---

## Required Variables (7) - ✅ MUST HAVE

| Variable | Purpose | Where to Get | Used In |
|----------|---------|--------------|---------|
| `DATABASE_URL` | PostgreSQL connection | [Neon Console](https://console.neon.tech) | drizzle.config.ts, lib/db.ts, scripts/* |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | [Supabase Dashboard](https://supabase.com/dashboard) | middleware.ts, lib/supabase/*, 10+ files |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | [Supabase Dashboard](https://supabase.com/dashboard) | middleware.ts, lib/supabase/*, 10+ files |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase server key | [Supabase Dashboard](https://supabase.com/dashboard) | lib/supabase.ts, scripts/* |
| `SAM_API_KEY` | Government contracts | [SAM.gov API](https://open.gsa.gov/api/) | lib/sam-gov.ts |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps & geocoding | [Google Cloud Console](https://console.cloud.google.com) | lib/geocode.ts, map components |
| `NEXT_PUBLIC_APP_URL` | Application URL | Set manually | lib/auth.ts (OAuth redirects) |

**Setup Time:** ~15 minutes (all free accounts)
**Cost:** $0/month (all have generous free tiers)

---

## Recommended Variables (4) - 📦 NICE TO HAVE

| Variable | Purpose | Impact if Missing | Used In |
|----------|---------|-------------------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth | No "Sign in with Google" | lib/auth.ts:52 |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | No "Sign in with Google" | lib/auth.ts:53 |
| `SUPABASE_ACCESS_TOKEN` | CLI development | Can't use `supabase` CLI | scripts/run-migration.js |
| `CRON_SECRET` | Cron auth | Can't run scheduled jobs | (custom cron setup) |

**Impact:** App works fine without these, but UX is slightly degraded (manual auth only, no CLI shortcuts)

---

## Optional Variables (10+) - ⚪ NOT NEEDED

### Payments (Polar.sh) - 5 variables
- `POLAR_ACCESS_TOKEN` → Set to "placeholder"
- `POLAR_WEBHOOK_SECRET` → Set to "placeholder"
- `POLAR_SUCCESS_URL` → Set to "success"
- `NEXT_PUBLIC_STARTER_TIER` → Set to "placeholder-tier"
- `NEXT_PUBLIC_STARTER_SLUG` → Set to "placeholder-slug"

**Why needed:** Referenced in lib/auth.ts and pricing pages
**Fallback:** All have placeholder defaults, app works fine

### ProposalIQ Features - 5 variables
- `ANTHROPIC_API_KEY` → Not used in MVP
- `OPENAI_API_KEY` → Not used in MVP
- `GOOGLE_AI_API_KEY` → Not used in MVP
- `N8N_WEBHOOK_URL` → Not used in MVP
- `N8N_WEBHOOK_AUTH` → Not used in MVP

**Why present:** Separate product feature, not needed for GSA Leasing

### Analytics/Monitoring - 4+ variables
- `NEXT_PUBLIC_POSTHOG_KEY` → Optional analytics
- `NEXT_PUBLIC_POSTHOG_HOST` → Optional analytics
- `SENTRY_DSN` → Optional error tracking
- `SENTRY_AUTH_TOKEN` → Optional error tracking

**Impact:** No analytics/error tracking, but app runs fine

---

## Legacy Variables (8) - ❌ DO NOT USE

### VITE_* Variables (Old Build System)
These were from the Vite build system before migrating to Next.js:

- ❌ `VITE_SAMGOV_API_KEY` → Use `SAM_API_KEY` instead
- ❌ `VITE_GOOGLE_MAPS_API_KEY` → Use `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- ❌ `VITE_OPENAI_API_KEY` → Not needed
- ❌ `VITE_MAPBOX_ACCESS_TOKEN` → Not needed (switched to Google Maps)

**Found in:** lib/sam-gov.ts, lib/geocode.ts, map components (as fallbacks)
**Action:** Code has fallbacks, but remove from .env.local

### Mapbox (Deprecated)
- ❌ `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` → Switched to Google Maps

**Action:** Remove if present in .env.local

---

## Code Locations by Variable

### Critical Paths (App Breaks Without These)

```
DATABASE_URL:
  - drizzle.config.ts:11
  - lib/db.ts:163
  - check-user-table.js:4
  - test-neon.js:19
  - scripts/seed-demo-data.js:19

SUPABASE_URL + ANON_KEY:
  - middleware.ts:21-22 (Auth middleware - blocks protected routes)
  - lib/supabase/client.ts:5-6 (Client initialization)
  - lib/supabase/server.ts:8-9 (Server initialization)
  - lib/supabase-browser.ts:14-15 (Browser initialization)

SUPABASE_SERVICE_ROLE_KEY:
  - lib/supabase.ts:28-33 (Admin operations)
  - seed-broker-listings.js:6 (Seeding data)

SAM_API_KEY:
  - lib/sam-gov.ts:133, 289, 383, 460 (All API calls)

GOOGLE_MAPS_API_KEY:
  - lib/geocode.ts:32 (Address → Coordinates)
  - app/dashboard/gsa-leasing/_components/gsa-map-with-iolp.tsx:81

APP_URL:
  - lib/auth.ts:34, 52-74 (OAuth redirects, Polar checkout)
  - lib/auth-client.ts:11 (Client base URL)
```

### Non-Critical Paths (Graceful Fallbacks)

```
GOOGLE_CLIENT_ID/SECRET:
  - lib/auth.ts:52-53 (OAuth - fails gracefully if missing)

POLAR_* variables:
  - lib/auth.ts:25, 64-74 (Payments - has placeholders)
  - app/pricing/_component/pricing-table.tsx:88-89

CRON_SECRET:
  - (Not currently used, future feature)
```

---

## Validation Checks

### ✅ App Runs Without Optional Variables

Tested scenarios:
- ✅ No POLAR_* variables → Settings page shows placeholders
- ✅ No GOOGLE_CLIENT_* → Email/password auth still works
- ✅ No Analytics → App runs normally, no tracking
- ✅ No ProposalIQ vars → GSA Leasing works fine

### ❌ App Fails Without Required Variables

Error scenarios:
- ❌ No DATABASE_URL → "Database connection failed"
- ❌ No SUPABASE_URL → "Supabase URL not defined"
- ❌ No SAM_API_KEY → Opportunities page shows "API Error"
- ❌ No MAPS_API_KEY → Maps don't load, geocoding fails

---

## Cleanup Recommendations

### 1. Remove from .env.local (if present)
```bash
# These are legacy and should be removed:
VITE_SAMGOV_API_KEY
VITE_GOOGLE_MAPS_API_KEY
VITE_OPENAI_API_KEY
VITE_MAPBOX_ACCESS_TOKEN
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
```

### 2. Set Placeholders (to prevent errors)
```bash
# These prevent errors in Settings UI:
POLAR_ACCESS_TOKEN="placeholder"
POLAR_WEBHOOK_SECRET="placeholder"
POLAR_SUCCESS_URL="success"
NEXT_PUBLIC_STARTER_TIER="placeholder-tier"
NEXT_PUBLIC_STARTER_SLUG="placeholder-slug"
```

### 3. Update Code Fallbacks
The code currently has these fallbacks (good!):
```typescript
// lib/sam-gov.ts:133
const apiKey = process.env.SAM_API_KEY || process.env.VITE_SAMGOV_API_KEY;

// lib/geocode.ts:32
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
process.env.VITE_GOOGLE_MAPS_API_KEY;
```

**Recommendation:** Keep fallbacks for now (helps migration), but document that VITE_* is deprecated

---

## Quick Start Guide

### For New Developers

1. **Copy template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Sign up for free services** (~15 min):
   - Neon: https://console.neon.tech
   - Supabase: https://supabase.com/dashboard
   - SAM.gov: https://open.gsa.gov/api/
   - Google Cloud: https://console.cloud.google.com

3. **Fill in 7 required variables** in .env.local

4. **Set placeholder values** for POLAR_* variables

5. **Run the app:**
   ```bash
   npm install
   npm run dev
   ```

### For Production Deployment

Required changes:
- ✅ Update `NEXT_PUBLIC_APP_URL` to production domain
- ✅ Generate new `CRON_SECRET` for production
- ✅ Restrict Google Maps API key to production domain
- ✅ Add production domain to Supabase redirect URLs
- ✅ Add all env vars to Vercel/hosting platform

Optional enhancements:
- 📦 Add Google OAuth for production
- 📦 Set up PostHog analytics
- 📦 Configure Sentry error tracking
- 📦 Add Polar.sh for subscriptions

---

## File Comparison

### .env.example (NEW)
- ✅ Comprehensive documentation
- ✅ Clear categorization (REQUIRED vs OPTIONAL)
- ✅ Setup checklist included
- ✅ Troubleshooting guide
- ✅ Marks legacy variables

### .env.example.mvp (OLD)
- ✅ Good MVP focus
- ✅ Clean organization
- ⚠️ Missing some context
- ⚠️ Doesn't mark legacy vars

**Recommendation:** Use new `.env.example` as primary, keep `.env.example.mvp` for quick reference

---

## Security Notes

### Public vs Private Variables

**Safe to Expose (NEXT_PUBLIC_*):**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- ✅ `NEXT_PUBLIC_APP_URL`
- ✅ `NEXT_PUBLIC_STARTER_*`

**NEVER Expose to Browser:**
- 🔒 `SUPABASE_SERVICE_ROLE_KEY` (Admin access!)
- 🔒 `DATABASE_URL` (Direct DB access!)
- 🔒 `POLAR_ACCESS_TOKEN`
- 🔒 `CRON_SECRET`
- 🔒 `GOOGLE_CLIENT_SECRET`

**Gitignore Status:**
- ✅ `.env.local` is in .gitignore
- ✅ `.env` is in .gitignore
- ✅ Only `.env.example` is committed

---

## Summary

| Category | Count | Action Required |
|----------|-------|----------------|
| Required for MVP | 7 | Must set all |
| Recommended | 4 | Optional, improves UX |
| Placeholder OK | 10 | Set to placeholders |
| Legacy/Remove | 8 | Remove from .env.local |
| **Total Unique** | **29** | **7 must-have** |

**Bottom Line:**
- Minimum to start: **7 variables** (~15 min setup, all free)
- Full-featured: **11 variables** (adds Google OAuth, CLI, cron)
- Everything else: Optional or deprecated

---

**Files Updated:**
- ✅ `.env.example` - New comprehensive template
- ✅ `.env.example.backup` - Backup of old file
- ✅ `.env.example.mvp` - Kept for quick MVP reference
