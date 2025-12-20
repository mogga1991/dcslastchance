# AI Opportunity Summarization - Deployment Guide

## ✅ Completed

- [x] Copied all files to correct locations
- [x] Installed `@anthropic-ai/sdk` package
- [x] Committed files to git

---

## 🚀 Next Steps for Production

### 1. Run Database Migration

The migration creates the `ai_summaries` table to cache AI-generated summaries.

**Option A: Supabase CLI** (Recommended)
```bash
# From project root
supabase db push
```

**Option B: Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to SQL Editor
4. Copy contents of `supabase/migrations/20251220_create_ai_summaries.sql`
5. Execute the SQL

**Option C: Manual via psql**
```bash
psql "postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres" \
  -f supabase/migrations/20251220_create_ai_summaries.sql
```

---

### 2. Set ANTHROPIC_API_KEY in Vercel

⚠️ **CRITICAL:** Use `printf` not `echo` to avoid the newline issue you documented in CLAUDE.md

```bash
# Get your Anthropic API key from: https://console.anthropic.com/settings/keys

# Add to Vercel production (replace with your actual key)
printf "sk-ant-api03-xxxxx" | vercel env add ANTHROPIC_API_KEY production

# Also add to preview and development for testing
printf "sk-ant-api03-xxxxx" | vercel env add ANTHROPIC_API_KEY preview
printf "sk-ant-api03-xxxxx" | vercel env add ANTHROPIC_API_KEY development
```

**Verify it's set correctly:**
```bash
vercel env ls | grep ANTHROPIC_API_KEY
```

**For local development:**
```bash
# Add to .env.local (gitignored)
echo "ANTHROPIC_API_KEY=sk-ant-api03-xxxxx" >> .env.local
```

---

### 3. Deploy to Production

```bash
git push origin main
vercel --prod
```

---

### 4. Verify Deployment

#### Test the API endpoint:

**Check if migration ran:**
```bash
# This should return 404 or empty array, not a database error
curl "https://dcslasttry.vercel.app/api/summarize-opportunity?id=test-123"
```

**Test summarization with a real opportunity:**
```bash
# Replace with an actual opportunity ID from your database
curl -X POST "https://dcslasttry.vercel.app/api/summarize-opportunity" \
  -H "Content-Type: application/json" \
  -d '{"opportunityId": "YOUR_OPPORTUNITY_ID"}'
```

Expected response:
```json
{
  "summary": {
    "headline": "GSA seeks...",
    "location": { ... },
    "space": { ... }
  },
  "cached": false,
  "model": "claude-3-5-sonnet-20241022",
  "tokensUsed": 847,
  "generationTimeMs": 2341
}
```

---

## 📋 Optional: Integrate UI Components

### Option 1: Add to Expanded Matches View

In `app/dashboard/my-properties/_components/expanded-matches-view.tsx`:

```tsx
import { OpportunitySummaryCard } from '@/components/opportunity-summary';

// Inside MatchCard component, add before or after score breakdown:
{expanded && (
  <div className="border-t border-gray-200 p-4 bg-white">
    <OpportunitySummaryCard
      opportunityId={opp.id}
      opportunityTitle={opp.title}
      compact={true}
    />
  </div>
)}
```

### Option 2: Add Summary Button to Opportunity Cards

```tsx
import { SummaryButton } from '@/components/opportunity-summary';

// Add next to other action buttons:
<SummaryButton
  opportunityId={opp.id}
  variant="ghost"
  size="sm"
/>
```

### Option 3: Add to GSA Leasing Map View

In `app/dashboard/gsa-leasing/_components/gsa-leasing-client.tsx` or opportunity detail modals:

```tsx
<OpportunitySummaryCard
  opportunityId={selectedOpportunity.id}
  opportunityTitle={selectedOpportunity.title}
/>
```

---

## 💰 Cost Monitoring

### Expected Costs (Claude 3.5 Sonnet Pricing)

| Volume | Cost (est.) | Notes |
|--------|-------------|-------|
| 100 summaries/month | ~$0.50 | With 30-day caching |
| 1,000 summaries/month | ~$5.00 | Cached summaries = $0 |
| 10,000 summaries/month | ~$50.00 | New opportunities only |

**Per summary:** ~500 input tokens + ~350 output tokens = ~$0.005

**Caching benefit:** Summaries reused for 30 days = **90%+ cost reduction** for active opportunities

### Monitor Usage

Check Anthropic Console: https://console.anthropic.com/settings/usage

---

## 🔍 Fallback Behavior

If `ANTHROPIC_API_KEY` is **not set** or API fails:

✅ System continues working with regex-based extraction
- Extracts: SF range, building class, location from description
- Returns simplified summary
- Marked as `model: "fallback-regex"` or `model: "fallback-error"`

**No crash or broken UX** if API key missing.

---

## 🧪 Testing Checklist

After deployment:

- [ ] Migration ran successfully (check Supabase dashboard)
- [ ] ANTHROPIC_API_KEY set in Vercel (check `vercel env ls`)
- [ ] GET endpoint returns data (or 404 for non-existent opportunity)
- [ ] POST endpoint generates summaries
- [ ] Summaries are cached (second request returns `cached: true`)
- [ ] Fallback works (temporarily remove API key, should use regex)
- [ ] UI component displays summaries correctly

---

## 🚀 Future Enhancements (Optional)

1. **Batch Pre-Summarization Cron Job**
   - Add to `vercel.json`: Daily job to pre-generate summaries for new opportunities
   - Reduces latency when users first view opportunities

2. **Enhanced Matching**
   - Use extracted requirements from summaries for improved property matching
   - More accurate scoring based on AI-parsed requirements

3. **Email Alerts with Summaries**
   - Include AI summaries in opportunity notification emails
   - Brokers get instant context without logging in

---

## 📚 Related Files

- `AI-SUMMARIZATION-INTEGRATION.md` - Full integration guide from user
- `CRON-SETUP.md` - Property matching cron job setup
- `CLAUDE.md` - Project context and SAM.gov API key deployment lessons

---

*Last updated: December 20, 2024*
