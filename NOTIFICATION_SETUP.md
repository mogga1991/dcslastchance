# FedSpace Notification System Setup Guide

This guide covers the setup and deployment of the AI-powered notification system for FedSpace.

## Overview

The notification system monitors GSA lease opportunities daily, matches them against user properties, and delivers multi-tier notifications with AI-generated insights.

**Key Features:**
- Daily SAM.gov sync + immediate property matching
- AI-powered match analysis using Claude
- Multi-tier notifications (Perfect, High-Quality, Standard)
- In-app notification center + Browser push notifications
- User-configurable preferences
- Deduplication and anti-spam measures

---

## Prerequisites

Before deployment, ensure you have:

1. **Supabase Project** - Active Supabase project with service role key
2. **Anthropic API Key** - For Claude AI match analysis
3. **VAPID Keys** - For browser push notifications (see generation below)
4. **Vercel Account** - For hosting and cron jobs

---

## Step 1: Generate VAPID Keys

VAPID keys are required for browser push notifications.

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

**Output:**
```
Public Key: BNx7y3z...
Private Key: AbCd1eF2gH...
```

**Save these keys** - you'll need them in Step 3.

---

## Step 2: Run Database Migrations

Apply the notification system database migrations to your Supabase project.

### Option A: Using Supabase CLI (Recommended)

```bash
# Navigate to project directory
cd /Users/georgemogga/Downloads/dcslasttry

# Push migrations to Supabase
npx supabase db push
```

### Option B: Manual SQL Execution

If Supabase CLI is not set up, run these migrations in order via the Supabase Dashboard → SQL Editor:

1. `supabase/migrations/20250105000000_create_notifications.sql`
2. `supabase/migrations/20250105000001_create_notification_preferences.sql`
3. `supabase/migrations/20250105000002_create_push_subscriptions.sql`
4. `supabase/migrations/20250105000003_create_notification_history.sql`

### Verify Migrations

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'notification%';

-- Expected output:
-- notifications
-- notification_preferences
-- notification_history
-- push_subscriptions
```

---

## Step 3: Configure Environment Variables

Add the following environment variables to your Vercel project.

### Required Variables

```bash
# Existing (verify these are already set)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_API_KEY=sk-ant-api03-...
CRON_SECRET=your-secure-random-secret

# NEW: Web Push VAPID Keys (from Step 1)
VAPID_PUBLIC_KEY=BNx7y3z...
VAPID_PRIVATE_KEY=AbCd1eF2gH...
VAPID_SUBJECT=mailto:support@fedspace.com
```

### Add to Vercel

```bash
# Using Vercel CLI
printf "YOUR_VAPID_PUBLIC_KEY" | vercel env add VAPID_PUBLIC_KEY production
printf "YOUR_VAPID_PRIVATE_KEY" | vercel env add VAPID_PRIVATE_KEY production
printf "mailto:support@fedspace.com" | vercel env add VAPID_SUBJECT production

# Or via Vercel Dashboard:
# 1. Go to Project → Settings → Environment Variables
# 2. Add each variable for Production, Preview, and Development
```

**IMPORTANT:** Use `printf` instead of `echo` to avoid newline characters (see CLAUDE.md for details).

---

## Step 4: Install Dependencies

The notification system requires the `web-push` npm package.

```bash
# Install web-push for push notifications
npm install web-push

# Install if missing (should already be installed)
npm install @anthropic-ai/sdk date-fns
```

Update `package.json` if needed:
```json
{
  "dependencies": {
    "web-push": "^3.6.7",
    "@anthropic-ai/sdk": "^0.9.1",
    "date-fns": "^3.0.0"
  }
}
```

---

## Step 5: Deploy to Vercel

Deploy the updated codebase with the new notification system.

```bash
# Commit changes
git add .
git commit -m "feat: Add AI-powered notification system"

# Push to GitHub
git push origin main

# Deploy to production
vercel --prod
```

### Verify Deployment

After deployment:

1. **Check Cron Jobs**
   - Go to Vercel Dashboard → Project → Settings → Cron Jobs
   - Verify `/api/cron/sync-match-notify` is listed with schedule `0 13 * * *`

2. **Check Environment Variables**
   - Verify all VAPID keys are set for Production

3. **Test API Endpoints**
   ```bash
   # Test notifications endpoint (should return 401 if not logged in)
   curl https://your-domain.vercel.app/api/notifications

   # Test preferences endpoint
   curl https://your-domain.vercel.app/api/notifications/preferences
   ```

---

## Step 6: Test the System

### Test 1: Database Setup

```sql
-- Connect to Supabase and check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename LIKE 'notification%';

-- Should return policies for notifications, notification_preferences, push_subscriptions
```

### Test 2: Manual Cron Trigger

Trigger the cron job manually to test the full workflow:

```bash
# Get your CRON_SECRET from Vercel env vars
CRON_SECRET="your-cron-secret"

