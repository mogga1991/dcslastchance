# Daily Property Matching Cron Job - Setup Guide

## Overview

The daily cron job automatically matches all properties with GSA opportunities every day at 2:30 AM.

**Endpoint:** `/api/cron/match-properties`
**Schedule:** `0 30 2 * * *` (2:30 AM daily)
**Min Score:** 40 (qualified threshold)

---

## Local Testing

### 1. Start dev server
```bash
npm run dev
```

### 2. Test the cron endpoint
```bash
# In another terminal:
node test-cron-endpoint.js
```

This will:
- ✅ Test successful request with correct secret
- ✅ Test unauthorized request with wrong secret
- ✅ Display matching stats

---

## Production Deployment

### 1. Ensure CRON_SECRET is set in Vercel

Check if the environment variable exists:
```bash
vercel env ls
```

If `CRON_SECRET` is not listed, add it:
```bash
# Generate a secure random secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to Vercel (all environments):
printf "your-generated-secret-here" | vercel env add CRON_SECRET production
printf "your-generated-secret-here" | vercel env add CRON_SECRET preview
printf "your-generated-secret-here" | vercel env add CRON_SECRET development
```

### 2. Deploy to Vercel

```bash
# Commit changes
git add .
git commit -m "Add daily property matching cron job"

# Deploy to production
vercel --prod
```

### 3. Verify cron job is registered

After deployment, check Vercel Dashboard:
1. Go to your project → Settings → Cron Jobs
2. You should see:
   - Path: `/api/cron/match-properties`
   - Schedule: `0 30 2 * * *`
   - Status: Active

### 4. Manually trigger for testing

You can manually trigger the cron job to test it works:

```bash
# Get your production URL
PROD_URL="https://your-domain.vercel.app"

# Get CRON_SECRET from Vercel
vercel env pull .env.production.local --environment=production
CRON_SECRET=$(grep CRON_SECRET .env.production.local | cut -d '=' -f2)

# Test the endpoint
curl -H "Authorization: Bearer $CRON_SECRET" \
  "$PROD_URL/api/cron/match-properties"
```

Expected response:
```json
{
  "success": true,
  "timestamp": "2024-12-20T02:30:00.000Z",
  "stats": {
    "propertiesChecked": 32,
    "opportunitiesChecked": 4,
    "matched": 9,
    "durationMs": 1234
  }
}
```

---

## Monitoring

### View cron job logs in Vercel:

1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by:
   - Path: `/api/cron/match-properties`
   - Time: Around 2:30 AM UTC

### Check for errors:

```bash
# View recent logs
vercel logs --follow

# Search for cron-related logs
vercel logs | grep -i cron
```

---

## How It Works

1. **2:30 AM UTC** - Vercel's cron scheduler triggers the endpoint
2. **Authorization** - Vercel sends `Authorization: Bearer <CRON_SECRET>`
3. **Matching** - Endpoint calls `matchPropertiesWithOpportunities()`
4. **Database** - New/updated matches are stored in `property_matches` table
5. **Logging** - Stats are logged: properties checked, opportunities checked, matches found

---

## Customization

### Change schedule

Edit `vercel.json`:
```json
{
  "path": "/api/cron/match-properties",
  "schedule": "0 30 2 * * *"  // Change this cron expression
}
```

Cron expression examples:
- `0 30 2 * * *` - 2:30 AM daily (current)
- `0 0 * * *` - Midnight daily
- `0 0 */6 * *` - Every 6 hours
- `0 0 * * 0` - Weekly on Sunday

### Change min score threshold

Edit `app/api/cron/match-properties/route.ts`:
```typescript
const stats = await matchPropertiesWithOpportunities(
  supabaseUrl,
  serviceRoleKey,
  40  // Change this (current: 40 = qualified threshold)
);
```

---

## Troubleshooting

### Error: "Unauthorized"
**Cause:** CRON_SECRET mismatch
**Fix:** Ensure CRON_SECRET in Vercel matches what cron sends

### Error: "Supabase not configured"
**Cause:** Missing Supabase env vars
**Fix:** Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### No matches found
**Cause:** Properties and opportunities don't overlap (states, sqft, etc.)
**Fix:** Check logs for score breakdowns, verify opportunity data is current

### Cron job not running
**Cause:** vercel.json not deployed or cron not enabled
**Fix:** Redeploy with `vercel --prod`, check Vercel Dashboard → Settings → Cron Jobs

---

## Related Files

- `app/api/cron/match-properties/route.ts` - Cron endpoint
- `lib/scoring/match-properties.ts` - Matching engine
- `vercel.json` - Cron schedule configuration
- `test-cron-endpoint.js` - Local testing script
