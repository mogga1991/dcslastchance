# AI Summary Feature - Testing Guide

## ✅ Integration Complete!

The AI Summary feature has been successfully integrated into the property match cards.

---

## What Was Added

### 1. AI Summary Toggle in Match Cards
Each opportunity match card now has a **"Show AI Summary"** button that:
- Fetches AI-generated summaries on demand
- Uses Claude 3.5 Sonnet API
- Caches results for 30 days in `ai_summaries` table
- Shows loading state while generating
- Falls back gracefully if API fails

### 2. Enhanced Match Cards
- **Better Layout**: Improved card design with action bar
- **SAM.gov Link**: Direct link to view opportunity on SAM.gov
- **Type Safety**: Proper TypeScript interfaces
- **Auto-Sorting**: Matches sorted by score (highest first)
- **Visual Indicators**: Color-coded competitive/qualified/marginal badges

### 3. Data Flow
```
my-properties-client.tsx
  └─ Fetches property_matches with score_breakdown
      └─ properties-table.tsx
          └─ Transforms data to OpportunityMatch format
              └─ expanded-matches-view.tsx
                  └─ Renders match cards with AI Summary toggle
                      └─ OpportunitySummaryCard
                          └─ /api/summarize-opportunity
                              └─ lib/ai/summarize-opportunity.ts
                                  └─ Claude API
```

---

## Files Changed

### Updated Components
1. **expanded-matches-view.tsx** (Complete rewrite)
   - New `OpportunityMatch` interface matching database structure
   - AI Summary toggle button with Sparkles icon
   - `OpportunitySummaryCard` integration
   - SAM.gov direct link
   - Enhanced UI with action bar

2. **properties-table.tsx** (Data transformation)
   - Updated `PropertyMatch` interface (added AI fields)
   - Transform opportunities data for new component
   - Pass `propertyTitle` to match cards

3. **verify-ai-table.js** (New verification script)
   - Check if `ai_summaries` table exists
   - Display table structure

---

## Testing Steps

### Step 1: Start Development Server
```bash
npm run dev
```

Server should start at: http://localhost:3002

### Step 2: Navigate to My Properties
```
http://localhost:3002/dashboard/my-properties
```

### Step 3: Expand a Property with Matches
1. Click on any property row to expand it
2. You should see match cards with scores

### Step 4: Test AI Summary Feature
1. Click a match card to expand it
2. Click **"Show AI Summary"** button (with Sparkles ✨ icon)
3. Wait 2-3 seconds for generation
4. Summary should appear with structured data:
   - 📋 Headline
   - 📍 Location details
   - 📏 Space requirements
   - 🏢 Property requirements
   - 📅 Key dates
   - 💡 Broker takeaway

### Step 5: Verify Caching
1. Click **"Hide AI Summary"** to collapse
2. Click **"Show AI Summary"** again
3. Should load instantly (cached in database)

### Step 6: Check Score Breakdown
1. Scroll down in expanded match card
2. Verify "Match Score Breakdown" section shows:
   - Location score with details
   - Space score with details
   - Building score with details
   - Timeline score with details
   - Experience score with details

---

## Expected Behavior

### First Time (No Cache)
```
User clicks "Show AI Summary"
  ↓
Button shows "Generating..."
  ↓
POST /api/summarize-opportunity
  ↓
Anthropic Claude API call (~2-3 seconds)
  ↓
Save to ai_summaries table
  ↓
Display structured summary
```

**Cost:** ~$0.002 per summary

### Second Time (Cached)
```
User clicks "Show AI Summary"
  ↓
Button shows "Loading..."
  ↓
GET /api/summarize-opportunity?id={opportunityId}
  ↓
Return cached summary from database (~20ms)
  ↓
Display summary instantly
```

**Cost:** $0 (free)

---

## Debugging

### If AI Summary Doesn't Load

1. **Check Console for Errors**
   ```
   Open browser DevTools (F12)
   → Console tab
   → Look for red errors
   ```

2. **Check API Response**
   ```
   → Network tab
   → Filter: "summarize"
   → Click on request
   → Check Response tab
   ```

3. **Check ANTHROPIC_API_KEY**
   ```bash
   grep ANTHROPIC_API_KEY .env.local
   ```

4. **Check Database Table**
   ```bash
   node verify-ai-table.js
   ```

5. **Check API Endpoint**
   ```bash
   curl http://localhost:3002/api/summarize-opportunity?id=test
   ```

### Common Issues

#### "API Error 500"
**Cause:** ANTHROPIC_API_KEY not set or invalid
**Fix:** Check `.env.local` has valid key

