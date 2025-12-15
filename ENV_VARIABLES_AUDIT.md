# Environment Variables Audit - GSA Leasing MVP

> Complete audit of environment variables to identify what's required for MVP

**Audit Date:** December 14, 2024

---

## ✅ Required for MVP (7 variables)

These variables are **essential** for the app to function. Without them, critical features will fail.

| Variable | Purpose | Where to Get It | Used By |
|----------|---------|-----------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | [Neon Console](https://console.neon.tech) | All database queries |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api) | Authentication, storage |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public API key | [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api) | Client-side auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key | [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api) | Server-side operations |
| `SAM_API_KEY` | SAM.gov API access | [GSA API Portal](https://open.gsa.gov/api/get-opportunities-public-api/) | Federal opportunities data |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API | [Google Cloud Console](https://console.cloud.google.com/google/maps-apis) | Property maps, geocoding |
| `NEXT_PUBLIC_APP_URL` | Application base URL | N/A - Set manually | OAuth redirects, links |

**Total Cost:** $0/month (all have free tiers sufficient for MVP)

---

## 📦 Nice to Have (3 variables)

These variables **improve the user experience** but aren't strictly required. The app will work without them, with some features disabled.

| Variable | Purpose | Impact if Missing | Free? |
|----------|---------|-------------------|-------|
| `GOOGLE_CLIENT_ID` | Google OAuth sign-in | Users can only sign up with email/password | ✅ Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth sign-in | Same as above | ✅ Yes |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI access | Can't run `supabase` CLI commands locally | ✅ Yes |

---

## 🔧 Optional Features (3 variables)

These variables enable **optional features** that can be added later.

| Variable | Purpose | Required For | Currently Used? |
|----------|---------|--------------|-----------------|
| `CRON_SECRET` | Cron job authentication | Automated tasks (lease alerts, cleanup) | ✅ Yes (in code) |
| `NODE_ENV` | Environment detection | Conditional logic | ✅ Auto-set by hosting |
| Analytics/Monitoring | PostHog, Sentry | Error tracking, user analytics | ❌ Not in MVP |

---

## ⚠️ Present But Not MVP (10 variables)

These variables are in `.env.example` or referenced in code but **not needed for GSA Leasing MVP**. They're for ProposalIQ features or deprecated systems.

### Payment/Subscription (Not Required)

The Settings page has subscription UI, but it's non-functional without these. MVP doesn't need payments.

| Variable | Purpose | Status |
|----------|---------|--------|
| `POLAR_ACCESS_TOKEN` | Polar.sh API access | Referenced in code, not used in MVP |
| `POLAR_WEBHOOK_SECRET` | Payment webhook validation | Referenced in code, not used in MVP |
| `POLAR_SUCCESS_URL` | Payment redirect URL | Referenced in code, not used in MVP |
| `NEXT_PUBLIC_STARTER_TIER` | Polar product ID | Referenced in code, not used in MVP |
| `NEXT_PUBLIC_STARTER_SLUG` | Polar product slug | Referenced in code, not used in MVP |

### Deprecated Auth Systems (Not Used)

These were in the template but GSA Leasing uses Supabase Auth.

| Variable | Purpose | Status |
|----------|---------|--------|
| `BETTER_AUTH_SECRET` | Better Auth library | ❌ Not used (Supabase Auth instead) |
| `BETTER_AUTH_URL` | Better Auth callback | ❌ Not used |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk auth service | ❌ Not used |
| `CLERK_SECRET_KEY` | Clerk auth service | ❌ Not used |

### ProposalIQ Features (Settings Pages Only)

These are used in Settings tabs for ProposalIQ RFP analysis features.

| Variable | Purpose | Status |
|----------|---------|--------|
| `ANTHROPIC_API_KEY` | Claude AI for RFP extraction | Settings only, not core MVP |
| `OPENAI_API_KEY` | OpenAI alternative | Settings only, not core MVP |
| `GOOGLE_AI_API_KEY` | Gemini for parsing | Settings only, not core MVP |
| `N8N_WEBHOOK_URL` | n8n workflow automation | ProposalIQ feature |
| `N8N_WEBHOOK_AUTH` | n8n authentication | ProposalIQ feature |

---

## 🗑️ Should Be Removed

### Vite Variables (Wrong Framework)

These are Vite-specific variables that **shouldn't exist** in a Next.js project:

```bash
VITE_OPENAI_API_KEY  # Duplicate of OPENAI_API_KEY
VITE_GOOGLE_MAPS_API_KEY  # Duplicate of NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
VITE_SAMGOV_API_KEY  # Duplicate of SAM_API_KEY
VITE_MAPBOX_ACCESS_TOKEN  # Mapbox not used, also wrong framework
```

**Action:** Remove these from `.env.local`

### Legacy/Unused

| Variable | Reason to Remove |
|----------|------------------|
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox replaced with Google Maps |

---

## 📊 Summary

| Category | Count | Notes |
|----------|-------|-------|
| **Required** | 7 | App won't work without these |
| **Nice to Have** | 3 | Improve UX |
| **Optional** | 3 | Extra features |
| **Not Needed** | 10 | ProposalIQ or deprecated |
| **Should Remove** | 5 | Wrong framework or duplicates |

---

## 🔄 Variables Actually Used in Code

Based on `grep -r "process.env"`, the codebase references:

```
✅ CRON_SECRET
✅ DATABASE_URL
✅ GOOGLE_CLIENT_ID
✅ GOOGLE_CLIENT_SECRET
✅ NEXT_PUBLIC_APP_URL
✅ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
✅ NEXT_PUBLIC_STARTER_SLUG (Settings only)
✅ NEXT_PUBLIC_STARTER_TIER (Settings only)
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ NEXT_PUBLIC_SUPABASE_URL
✅ POLAR_ACCESS_TOKEN (Settings only)
✅ POLAR_SUCCESS_URL (Settings only)
✅ POLAR_WEBHOOK_SECRET (Settings only)
✅ SAM_API_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
❌ VITE_GOOGLE_MAPS_API_KEY (remove - wrong framework)
❌ VITE_SAMGOV_API_KEY (remove - wrong framework)
```

---

## 📝 Recommendations

### 1. Update .env.example

Create `.env.example.mvp` (✅ Done) with only MVP-required variables:
- Remove ProposalIQ AI variables
- Remove deprecated auth systems (Better Auth, Clerk)
- Remove Vite variables
- Keep only the 7 required + 3 nice-to-have variables

### 2. Clean Up .env.local

Remove from your local file:
```bash
# These are wrong framework:
VITE_OPENAI_API_KEY
VITE_GOOGLE_MAPS_API_KEY
VITE_SAMGOV_API_KEY
VITE_MAPBOX_ACCESS_TOKEN

# This is deprecated:
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
```

### 3. Document Setup Process

Create `docs/SETUP.md` with:
- Step-by-step guide to getting all required API keys
- Screenshots of where to find credentials
- Free tier limitations for each service
- Estimated setup time: ~30 minutes

### 4. Placeholder Values for Non-Essential

For variables that are referenced in code but not needed for MVP (Polar.sh payments), use placeholder values:

```bash
POLAR_ACCESS_TOKEN="placeholder"
POLAR_WEBHOOK_SECRET="placeholder"
POLAR_SUCCESS_URL="success"
NEXT_PUBLIC_STARTER_TIER="placeholder"
NEXT_PUBLIC_STARTER_SLUG="placeholder"
```

This prevents errors when code checks for these values.

---

## 🚀 Quick Start Guide

### Minimum Viable Setup

1. **Database** (5 min)
   - Sign up: [Neon](https://console.neon.tech)
   - Copy `DATABASE_URL`

2. **Authentication** (10 min)
   - Sign up: [Supabase](https://supabase.com)
   - Copy `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `SUPABASE_SERVICE_ROLE_KEY`

3. **Federal Data** (5 min)
   - Request key: [SAM.gov API](https://open.gsa.gov/api/get-opportunities-public-api/)
   - Copy `SAM_API_KEY`

4. **Maps** (10 min)
   - Sign up: [Google Cloud](https://console.cloud.google.com)
   - Enable Maps JavaScript API + Geocoding API
   - Copy `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

5. **Configure**
   ```bash
   cp .env.example.mvp .env.local
   # Fill in the 7 required values
   npm run dev
   ```

**Total Time:** ~30 minutes
**Total Cost:** $0/month

---

## 🔒 Security Notes

### Public vs Private Keys

**Public keys** (safe to expose in client-side code):
- `NEXT_PUBLIC_*` prefix indicates these are embedded in the JavaScript bundle
- Anyone can see these in browser DevTools
- That's OK! They're designed for client-side use

**Private keys** (NEVER commit to git):
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_SECRET`
- `POLAR_ACCESS_TOKEN`
- `CRON_SECRET`

These should only be used server-side and never exposed to the client.

### .env.local vs .env.example

- `.env.local` - Contains real secrets, **NEVER commit to git** (in .gitignore)
- `.env.example` - Template with placeholder values, **safe to commit**

---

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Supabase Authentication Guide](https://supabase.com/docs/guides/auth)
- [SAM.gov API Documentation](https://open.gsa.gov/api/get-opportunities-public-api/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

**Audit Status:** ✅ Complete
**MVP Variables Required:** 7
**Recommended Cleanup:** 5 variables to remove
**Documentation Created:** `.env.example.mvp`
