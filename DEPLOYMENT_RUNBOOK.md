# Deployment Runbook
## 🚀 PERF-007: Production Deployment Procedures

This runbook provides step-by-step procedures for deploying Sprint 1 performance optimizations to production.

---

## Pre-Deployment Checklist

Before deploying, verify all conditions are met:

###  1. All Tests Passing

```bash
# Run full test suite
npm test

# Run performance benchmarks
npm run test:perf

# Run memory profiling
npm run test:memory

# Expected: All tests GREEN
```

**Verification:**
- [ ] Unit tests: 100% passing
- [ ] Integration tests: 100% passing
- [ ] Performance benchmarks: All scenarios < target times
- [ ] Memory profiling: No leaks detected

### 2. Load Tests Validated

```bash
# Install k6 if not already installed
brew install k6  # macOS
# OR download from https://k6.io

# Run load tests against staging
k6 run load-tests/match-properties.js \
  -e API_URL=https://staging.fedspace.ai
```

**Success Criteria:**
- [ ] P95 latency < 5 seconds
- [ ] P99 latency < 8 seconds
- [ ] HTTP failure rate < 1%
- [ ] Zero server errors

### 3. Code Review Approved

- [ ] Pull request created
- [ ] Code review completed
- [ ] All feedback addressed
- [ ] Approval from senior engineer

### 4. Performance Metrics Documented

- [ ] Baseline metrics recorded (see Performance Baseline section)
- [ ] Target metrics defined
- [ ] Monitoring dashboard ready

---

## Deployment Steps

### Step 1: Create Release Branch

```bash
# Create release branch
git checkout -b release/sprint-1-perf-optimization

# Verify branch
git branch --show-current

# Push to remote
git push origin release/sprint-1-perf-optimization
```

**Verification:**
- [ ] Release branch created
- [ ] Branch pushed to GitHub

### Step 2: Final Pre-Deploy Testing

```bash
# Run all tests one final time
npm test

# Run smoke tests against staging
node scripts/smoke-test-production.js

# Verify no uncommitted changes
git status
```

**Verification:**
- [ ] All tests passing
- [ ] Smoke tests passing
- [ ] Working directory clean

### Step 3: Merge to Main

```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge release branch
git merge release/sprint-1-perf-optimization

# Resolve any conflicts (if needed)

# Push to main
git push origin main
```

**Verification:**
- [ ] Merge successful
- [ ] No conflicts
- [ ] Main branch updated

### Step 4: Deploy to Production

```bash
# Deploy to Vercel production
vercel --prod

# Expected output:
# Production: https://your-app.vercel.app [Xs]
```

**Verification:**
- [ ] Deployment successful
- [ ] Deployment URL received
- [ ] Build completed without errors

**⏱️ Expected Duration:** 45-60 seconds

### Step 5: Run Post-Deployment Smoke Tests

```bash
# Wait 30 seconds for deployment to stabilize
sleep 30

# Run smoke tests against production
PRODUCTION_URL=https://dcslasttry-2hpwm5fhk-mogga1991s-projects.vercel.app \
node scripts/smoke-test-production.js
```

**Success Criteria:**
- [ ] All smoke tests passing
- [ ] Homepage loads (< 3s)
- [ ] API health check responsive (< 1s)
- [ ] Database connectivity confirmed
- [ ] No 500 errors

**If Smoke Tests Fail:** Proceed to Rollback Procedure immediately

---

## Post-Deployment Monitoring

### First Hour: Critical Monitoring

Monitor these metrics for the first hour after deployment:

#### Vercel Logs

```bash
# Stream Vercel logs
vercel logs --follow

# OR view in Vercel Dashboard:
# https://vercel.com/dashboard
```

**Watch For:**
- [ ] HTTP 500 errors
- [ ] Database connection failures
- [ ] Timeout errors
- [ ] Memory exceptions

#### Performance Monitoring

```bash
# Start 1-hour performance monitoring
node scripts/monitor-performance.js \
  --duration=3600 \
  --interval=60
```

**Monitor:**
- [ ] P95 latency < 5 seconds
- [ ] Success rate > 99%
- [ ] No significant latency spikes
- [ ] Memory usage stable

#### Database Monitoring

Access Supabase Dashboard:
- URL: https://supabase.com/dashboard
- Check: Connection pool, query performance, error logs

**Monitor:**
- [ ] Connection pool < 80% capacity
- [ ] Query execution times normal
- [ ] No slow queries (> 1s)
- [ ] No deadlocks or conflicts

### 24-Hour: Extended Monitoring

Continue monitoring for 24 hours:

**Metrics to Track:**
- API response times (P50, P95, P99)
- Error rate trend
- Database load patterns
- Memory usage patterns
- User feedback

**Action Items:**
- [ ] Check metrics every 4 hours
- [ ] Review error logs twice daily
- [ ] Document any anomalies
- [ ] Update team on status

---

## Performance Baseline

### Before Optimization (Sprint 0)

| Metric | Value |
|--------|-------|
| 100 properties × 500 opportunities | 10-15 seconds |
| Early termination rate | 0% |
| API P95 latency | Unknown (estimated 10-15s) |
| Memory usage (500 properties) | Unknown |
| Error rate | < 1% |

### After Optimization (Sprint 1 Target)

| Metric | Target | Actual |
|--------|--------|--------|
| 100 properties × 500 opportunities | < 4 seconds | TBD |
| Early termination rate | > 60% | TBD |
| API P95 latency | < 5 seconds | TBD |
| Memory usage (500 properties) | < 1GB | TBD |
| Error rate | < 0.1% | TBD |

---

## Rollback Procedure

If critical issues are detected, rollback immediately.

### When to Rollback

Rollback if ANY of these occur:

