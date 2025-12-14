# RLP Scout Deployment Guide
## Connecting to www.rlpscout.ai

This guide will help you deploy the RLP Scout platform and configure it to run on www.rlpscout.ai.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Vercel Domain Configuration](#vercel-domain-configuration)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Deployment Steps](#deployment-steps)
6. [Testing the Deployment](#testing-the-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [x] Vercel account with access to the project
- [x] DNS access for rlpscout.ai domain
- [x] Supabase project configured
- [x] All required API keys (Google Maps, OpenAI, SAM.gov, etc.)

---

## Vercel Domain Configuration

### Step 1: Access Vercel Project Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project (currently named "sentyr" or similar)
3. Click on **Settings** → **Domains**

### Step 2: Add Custom Domain

1. Click **Add Domain**
2. Enter: `www.rlpscout.ai`
3. Click **Add**

### Step 3: Configure DNS Records

Vercel will provide you with DNS configuration instructions. You need to add the following records to your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare):

**For www.rlpscout.ai:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto or 300
```

**For rlpscout.ai (root domain):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto or 300
```

**Optional - Redirect root to www:**
```
Type: CNAME
Name: @
Value: www.rlpscout.ai
```

### Step 4: Wait for DNS Propagation

- DNS propagation can take 24-48 hours but usually completes within 1-2 hours
- Check status at: https://dnschecker.org/

### Step 5: Enable HTTPS

1. Once DNS is verified, Vercel automatically provisions SSL certificates
2. In Vercel → Settings → Domains, you should see a green checkmark
3. Force HTTPS redirect (recommended):
   - Settings → Domains → Click on your domain
   - Enable "Redirect to HTTPS"

---

## Environment Variables

### Update Environment Variables in Vercel

Go to **Settings** → **Environment Variables** and update:

```bash
# Application URL - IMPORTANT: Update this!
NEXT_PUBLIC_APP_URL=https://www.rlpscout.ai

# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=https://clxqdctofuxqjjonvytm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth - Update redirect URIs
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# API Keys (Already configured)
OPENAI_API_KEY=sk-proj-Z-0ytYn8xgXsR8Y40F...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCuqnLAx_kSUMprV1KQICPSCwF1uj-IbwY
SAM_API_KEY=SAM-1abfb99d-51f0-4024-9fc4-a495a886c1c0

# Cron Secret (for scheduled jobs)
CRON_SECRET=supersecretcrontoken123456789
```

### Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add these Authorized redirect URIs:
   ```
   https://www.rlpscout.ai/api/auth/callback/google
   https://rlpscout.ai/api/auth/callback/google
   ```
6. Add these Authorized JavaScript origins:
   ```
   https://www.rlpscout.ai
   https://rlpscout.ai
   ```
7. Click **Save**

---

## Database Setup

### Complete Supabase Migration

The scoring system requires three new database tables. Run these commands:

```bash
# 1. Repair migration history
cd /Users/georgemogga/Downloads/dcslasttry
supabase migration repair --status applied 20251213220000

# 2. Push migrations (if it fails, use SQL directly)
supabase db push

# OR manually apply via Supabase Dashboard:
# Go to https://supabase.com/dashboard/project/clxqdctofuxqjjonvytm/editor
# Run the SQL from: supabase/migrations/20251213220000_create_properties_and_brokers.sql
```

### Verify Tables Created

Check that these tables exist in your Supabase database:

1. `properties` - Stores broker property listings
2. `broker_profiles` - Stores broker experience and certifications
3. `property_scores` - Caches property-to-opportunity match scores

### Enable PostGIS Extension (for location scoring)

If you get errors related to `ll_to_earth`, enable PostGIS:

```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;
```

---

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Deployments**
4. Click **Redeploy** on the latest deployment
5. Check "Use existing build cache" for faster deployment
6. Click **Redeploy**

### Method 2: Deploy via GitHub (Recommended)

1. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: Add property matching scoring system for www.rlpscout.ai"
   git push origin main
   ```

2. Vercel will automatically detect the push and deploy

### Method 3: Deploy via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

---

## Testing the Deployment

### 1. Test Domain Access

Visit these URLs and verify they load correctly:

- https://www.rlpscout.ai
- https://rlpscout.ai (should redirect to www)
- https://www.rlpscout.ai/dashboard

### 2. Test Authentication

1. Click **Sign In** on the homepage
2. Try logging in with Google OAuth
3. Verify you're redirected to the dashboard

### 3. Test Scoring System

#### Option A: Via Broker Listing Page

1. Navigate to: https://www.rlpscout.ai/dashboard/broker-listing
2. You should see property cards with match scores
3. Click "Show Details" on a score to see the breakdown

#### Option B: Via API

```bash
# Get opportunity ID from database
curl -X POST https://www.rlpscout.ai/api/scoring/calculate-match \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "propertyId": "PROPERTY_UUID",
    "opportunityId": "OPPORTUNITY_UUID"
  }'
```

### 4. Test Cron Jobs

Verify that the scheduled job for syncing opportunities works:

```bash
# Manually trigger cron (requires CRON_SECRET)
curl https://www.rlpscout.ai/api/cron/sync-opportunities?source=both \
  -H "Authorization: Bearer supersecretcrontoken123456789"
