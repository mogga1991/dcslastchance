# FedSpace - Project Documentation for Claude

> This file provides context and critical lessons learned for AI assistants working on the FedSpace codebase.

## Project Overview

**FedSpace** is a commercial real estate platform connecting property owners with federal government leasing opportunities. It helps brokers list properties and automatically matches them with GSA (General Services Administration) lease requirements from SAM.gov.

### Core Features
- Property listing and management for commercial real estate brokers
- GSA lease opportunity discovery and matching
- Interactive map visualization of federal opportunities
- SAM.gov API integration for real-time government contract data
- Automated property-to-opportunity matching algorithm

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React, TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| APIs | SAM.gov (federal opportunities), Google Maps |
| Database | Neon PostgreSQL |
| Hosting | Vercel (frontend + API routes) |

---

## 🚨 CRITICAL: SAM.gov API Key Deployment Issue

### Problem
The SAM.gov API is the **most important part of the tool**. Without it, users cannot see federal leasing opportunities.

**NEVER use `echo` when setting the SAM_API_KEY environment variable in Vercel.**

### Why This Breaks
```bash
# ❌ WRONG - Adds invisible newline character (\n)
echo "SAM-14274bd4-8901-4223-812b-645db7055ac0" | vercel env add SAM_API_KEY production

# Result: SAM_API_KEY="SAM-14274bd4-8901-4223-812b-645db7055ac0\n"
# SAM.gov rejects with: 403 Forbidden - API_KEY_INVALID
```

The `echo` command automatically appends a newline character (`\n`) which becomes part of the API key value. SAM.gov's API validation fails because the key includes this hidden character.

### Correct Solution
```bash
# ✅ CORRECT - Use printf (no newline)
printf "SAM-14274bd4-8901-4223-812b-645db7055ac0" | vercel env add SAM_API_KEY production

# Verify it's clean:
vercel env pull .env.check --environment=production
grep SAM_API_KEY .env.check | od -c  # Should NOT show \n before the final quote
```

### Verification Steps
After setting the SAM_API_KEY:

1. **Pull and inspect:**
   ```bash
   vercel env pull .env.verify --environment=production
   grep SAM_API_KEY .env.verify | od -c
   ```

2. **Look for the pattern:**
   - ✅ Good: `"   S   A   M   -   ...   a   c   0   "  \n`
   - ❌ Bad: `"   S   A   M   -   ...   a   c   0   \   n   "  \n`

3. **Test the API:**
   After deployment, check production logs:
   ```bash
   vercel logs <deployment-url> --json | grep -i "sam\|api_key"
   ```

### Environment Variables Checklist

**Required for Production:**
- ✅ `SAM_API_KEY` - SAM.gov API key (use `printf`, NOT `echo`)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public key
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key
- ✅ `DATABASE_URL` - Neon PostgreSQL connection string
- ✅ `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key
- ✅ `GOOGLE_CLIENT_ID` - OAuth authentication
- ✅ `GOOGLE_CLIENT_SECRET` - OAuth authentication
- ✅ `OPENAI_API_KEY` - AI features
- ✅ `CRON_SECRET` - Scheduled jobs security

**Legacy/Remove:**
- ❌ `VITE_SAMGOV_API_KEY` - Duplicate, use `SAM_API_KEY` instead
- ❌ `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Using Google Maps now

---

## 🚨 CRITICAL: Shell Environment Variable Override Issue

### Problem
If `SAM_API_KEY` is set as a shell environment variable (in `.zshrc`, `.bashrc`, or current terminal session), it will **override** the value in `.env.local` and cause 401 API_KEY_INVALID errors.

**Symptoms:**
- `401 Unauthorized - API_KEY_INVALID` errors from SAM.gov
- Works in production but fails locally
- `.env.local` has correct key but wrong key is being used

### Root Cause
Shell environment variables take precedence over `.env.local` files in Next.js. An old/expired key stored in shell config will always override the correct key.

### Permanent Solution

**1. Remove from Shell Config Files**
```bash
# Check all shell configs
grep -n "SAM_API_KEY" ~/.zshrc ~/.bashrc ~/.bash_profile ~/.zprofile

# If found, edit the file and remove any lines like:
# export SAM_API_KEY="..."
```

**2. Always Use `./dev.sh` Instead of `npm run dev`**

The project includes a `dev.sh` script that unsets any shell environment variables before starting the dev server:

```bash
#!/bin/bash
# Start dev server without SAM_API_KEY environment variable
# This forces Next.js to use .env.local instead

unset SAM_API_KEY
npm run dev
```

**3. Verify the Fix**
```bash
# Check current shell session
env | grep SAM_API_KEY

# If set, close terminal and open a new one
# Then verify:
./dev.sh  # Should load key from .env.local
```