- [ ] Smoke tests fail
- [ ] Error rate > 5%
- [ ] P95 latency > 10 seconds
- [ ] Database connectivity issues
- [ ] Memory leaks detected
- [ ] Critical user-reported bugs

### Rollback Steps

```bash
# Option 1: Vercel Rollback (Fastest)
vercel rollback

# Option 2: Revert Git Commit
git revert HEAD
git push origin main
vercel --prod

# Verify rollback
node scripts/smoke-test-production.js
```

**Post-Rollback Actions:**
1. Notify team of rollback
2. Document issue that caused rollback
3. Create incident report
4. Plan fix and re-deployment

---

## Success Validation

### Automated Validation

Run comprehensive validation suite:

```bash
# 1. Smoke tests
node scripts/smoke-test-production.js

# 2. Performance monitoring (15 minutes)
node scripts/monitor-performance.js --duration=900 --interval=30

# 3. Load test (5 minutes)
k6 run load-tests/match-properties.js
```

### Manual Validation

- [ ] Test property listing workflow
- [ ] Test opportunity matching
- [ ] Verify match results accuracy
- [ ] Check UI responsiveness
- [ ] Test on mobile devices

### User Acceptance

- [ ] Internal team testing
- [ ] Beta user feedback
- [ ] Production metrics review
- [ ] No critical bugs reported

---

## Performance Improvements Documentation

### Record Actual Performance

After 24 hours of monitoring, update this section:

**Property Matching Performance:**
```
Before: 100 properties × 500 opportunities = 10-15s
After:  100 properties × 500 opportunities = ___s
Improvement: ___%
```

**Early Termination Efficiency:**
```
Before: 0% of calculations skipped
After:  ___% of calculations skipped
Computation Saved: ___%
```

**API Latency:**
```
P50: ___ms (Target: < 2s)
P95: ___ms (Target: < 5s)
P99: ___ms (Target: < 8s)
```

**Memory Usage:**
```
Average: ___MB
Peak: ___MB
Target: < 1GB for 500 properties
```

**Database Performance:**
```
Query latency (avg): ___ms
Insert rate: ___ records/sec
Connection pool usage: ___%
```

---

## Monitoring Dashboards

### Vercel Analytics

Access: https://vercel.com/dashboard → Project → Analytics

**Monitor:**
- Function execution time
- Error rate
- Geographic distribution
- Traffic patterns

### Supabase Dashboard

Access: https://supabase.com/dashboard → Project → Database

**Monitor:**
- Query performance
- Connection pool
- Database size
- Slow queries

### Custom Performance Monitoring

```bash
# Run continuous monitoring
node scripts/monitor-performance.js --duration=86400 --interval=300

# Generates: performance-monitoring.json
# Review metrics daily
```

---

## Incident Response

### Critical Issues (P0)

**Response Time:** Immediate (< 15 minutes)

**Triggers:**
- Site completely down
- Error rate > 50%
- Data corruption
- Security breach

**Actions:**
1. Execute rollback immediately
2. Page on-call engineer
3. Create incident channel
4. Communicate to stakeholders

### High Priority Issues (P1)

**Response Time:** 1 hour

**Triggers:**
- Error rate > 10%
- P95 latency > 10s
- Feature completely broken
- Database performance degraded

**Actions:**
1. Assess impact and root cause
2. Decide: rollback vs hotfix
3. Implement fix
4. Monitor closely

### Medium Priority Issues (P2)

**Response Time:** 4 hours

**Triggers:**
- Error rate 1-10%
- Performance degradation
- Minor feature broken
- UI issues

**Actions:**
1. Document issue
2. Create bug ticket
3. Schedule fix
4. Monitor trend

---

## Communication Plan

### Stakeholders to Notify

**Before Deployment:**
- Engineering team
- Product manager
- QA team

**After Deployment:**
- Engineering team (status)
- Product manager (metrics)
- Support team (known issues)

### Status Updates

**Deployment Day:**
- Pre-deployment: 30 minutes before
- Post-deployment: Immediately after
- 1-hour update: Performance metrics
- End-of-day: Summary report

**Next 24 Hours:**
- Daily summary email
- Immediate alerts for issues
- Performance trend report

---

## Cleanup Tasks

After successful deployment and 48-hour monitoring period:

### Code Cleanup

- [ ] Delete release branch
- [ ] Archive old performance data
- [ ] Update documentation
- [ ] Close related tickets

### Documentation Updates

- [ ] Update README with new performance metrics
- [ ] Document lessons learned
- [ ] Update architecture docs
- [ ] Create deployment retrospective

### Monitoring Setup

- [ ] Set up automated alerts
- [ ] Configure dashboard bookmarks
- [ ] Schedule weekly performance reviews
- [ ] Archive baseline metrics

---

## Lessons Learned Template

After deployment, document lessons learned:

### What Went Well

-
-
-

### What Could Be Improved

-
-
-

### Action Items for Next Deployment

-
-
-

---

## Emergency Contacts

**On-Call Engineer:** [Name, Phone, Email]
**DevOps Lead:** [Name, Phone, Email]
**Product Manager:** [Name, Phone, Email]

**External Services:**
- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.com

---

## Appendix: Quick Reference Commands

```bash
# Deploy to production
vercel --prod

# Rollback
vercel rollback

# Smoke tests
node scripts/smoke-test-production.js

# Performance monitoring
node scripts/monitor-performance.js

# Load testing
k6 run load-tests/match-properties.js

# View logs
vercel logs --follow

# Run all tests
npm test

# Performance benchmarks
npm run test:perf

# Memory profiling
npm run test:memory
```

---

*Last Updated: December 2024*
*Sprint 1: Performance Optimization*
*Version: 1.0.0*
