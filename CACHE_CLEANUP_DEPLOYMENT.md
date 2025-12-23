# Cache Cleanup Deployment Guide

**Feature**: Automated daily cleanup of expired cache records
**Files**: `/api/cron/cleanup-cache`, `vercel.json`
**Sprint**: Sprint 2
**Status**: ✅ Ready for Production

---

## Overview

The cache cleanup system automatically removes expired records from two cache tables:
- `federal_neighborhood_scores` (Patent #1 - Federal Neighborhood Scoring)
- `property_match_scores` (Patent #2 - Property Match Scoring)

**Why This Matters**: Without automated cleanup, expired cache records accumulate indefinitely, causing:
- Database bloat (storage costs increase)
- Slower queries (more records to scan)
- Stale data being served (cache hits on expired entries)

**Solution**: Daily cron job that calls PostgreSQL function `cleanup_expired_cache()` at 3 AM UTC.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Vercel Cron Job (Daily at 3 AM UTC)                       │
│  Configured in vercel.json                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  GET /api/cron/cleanup-cache                                │
│  - Verifies CRON_SECRET in Authorization header            │
│  - Calls Supabase RPC: cleanup_expired_cache()             │
│  - Returns deletion count + metrics                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL Function: cleanup_expired_cache()               │
│  - DELETE FROM federal_neighborhood_scores WHERE expired   │
│  - DELETE FROM property_match_scores WHERE expired         │
│  - Returns total deleted count                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Pre-Deployment Checklist

### 1. Database Migration ✅
The cleanup function has been created in the database:

```sql
-- Function: cleanup_expired_cache()
-- Returns: INTEGER (count of deleted records)
-- Security: DEFINER (runs with elevated permissions)
```

**Verify it exists:**
```bash
node scripts/run-migration.js supabase/migrations/20251223000000_create_cache_cleanup_function.sql
```

Or query directly:
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'cleanup_expired_cache';
```

### 2. Environment Variables

**Critical**: Set `CRON_SECRET` in Vercel environment variables.

#### Generate a Secure Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (64-character hex string).

#### Add to Vercel
```bash
# Using Vercel CLI
printf "YOUR_GENERATED_SECRET_HERE" | vercel env add CRON_SECRET production

# Or via Vercel Dashboard:
# 1. Go to Project Settings → Environment Variables
# 2. Add variable:
#    Name: CRON_SECRET
#    Value: [paste your secret]
#    Environment: Production
#    Save
```

**⚠️ CRITICAL**: Use `printf`, NOT `echo`! (echo adds newline character)

### 3. Verify Existing Env Vars
Ensure these are set in production:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (for RPC calls)
- ✅ `DATABASE_URL`

---

## Deployment Steps

### Step 1: Deploy to Production
```bash
# Commit changes (if not already)
git add .
git commit -m "Add automated cache cleanup (Sprint 2)"

# Push to GitHub (triggers auto-deployment on Vercel)
git push origin main

# Or manual deployment
vercel --prod
```

### Step 2: Verify Cron Job Registration
After deployment:

1. **Vercel Dashboard → Project → Settings → Cron Jobs**
2. You should see:
   ```
   Path: /api/cron/cleanup-cache
   Schedule: 0 3 * * * (Daily at 3:00 AM UTC)
   Status: Active
   ```

### Step 3: Test the Endpoint Manually

#### Option A: Manual POST (Authenticated)
```bash
# Get auth token from Supabase
curl -X POST https://your-project.vercel.app/api/cron/cleanup-cache \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN"
```

#### Option B: Simulate Cron (Production)
```bash
# Using CRON_SECRET
curl -X GET https://your-project.vercel.app/api/cron/cleanup-cache \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2024-12-23T15:30:00.000Z",
  "deleted_records": 3,
  "remaining_cache_entries": {
    "federal_neighborhood_scores": 45,
    "property_match_scores": 128,
    "total": 173
  },
  "performance": {
    "duration_ms": 62,
    "avg_ms_per_record": "20.67"
  }
}
```

### Step 4: Monitor First Automatic Execution

**Next Day After Deployment (3:01 AM UTC):**

1. Check Vercel logs:
   ```bash
   vercel logs --prod | grep cleanup-cache
   ```

2. Look for:
   ```
   ✅ Cache cleanup completed: 5 records deleted
   📊 Performance: 58ms total, 11.6ms per record
   ```

3. Check Supabase database:
   ```sql
   -- Should only have records with expires_at > NOW()
   SELECT COUNT(*) as expired_count
   FROM federal_neighborhood_scores
   WHERE expires_at < NOW();

   -- Should return 0
   ```

---

## Monitoring & Maintenance

### Daily Health Check
Monitor the cron job execution in Vercel dashboard:
- **Settings → Cron Jobs → View Executions**

Look for:
- ✅ Status: Success
- ⏱️ Duration: < 1 second
- 📊 Deletion counts: Varies based on traffic

### Weekly Review
Run this query weekly to ensure cleanup is working:

```sql
-- Check for expired records (should be 0)
SELECT
  'federal_neighborhood_scores' as table_name,
  COUNT(*) as expired_records
FROM federal_neighborhood_scores
WHERE expires_at < NOW()
UNION ALL
SELECT
  'property_match_scores',
  COUNT(*)
FROM property_match_scores
WHERE expires_at < NOW();
```

**Expected Result**: Both counts should be 0 (or very low if cron just missed)

### Alerts Setup (Optional)
Consider setting up alerts if deletion count is unusually high:

```typescript
// In the cron endpoint
if (deletedCount > 10000) {
  // Send alert (email, Slack, etc.)
  console.warn(`⚠️ High deletion count: ${deletedCount} records`);
}
```

---

## Troubleshooting

### Problem: 401 Unauthorized Error
**Cause**: `CRON_SECRET` not set or incorrect

**Fix**:
```bash
# Check if secret exists
vercel env ls | grep CRON_SECRET

# Re-add if missing
printf "NEW_SECRET" | vercel env add CRON_SECRET production
vercel --prod  # Redeploy
```

### Problem: Cron Job Not Running
**Cause**: Cron job not registered in `vercel.json`

**Fix**: Verify `vercel.json` contains:
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-cache",
      "schedule": "0 3 * * *"
    }
  ]
}
```

Redeploy after fixing.

### Problem: Function Returns Error
**Cause**: Database function not created or permission issues

**Fix**:
```bash
# Re-run migration
node scripts/run-migration.js supabase/migrations/20251223000000_create_cache_cleanup_function.sql

# Check function exists
psql $DATABASE_URL -c "SELECT routine_name FROM information_schema.routines WHERE routine_name = 'cleanup_expired_cache';"
```

### Problem: No Records Deleted (deletedCount = 0)
**This is normal!** It means:
- No expired records exist (good!)
- Cache is being served correctly
- TTL is 24 hours, so if no cache entries are > 24 hours old, nothing deletes

**Only worry if**:
- Count is 0 for many consecutive days
- You see expired records in manual query

---

## Rollback Plan

If issues arise after deployment:

### Option 1: Disable Cron Job
```bash
# Remove cron config from vercel.json
# Redeploy
vercel --prod
```

### Option 2: Manual Cleanup
Run cleanup manually via Supabase SQL editor:
```sql
SELECT cleanup_expired_cache();
```

### Option 3: Full Rollback
```bash
# Revert to previous deployment
vercel rollback [previous-deployment-url]
```

---

## Performance Expectations

Based on testing:
- **Execution Time**: 50-100ms (including network overhead)
- **Records per Batch**: 0-1000 (varies by traffic)
- **Database Load**: Minimal (indexed DELETE operations)
- **Cold Start**: ~500ms (first invocation in 24h)

---

## Security Considerations

1. **CRON_SECRET**: Keep secret, rotate quarterly
2. **Authorization**: Only Vercel cron + authenticated users can trigger
3. **SECURITY DEFINER**: Function runs with elevated permissions (intentional)
4. **Audit Logging**: All executions logged in Vercel

---

## Cost Impact

- **Vercel Cron**: Free (included in all plans)
- **Database Storage**: Reduced (cleanup prevents bloat)
- **Database Queries**: Negligible (1 RPC call/day)

**Net Effect**: Cost savings from reduced storage

---

## Success Metrics

After 1 week of deployment:
- ✅ Zero expired cache records in database
- ✅ 100% cron job success rate
- ✅ < 100ms average execution time
- ✅ No error alerts

After 1 month:
- 📉 Database size stable (not growing from cache bloat)
- 📊 Cache hit rate maintained
- ⚡ Query performance consistent

---

## Related Documentation

- **API Endpoint**: `app/api/cron/cleanup-cache/route.ts`
- **Database Migration**: `supabase/migrations/20251223000000_create_cache_cleanup_function.sql`
- **Test Script**: `scripts/test-cache-cleanup.js`
- **Sprint 2 Progress**: `SPRINT_2_PROGRESS.md`

---

**Deployment Lead**: Claude Sonnet 4.5
**Date**: December 23, 2024
**Status**: ✅ Ready for Production

*"Automated cleanup - set it and forget it."*