# Trigger the workflow
curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.vercel.app/api/cron/sync-match-notify
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Daily sync + match + notify workflow complete",
  "stats": {
    "syncStats": {"total": 1234, "inserted": 45, "updated": 12, "errors": 0},
    "matchStats": {"matched": 456, "properties": 89, "opportunities": 1234},
    "notifications": {
      "perfect": 12,
      "highQuality": 34,
      "standard": 89,
      "queued": 135
    },
    "pushNotifications": {"processed": 135, "sent": 128, "failed": 7},
    "aiInsights": 46,
    "durationMs": 362000
  }
}
```

### Test 3: Frontend Components

1. **Notification Bell**
   - Log in to your dashboard
   - Check for notification bell icon in header (should show unread count if notifications exist)

2. **Notification Center**
   - Click the bell icon
   - Should see dropdown with tabs: "Unread" and "All"
   - Notifications should display with icons, grades, and AI insights

3. **Notification Preferences**
   - Navigate to Settings → Notifications
   - Toggle preferences for different match tiers
   - Click "Save Preferences"
   - Verify settings persist after page reload

---

## Step 7: Enable Browser Push Notifications (Optional)

To enable browser push notifications for users:

### Create Service Worker

Create `/public/service-worker.js`:

```javascript
self.addEventListener('push', function(event) {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-96x96.png',
    data: data.data,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
```

### Register Service Worker

Add to `/app/layout.tsx`:

```typescript
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

---

## Monitoring & Maintenance

### Daily Cron Job Schedule

The unified `sync-match-notify` cron job runs:
- **Schedule**: Daily at 1 PM UTC (6 AM MST)
- **Duration**: ~6 minutes
- **Steps**:
  1. Sync SAM.gov opportunities (2-3 min)
  2. Match properties (2-3 min)
  3. Generate AI insights (30-60 sec)
  4. Queue notifications (5 sec)
  5. Process push notifications (10 sec)

### Check Cron Logs

```bash
# View recent cron job logs
vercel logs --follow

# Filter for cron job
vercel logs | grep "sync-match-notify"
```

### Monitor Notification Delivery

```sql
-- Check notification delivery stats (last 24 hours)
SELECT
  type,
  COUNT(*) as total,
  SUM(CASE WHEN sent_push THEN 1 ELSE 0 END) as sent_push,
  SUM(CASE WHEN read THEN 1 ELSE 0 END) as read
FROM notifications
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY type;

-- Check push subscription health
SELECT
  active,
  COUNT(*) as total,
  AVG(error_count) as avg_errors
FROM push_subscriptions
GROUP BY active;
```

### Cleanup Old Notifications

The system automatically:
- Expires notifications after 30 days
- Deletes expired notifications that are read AND dismissed
- Cleans deduplication history after 24 hours

Run manual cleanup if needed:
```sql
-- Cleanup function
SELECT cleanup_expired_notifications();
SELECT cleanup_notification_history();
```

---

## Cost Estimates

### Claude API Usage

- **Model**: `claude-3-5-sonnet-20241022`
- **Cost**: $3.00 / 1M input + $15.00 / 1M output tokens
- **Per Match**: ~500 input + 300 output tokens = $0.0069
- **Daily**: 20 matches/day = $0.14/day
- **Monthly**: **~$4.20/month**

### Total Infrastructure

- Claude API: $4.20/month
- Supabase: Free tier (< 500 properties)
- Vercel: Included in Pro plan ($20/month)
- **Total**: **~$25/month** (Vercel Pro + Claude)

---

## Troubleshooting

### Issue: Notifications not appearing

**Check:**
1. User has notification preferences enabled
2. RLS policies allow user to read notifications
3. Cron job is running successfully (check logs)

**Fix:**
```sql
-- Check user preferences
SELECT * FROM notification_preferences WHERE user_id = 'USER_ID';

-- Check notifications
SELECT * FROM notifications WHERE user_id = 'USER_ID' ORDER BY created_at DESC LIMIT 10;
```

### Issue: Push notifications failing

**Check:**
1. VAPID keys are correctly set in environment
2. Push subscriptions are active
3. Browser has granted notification permission

**Fix:**
```sql
-- Check push subscriptions
SELECT * FROM push_subscriptions WHERE user_id = 'USER_ID';

-- Check for errors
SELECT endpoint, error_count, last_error, active
FROM push_subscriptions
WHERE error_count > 0;
```

### Issue: AI insights not generating

**Check:**
1. `ANTHROPIC_API_KEY` is set
2. API key has sufficient credits
3. Check cron job logs for AI errors

**Fix:**
```bash
# Test AI service directly
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":100,"messages":[{"role":"user","content":"test"}]}'
```

### Issue: Duplicate notifications

**Check:**
1. Deduplication is working (24-hour window)
2. No duplicate cron jobs running

**Fix:**
```sql
-- Check deduplication history
SELECT * FROM notification_history WHERE user_id = 'USER_ID' ORDER BY sent_at DESC LIMIT 20;

-- Check for duplicate notifications
SELECT title, COUNT(*)
FROM notifications
WHERE user_id = 'USER_ID'
GROUP BY title
HAVING COUNT(*) > 1;
```

---

## Support

For issues or questions:
- **Documentation**: See [CLAUDE.md](./CLAUDE.md) for project context
- **GitHub Issues**: Report bugs at https://github.com/mogga1991/dcslastchance/issues
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard

---

**Last Updated**: January 5, 2025