```

### 5. Check Logs

Monitor deployment logs in Vercel:

1. Go to **Deployments**
2. Click on the latest deployment
3. View **Runtime Logs** tab
4. Look for any errors

---

## Scoring System Architecture

### How It Works

1. **Broker lists a property** → Creates record in `properties` table
2. **Government posts opportunity** → Synced to `opportunities` table
3. **System calculates match** → POST to `/api/scoring/calculate-match`
4. **Score is cached** → Stored in `property_scores` for 24 hours
5. **Display on Broker Listing** → `PropertyMatchScore` component shows results

### Scoring Categories (Weighted)

| Category   | Weight | What It Measures                      |
|------------|--------|---------------------------------------|
| Location   | 30%    | Distance from delineated area         |
| Space      | 25%    | Square footage compliance             |
| Building   | 20%    | Class, features, accessibility        |
| Timeline   | 15%    | Availability vs. occupancy date       |
| Experience | 10%    | Gov lease history, certifications     |

### Grade Scale

| Score    | Grade | Meaning                           |
|----------|-------|-----------------------------------|
| 85-100   | A     | Excellent match, highly competitive |
| 70-84    | B     | Good match, competitive           |
| 55-69    | C     | Fair match, may need adjustments  |
| 40-54    | D     | Weak match, significant gaps      |
| 0-39     | F     | Poor match, likely not viable     |

---

## Troubleshooting

### Domain Not Working

**Problem:** www.rlpscout.ai shows "DNS_PROBE_FINISHED_NXDOMAIN"

**Solutions:**
1. Verify DNS records are correct (check with `nslookup www.rlpscout.ai`)
2. Wait longer for DNS propagation (up to 48 hours)
3. Clear your browser DNS cache:
   - Chrome: chrome://net-internals/#dns → "Clear host cache"
   - Safari: Empty Caches
   - Command line: `sudo dscacheutil -flushcache`

### SSL Certificate Not Provisioning

**Problem:** "Your connection is not private" error

**Solutions:**
1. Wait 10-15 minutes after DNS verification
2. Check Vercel → Settings → Domains - Should show "Valid Configuration"
3. If stuck, remove domain and re-add it in Vercel

### API Errors: "Property not found"

**Problem:** `/api/scoring/calculate-match` returns 404

**Solutions:**
1. Verify `properties` table exists in Supabase
2. Run the SQL migration manually:
   ```bash
   # Copy SQL from: supabase/migrations/20251213220000_create_properties_and_brokers.sql
   # Paste in Supabase Dashboard → SQL Editor
   ```
3. Insert test property data to verify table works

### Google OAuth Fails

**Problem:** "redirect_uri_mismatch" error

**Solutions:**
1. Update Google Cloud Console with correct URIs:
   - https://www.rlpscout.ai/api/auth/callback/google
2. Redeploy in Vercel to ensure env vars are updated
3. Clear cookies and try again

### Scoring Returns All Zeros

**Problem:** Match scores show 0 or grade "F"

**Solutions:**
1. Check that opportunity has valid location data (`pop_state_code`, `pop_city_name`)
2. Verify property has required fields (`city`, `state`, `latitude`, `longitude`)
3. Review browser console for JavaScript errors
4. Check API response in Network tab for detailed error messages

---

## Post-Deployment Checklist

- [ ] Domain resolves to https://www.rlpscout.ai
- [ ] SSL certificate is active (no browser warnings)
- [ ] Root domain (rlpscout.ai) redirects to www
- [ ] Authentication works (Google OAuth)
- [ ] Dashboard loads without errors
- [ ] Broker Listing page shows properties
- [ ] Match scores display correctly
- [ ] API endpoint `/api/scoring/calculate-match` works
- [ ] Cron jobs are scheduled (check Vercel → Settings → Cron Jobs)
- [ ] Environment variable `NEXT_PUBLIC_APP_URL` is set to production URL
- [ ] Database tables exist: `properties`, `broker_profiles`, `property_scores`

---

## Support & Resources

### Documentation
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

### Monitoring
- **Vercel Analytics:** Check performance at Vercel Dashboard → Analytics
- **Supabase Logs:** Monitor database at Supabase Dashboard → Logs
- **Error Tracking:** Set up Sentry or similar for production error monitoring

### Key Files
- Scoring Logic: `/lib/scoring/`
- API Endpoint: `/app/api/scoring/calculate-match/route.ts`
- UI Component: `/components/broker/property-match-score.tsx`
- Database Schema: `/supabase/migrations/20251213220000_create_properties_and_brokers.sql`

---

## Next Steps After Deployment

1. **Add Real Property Data**
   - Create properties via Supabase Dashboard or build admin interface
   - Import CSV of broker property listings

2. **Enhance Requirement Extraction**
   - Currently uses defaults for space/building requirements
   - Integrate AI parsing of RFP documents for accurate requirements

3. **Set Up Monitoring**
   - Configure error tracking (Sentry recommended)
   - Set up uptime monitoring (Pingdom, UptimeRobot)
   - Enable Vercel Analytics

4. **Performance Optimization**
   - Enable caching for property scores (already implemented)
   - Add Redis for session management if needed
   - Optimize images and assets

---

**Deployment completed!** 🎉

Your RLP Scout platform should now be live at **https://www.rlpscout.ai** with full property-to-opportunity matching scoring functionality.