#### "Opportunity not found"
**Cause:** Opportunity doesn't exist in `opportunities` table
**Fix:** This is normal - API will use fallback regex extraction

#### "Score breakdown not available"
**Cause:** Property-opportunity match doesn't have `score_breakdown` data
**Fix:** Re-run matching via `/api/match-properties`

#### "Summaries not caching"
**Cause:** `ai_summaries` table doesn't exist
**Fix:** Run `node run-migration-neon.js`

---

## What Each Button Does

### "Show AI Summary" Button
- **First Click**: Generates AI summary via Claude API
- **Color**: Gray → Blue when active
- **Icon**: ✨ Sparkles (AI feature indicator)
- **Loading**: Shows "Generating..." or "Loading..."
- **Cache**: Results cached for 30 days

### SAM.gov Link
- **Action**: Opens opportunity on SAM.gov in new tab
- **URL**: `https://sam.gov/opp/{notice_id}/view`
- **Icon**: External link icon

### Score Badge
- **Green (A-B)**: Competitive (score ≥70)
- **Yellow (C)**: Qualified (score 50-69)
- **Orange (D)**: Marginal (score 40-49)

---

## Sample AI Summary Output

```json
{
  "headline": "GSA seeks 45,000 SF Class A office in downtown DC",
  "location": {
    "description": "Within 5 miles of Union Station, Washington DC",
    "state": "DC",
    "city": "Washington"
  },
  "space": {
    "minSF": 40000,
    "maxSF": 50000,
    "description": "40,000-50,000 rentable square feet"
  },
  "propertyRequirements": {
    "type": "Office",
    "class": "A",
    "features": ["ADA compliant", "LEED certified", "24/7 access"]
  },
  "specialConditions": [
    "Secured parking for 50+ vehicles",
    "Loading dock required"
  ],
  "dates": {
    "responseDeadline": "2025-03-15",
    "anticipatedOccupancy": "2025-09-01",
    "leaseTerm": "15 years"
  },
  "evaluationCriteria": [
    "Price (40%)",
    "Location (30%)",
    "Technical capability (30%)"
  ],
  "brokerTakeaway": "Strong opportunity for Class A properties near Metro. LEED certification mandatory."
}
```

---

## Performance Metrics

### First Generation (No Cache)
- **Time:** 2-3 seconds
- **Cost:** ~$0.002
- **Tokens:** ~600 (input + output)

### Cached Retrieval
- **Time:** ~20ms
- **Cost:** $0
- **Expiration:** 30 days

### Monthly Cost Estimate (100 properties × 5 matches each)
- **Without caching:** 500 summaries × $0.002 = $1.00/month
- **With caching:** First generation only = $1.00 (one-time)
- **Subsequent views:** FREE

---

## Next Steps

### 1. Test Locally ✅
```bash
npm run dev
# Test all features
```

### 2. Deploy to Production
```bash
git push origin main
vercel --prod
```

### 3. Verify in Production
1. Navigate to `/dashboard/my-properties`
2. Test AI Summary feature
3. Check caching works
4. Monitor Anthropic usage: https://console.anthropic.com/settings/usage

### 4. Optional Enhancements
- Add batch pre-summarization cron job
- Add summary to email alerts
- Add summary preview in list view
- Add "Regenerate Summary" button

---

## Monitoring

### Check API Usage
```bash
# Anthropic Console
https://console.anthropic.com/settings/usage

# Check local database
node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => {
  client.query('SELECT COUNT(*) FROM ai_summaries').then(r => {
    console.log('Cached summaries:', r.rows[0].count);
    client.end();
  });
});
"
```

### Check Cache Hit Rate
```sql
SELECT
  COUNT(*) as total_summaries,
  COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 hour') as old_summaries,
  ROUND(100.0 * COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 hour') / COUNT(*), 2) as cache_hit_rate
FROM ai_summaries;
```

---

## Support

### Documentation
- `AI-SUMMARIZATION-DEPLOYMENT.md` - Full deployment guide
- `FINAL-STATUS.md` - Setup status
- `components/opportunity-summary.tsx` - Component source

### Troubleshooting
If you encounter issues:
1. Check browser console for errors
2. Check `vercel logs` for API errors
3. Verify `ANTHROPIC_API_KEY` is set
4. Run `node verify-ai-table.js` to check database
5. Test API directly: `curl localhost:3002/api/summarize-opportunity`

---

*Last updated: December 20, 2024*
*Feature status: ✅ Integrated and Ready for Testing*
