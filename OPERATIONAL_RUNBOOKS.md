# FedSpace Operational Runbooks

> Quick reference guide for common operational tasks, troubleshooting, and system maintenance.

**Last Updated:** December 23, 2025
**Version:** 1.0.0

---

## Table of Contents

1. [System Health Checks](#system-health-checks)
2. [Common Issues & Fixes](#common-issues--fixes)
3. [Deployment Procedures](#deployment-procedures)
4. [Rollback Procedures](#rollback-procedures)
5. [Database Maintenance](#database-maintenance)
6. [API Key Rotation](#api-key-rotation)
7. [Cache Cleanup](#cache-cleanup)
8. [Performance Monitoring](#performance-monitoring)
9. [Alert Response Guides](#alert-response-guides)
10. [Emergency Contacts](#emergency-contacts)

---

## System Health Checks

### Quick Health Check

```bash
# Check overall system health
curl https://fedspace.vercel.app/api/health | jq

# Expected response (healthy):
{
  "status": "healthy",
  "timestamp": "2025-12-23T21:00:00.000Z",
  "version": "abc1234",
  "environment": "production",
  "checks": {
    "database": { "status": "healthy", "responseTime": 250 },
    "apis": { "status": "healthy", "responseTime": 1200 },
    "cache": { "status": "healthy", "responseTime": 300 }
  }
}
```

### Individual Component Checks

```bash
# Database health
curl https://fedspace.vercel.app/api/health/database | jq

# External APIs health
curl https://fedspace.vercel.app/api/health/apis | jq

# Cache cleanup health
curl https://fedspace.vercel.app/api/health/cache | jq
```

### Health Status Codes

| Status | HTTP Code | Meaning | Action Required |
|--------|-----------|---------|-----------------|
| `healthy` | 200 | All systems operational | None |
| `degraded` | 207 | Some services impaired | Investigate warning |
| `unhealthy` | 503 | Critical failure | Immediate action required |

---

## Common Issues & Fixes

### Issue 1: SAM.gov API Returns 401/403

**Symptoms:**
- "Failed to Load Opportunities" error
- API health check shows SAM.gov unhealthy
- HTTP 401 or 403 errors in logs

**Diagnosis:**
```bash
# Check API key configuration
vercel env pull .env.check --environment=production
grep SAM_API_KEY .env.check | od -c

# Look for trailing newline (common issue)
# BAD:  "SAM-...\n"
# GOOD: "SAM-..."
```

**Fix:**
```bash
# Remove old API key
vercel env rm SAM_API_KEY production

# Add new key (CRITICAL: use printf, NOT echo)
printf "SAM-your-key-here" | vercel env add SAM_API_KEY production

# Verify
vercel env pull .env.verify --environment=production
grep SAM_API_KEY .env.verify | od -c

# Trigger redeployment
vercel --prod
```

**Prevention:**
- Always use `printf` for API keys (never `echo`)
- Test API key immediately after setting
- Document in .env.example

---

### Issue 2: Database Connection Timeout

**Symptoms:**
- Database health check fails
- "Connection timeout" errors
- Slow query response times (> 5s)

**Diagnosis:**
```bash
# Check database health
curl https://fedspace.vercel.app/api/health/database

# Check Neon dashboard
# https://console.neon.tech/app/projects
```

**Fix:**

**Option A: Connection Pool Issues**
```bash
# Check active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Kill idle connections
psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND query_start < NOW() - INTERVAL '5 minutes';"
```

**Option B: Database Resource Limits**
- Check Neon dashboard for CPU/memory usage
- Upgrade compute tier if needed
- Review slow queries: `pg_stat_statements`

**Option C: Network Issues**
- Check Vercel deployment region matches Neon region
- Verify DATABASE_URL is correct
- Test connection from local machine

---

### Issue 3: Cache Cleanup Not Running

**Symptoms:**
- Stale records > 5000
- Cache health check shows "cleanup overdue"
- Old opportunities still visible

**Diagnosis:**
```bash
# Check cache status
curl https://fedspace.vercel.app/api/health/cache | jq

# Check cron job logs
vercel logs --filter="cron/cache-cleanup" --since=24h
```

**Fix:**

**Option A: Manual Cleanup**
```bash
# Trigger cleanup manually
curl -X POST https://fedspace.vercel.app/api/cron/cache-cleanup \
  -H "Authorization: Bearer $CRON_SECRET"

# Verify cleanup
curl https://fedspace.vercel.app/api/health/cache | jq
```

**Option B: Cron Job Configuration**
```bash
# Check vercel.json for cron schedule
cat vercel.json | jq '.crons'

# Expected:
[
  {
    "path": "/api/cron/cache-cleanup",
    "schedule": "0 2 * * *"  // Daily at 2 AM UTC
  }
]

# If missing, add cron job and redeploy
```

---

### Issue 4: AI Extraction Failures

**Symptoms:**
- Low confidence scores (< 70%)
- High fallback rate (> 20%)
- Claude API errors in Sentry

**Diagnosis:**
```bash
# Check AI metrics
curl https://fedspace.vercel.app/api/monitoring/ai-metrics | jq

# Check API key
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model": "claude-3-opus-20240229", "max_tokens": 10, "messages": [{"role": "user", "content": "test"}]}'
```

**Fix:**

**Option A: API Key Issues**
```bash
# Rotate API key
# 1. Generate new key at https://console.anthropic.com
# 2. Update environment variable
printf "sk-ant-api03-new-key" | vercel env add ANTHROPIC_API_KEY production
# 3. Redeploy
vercel --prod
```

**Option B: Model Deprecation**
- Check Claude model availability
- Update model version in `lib/ai/extract-requirements.ts`
- Current model: `claude-3-opus-20240229` (EOL: Jan 5, 2026)

**Option C: Rate Limiting**
- Check Claude API rate limits
- Implement exponential backoff
- Reduce concurrent requests

---

## Deployment Procedures

### Standard Deployment

```bash
# 1. Verify changes locally
npm run build
npm run lint
npm run test

# 2. Commit changes
git add .
git commit -m "Description of changes"

# 3. Push to GitHub (triggers Vercel deployment)
git push origin main

# 4. Monitor deployment
vercel --logs

# 5. Verify health
curl https://fedspace.vercel.app/api/health | jq

# 6. Check Sentry for errors
# https://sentry.io/organizations/fedspace/issues/
```

### Emergency Hotfix

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-fix

# 2. Make minimal changes
# ... edit files ...

# 3. Deploy to preview
vercel

# 4. Test preview deployment
curl https://preview-url.vercel.app/api/health | jq

# 5. Merge and deploy to production
git checkout main
git merge hotfix/critical-fix
git push origin main

# 6. Monitor logs
vercel logs --since=10m
```

---

## Rollback Procedures

### Option 1: Vercel Rollback (Fastest)

```bash
# 1. List recent deployments
vercel ls

# 2. Find last working deployment
vercel inspect <deployment-url>

# 3. Promote to production
vercel promote <deployment-url> --prod

# 4. Verify rollback
curl https://fedspace.vercel.app/api/health | jq
```

### Option 2: Git Revert

```bash
# 1. Find problematic commit
git log --oneline -10

# 2. Revert commit
git revert <commit-hash>

# 3. Push (triggers deployment)
git push origin main
```

### Option 3: Environment Variable Rollback

```bash
# If deployment failed due to env var change

# 1. Check environment variables
vercel env ls

# 2. Remove problematic variable
vercel env rm <VAR_NAME> production

# 3. Re-add correct value
printf "correct-value" | vercel env add <VAR_NAME> production

# 4. Redeploy
vercel --prod
```

---

## Database Maintenance

### Weekly Tasks

```bash
# 1. Check database size
psql $DATABASE_URL -c "\l+"

# 2. Vacuum old records
psql $DATABASE_URL -c "VACUUM ANALYZE;"

# 3. Check for bloat
psql $DATABASE_URL -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC LIMIT 10;"
```

### Monthly Tasks

```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# 2. Upload to secure storage
# (Neon provides automatic backups, but keep local copy)

# 3. Test restore on dev environment
psql $DEV_DATABASE_URL < backup_20251223.sql

# 4. Review slow queries
psql $DATABASE_URL -c "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

### Database Schema Changes

```bash
# 1. Create migration file
mkdir -p supabase/migrations
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_description.sql << 'EOF'
-- Migration: Description
-- Created: $(date)

BEGIN;

-- Your changes here
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS new_field TEXT;

COMMIT;
EOF

# 2. Test locally
supabase db push

# 3. Apply to production
# (Neon auto-applies via Git push)
```

---

## API Key Rotation

### SAM.gov API Key

**When to Rotate:**
- Every 90 days (recommended)
- After team member departure
- If key appears in logs/error messages

**Rotation Steps:**
```bash
# 1. Generate new key at https://open.gsa.gov/api/

# 2. Test new key locally
export SAM_API_KEY="new-key"
npm run dev
# Test opportunity loading

# 3. Update production (CRITICAL: use printf)
printf "new-key" | vercel env add SAM_API_KEY production

# 4. Redeploy
vercel --prod

# 5. Verify
curl https://fedspace.vercel.app/api/health/apis | jq

# 6. Revoke old key at https://open.gsa.gov/api/
```

### Claude API Key (Anthropic)

```bash
# 1. Generate new key at https://console.anthropic.com

# 2. Test new key
export ANTHROPIC_API_KEY="sk-ant-api03-new"
node test-claude-api-direct.js

# 3. Update production
printf "sk-ant-api03-new" | vercel env add ANTHROPIC_API_KEY production

# 4. Redeploy and verify
vercel --prod
curl https://fedspace.vercel.app/api/health/apis | jq
```

### CRON_SECRET

```bash
# 1. Generate new secret
openssl rand -hex 32

# 2. Update environment
printf "new-secret-here" | vercel env add CRON_SECRET production

# 3. Update monitoring tools
# (e.g., UptimeRobot cron job auth)

# 4. Redeploy
vercel --prod
```

---

## Cache Cleanup

### Manual Cleanup

```bash
# Trigger cleanup job
curl -X POST https://fedspace.vercel.app/api/cron/cache-cleanup \
  -H "Authorization: Bearer $CRON_SECRET"

# Monitor cleanup
curl https://fedspace.vercel.app/api/health/cache | jq

# Check logs
vercel logs --filter="cache-cleanup" --since=1h
```

### Automated Cleanup Schedule

**Default:** Daily at 2:00 AM UTC

**Configuration:** `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/cache-cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Cleanup Thresholds

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Stale Records | < 1,000 | 1,000 - 5,000 | > 5,000 |
| Last Cleanup | < 25 hours | 25-48 hours | > 48 hours |
| Execution Time | < 5s | 5-30s | > 30s |

---

## Performance Monitoring

### Access Monitoring Dashboard

```bash
# Local
http://localhost:3002/dashboard/monitoring

# Production
https://fedspace.vercel.app/dashboard/monitoring
```

### Key Metrics to Monitor

**1. Database Performance**
- Query time: Target < 300ms
- Connection time: Target < 100ms
- Active connections: Target < 10

**2. External APIs**
- SAM.gov response time: Target < 2s
- Claude API response time: Target < 3s
- API error rate: Target < 1%

**3. AI Extraction**
- Cost per extraction: Target < $0.01
- Confidence score: Target > 90%
- Fallback rate: Target < 10%

**4. Cache Cleanup**
- Stale records: Target < 1,000
- Execution time: Target < 5s
- Success rate: Target > 99%

### Sentry Monitoring

**Access:** https://sentry.io/organizations/fedspace/

**Alert Thresholds:**
- Error rate > 10/minute
- Database timeout > 5/hour
- API failures > 20/hour
- Cache cleanup failures > 2/day

---

## Alert Response Guides

### Alert: Database Connection Failure

**Priority:** P1 (Critical)

**Response:**
1. Check Neon status: https://neon.tech/status
2. Verify DATABASE_URL environment variable
3. Check database health endpoint
4. Review Sentry errors for stack traces
5. If persistent > 5 minutes, page on-call engineer

### Alert: SAM.gov API Unavailable

**Priority:** P2 (High)

**Response:**
1. Check SAM.gov status: https://status.data.gov
2. Verify API key is valid
3. Check rate limits (max 1000/hour)
4. If SAM.gov is down, wait for recovery
5. If > 1 hour, notify users via status page

### Alert: High Error Rate

**Priority:** P2 (High)

**Response:**
1. Check Sentry dashboard for error types
2. Identify common error patterns
3. If new deployment, consider rollback
4. If external service, check status pages
5. Create incident report

### Alert: Cache Cleanup Failed

**Priority:** P3 (Medium)

**Response:**
1. Check cache health endpoint
2. Trigger manual cleanup
3. Review database connection
4. If stale records > 5000, escalate to P2
5. Schedule post-mortem if recurring

---

## Emergency Contacts

| Role | Contact | Primary Responsibility |
|------|---------|----------------------|
| On-Call Engineer | TBD | System incidents |
| DevOps Lead | TBD | Infrastructure issues |
| Database Admin | TBD | Database performance |
| Security Team | TBD | Security incidents |

### Escalation Path

1. **L1:** On-Call Engineer (respond within 15min)
2. **L2:** DevOps Lead (respond within 30min)
3. **L3:** CTO (respond within 1 hour)

### Service Providers

- **Hosting:** Vercel (support@vercel.com)
- **Database:** Neon (support@neon.tech)
- **Error Tracking:** Sentry (support@sentry.io)
- **SAM.gov API:** GSA (https://open.gsa.gov/api/support)
- **Claude API:** Anthropic (support@anthropic.com)

---

## Appendix

### Useful Commands

```bash
# View production logs (last 1 hour)
vercel logs --since=1h

# View specific deployment logs
vercel logs <deployment-url>

# Check environment variables
vercel env ls

# Pull environment variables
vercel env pull .env.production.local --environment=production

# Redeploy current commit
vercel --prod

# List all deployments
vercel ls
```

### Monitoring URLs

- **Health Check:** https://fedspace.vercel.app/api/health
- **Monitoring Dashboard:** https://fedspace.vercel.app/dashboard/monitoring
- **Sentry:** https://sentry.io/organizations/fedspace/
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Neon Dashboard:** https://console.neon.tech/

---

**Last Updated:** December 23, 2025
**Version:** 1.0.0
**Maintained by:** DevOps Team