### Development Workflow
```bash
# ❌ WRONG - May use shell env var
npm run dev

# ✅ CORRECT - Always use this
./dev.sh
```

**The `./dev.sh` script is now the official way to start the development server.**

---

## Key Files Reference

### SAM.gov Integration
- `lib/sam-gov.ts` - SAM.gov API client with all opportunity fetching logic
- `app/api/gsa-leasing/route.ts` - API endpoint for GSA lease opportunities
- `app/api/opportunities/route.ts` - General opportunities endpoint

### Property Management
- `app/dashboard/my-properties/_components/my-properties-client.tsx` - Main properties list (enterprise table layout)
- `app/dashboard/my-properties/_components/properties-table.tsx` - Sortable table with expandable rows
- `app/dashboard/my-properties/_components/enhanced-stats-cards.tsx` - 6 KPI cards dashboard
- `app/dashboard/broker-listing/_components/list-property-client.tsx` - Property listing form

### GSA Leasing Features
- `app/dashboard/gsa-leasing/_components/gsa-map-with-iolp.tsx` - Interactive map with opportunities
- `lib/iolp.ts` - GSA IOLP (Inventory of Owned and Leased Properties) adapter

---

## Database Schema

### Main Tables (Supabase/Neon)
- `broker_listings` - Properties listed by brokers
- `opportunities` - GSA lease opportunities from SAM.gov
- `users` - User accounts (Supabase Auth)
- `property_matches` - Automated property-opportunity matches
- `saved_opportunities` - User bookmarks

---

## Development Workflow

### Local Development
```bash
./dev.sh             # ✅ Start dev server (ALWAYS USE THIS - prevents env var conflicts)
npm run build        # Production build
npm run lint         # ESLint check
```

**IMPORTANT:** Always use `./dev.sh` instead of `npm run dev` to avoid shell environment variable conflicts with SAM_API_KEY.

### Deployment to Vercel
```bash
# 1. Commit changes
git add .
git commit -m "Description of changes"

# 2. Push to GitHub
git push origin main

# 3. Deploy to production
vercel --prod
```

### Environment Variables
```bash
# Pull production env vars
vercel env pull .env.production.local --environment=production

# Add new env var (use printf for API keys!)
printf "value-without-newline" | vercel env add VAR_NAME production

# List all env vars
vercel env ls
```

---

## Common Issues & Solutions

### Issue: "Failed to Load Opportunities" (HTTP 500)
**Cause:** SAM_API_KEY has invisible newline character
**Solution:** Remove and re-add using `printf` (see Critical section above)

### Issue: "Invalid login credentials" (Supabase)
**Cause:** User account doesn't exist or wrong credentials
**Solution:** Create account via sign-up flow, or use test account

### Issue: Local works but production fails
**Cause:** Environment variables not set in Vercel
**Solution:** Check `vercel env ls` and add missing vars

---

## SAM.gov API Details

### Official GSA Lease Filters
The app uses the **exact same filters** as the official GSA Lease Contract Opportunities Map:

```typescript
{
  department: "GENERAL SERVICES ADMINISTRATION",
  subTier: "PUBLIC BUILDINGS SERVICE",
  naicsCode: "531120",  // Lessors of Nonresidential Buildings
  noticeTypes: ["o", "p", "k", "r", "s"],  // Various solicitation types
  filterByResponseDate: true  // Only active opportunities
}
```

Reference: https://leasing.gsa.gov/leasing/s/lease-contract-opportunities-map

### API Endpoints
- **Base URL:** `https://api.sam.gov/opportunities/v2/search`
- **Rate Limit:** Unknown, but we cache responses for 5 minutes
- **Max Records:** 1000 per request
- **Date Format:** `MM/DD/YYYY`

---

## Recent Updates

### December 2024
- ✅ Redesigned My Properties page with enterprise table layout
- ✅ Added 6 KPI stats cards (Total Properties, Active Listings, Matches, Views, Avg Match Score, Expiring Soon)
- ✅ Implemented sortable columns and expandable rows for opportunity matches
- ✅ Removed search bar and filter dropdowns for cleaner interface
- ✅ Fixed SAM.gov API key deployment issue (newline character problem)
- ✅ Added `.env.production` to `.gitignore` for security

---

## Security Best Practices

### DO NOT Commit These Files
- `.env.local`
- `.env.production`
- `.env.development`
- Any file containing API keys or secrets

### Where Secrets Should Live
- **Local Development:** `.env.local` (gitignored)
- **Production:** Vercel Dashboard → Project → Settings → Environment Variables
- **Never:** Git repository

---

## Contact & Resources

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard
- **SAM.gov API Docs:** https://open.gsa.gov/api/opportunities-api/
- **GitHub Repository:** https://github.com/mogga1991/dcslastchance

---

*Last updated: December 16, 2024*
