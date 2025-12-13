# Market News Integration Guide

## Overview
Your ProposalIQ platform now has a fully functional news aggregation system that pulls real-time content from NewsAPI and GovInfo API.

## Features Implemented

### 1. Live News Feed
- **Government Contracting News**: Federal contracts, procurement, small business opportunities
- **Real Estate News**: Commercial leasing, federal properties, GSA opportunities
- **Policy News**: Regulations, compliance, government announcements
- **Official Documents**: GovInfo.gov collections and publications

### 2. User Interface
- Real-time statistics dashboard
- Search functionality with debouncing
- Category filtering
- Date sorting (most recent/oldest)
- Refresh button for manual updates
- Loading states and error handling
- Responsive grid layout

### 3. API Endpoints

#### `/api/news` (GET)
Fetches aggregated news from multiple sources.

**Query Parameters:**
- `category` (optional): Filter by category (Government Contracting, Real Estate, Policy, GSA Leasing)
- `search` (optional): Search term to filter articles

**Response:**
```json
{
  "success": true,
  "articles": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "source": "string",
      "publishedAt": "ISO date string",
      "url": "string",
      "category": "string",
      "imageUrl": "string (optional)"
    }
  ],
  "stats": {
    "total": 0,
    "governmentContracting": 0,
    "realEstate": 0,
    "thisWeek": 0
  }
}
```

## API Configuration

### Current API Keys

1. **NewsAPI**
   - Key: `ae9fedd45109461eb546b5535f03aa6a`
   - Usage: Fetches news from 150,000+ sources
   - Rate Limit: Check NewsAPI documentation

2. **GovInfo API**
   - Key: `dImMBTFfAijSwAHXPChO608wAYWH8SAlb5UmsZQF`
   - Usage: Official U.S. government documents
   - Free tier: No rate limits mentioned

### Environment Variables (Recommended)
For production, move API keys to environment variables:

```bash
# .env.local
NEWSAPI_KEY=ae9fedd45109461eb546b5535f03aa6a
GOVINFO_API_KEY=dImMBTFfAijSwAHXPChO608wAYWH8SAlb5UmsZQF
```

Then update `/app/api/news/route.ts`:
```typescript
const NEWS_API_KEY = process.env.NEWSAPI_KEY!;
const GOVINFO_API_KEY = process.env.GOVINFO_API_KEY!;
```

## Customization Options

### 1. Add More News Categories

Edit `/app/api/news/route.ts` to add more NewsAPI queries:

```typescript
// Example: Add technology news
fetch(
  `https://newsapi.org/v2/everything?q=AI+OR+automation+OR+cybersecurity&from=${dateFrom}&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`
)
```

### 2. Adjust Date Range

Current: Last 7 days
Change in `/app/api/news/route.ts`:

```typescript
// Change from 7 to desired number of days
new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
```

### 3. Modify Article Limits

Current limits per category:
- Government Contracting: 10 articles
- Real Estate: 8 articles
- Policy: 8 articles
- GovInfo: 5 collections

Adjust with `.slice(0, N)` in the API route.

### 4. Add Category Colors

In `market-news-client.tsx`, add to `getCategoryColor()`:

```typescript
case "YourCategory":
  return "bg-pink-50 text-pink-700 border-pink-300";
```

## Usage Examples

### Access the News Page
```
http://localhost:3000/dashboard/market-news
```

### Programmatic API Call
```typescript
// Fetch all news
const response = await fetch('/api/news');

// Filter by category
const response = await fetch('/api/news?category=Government%20Contracting');

// Search for specific terms
const response = await fetch('/api/news?search=GSA%20leasing');
```

## Advanced Customization

### Add News Sources

NewsAPI supports specific sources. Example:

```typescript
fetch(
  `https://newsapi.org/v2/top-headlines?sources=techcrunch,engadget&apiKey=${NEWS_API_KEY}`
)
```

Available sources: https://newsapi.org/sources

### GovInfo Collections

Current implementation fetches all collections. To get specific collection:

```typescript
// Example: Get Congressional Bills
fetch(
  `https://api.govinfo.gov/collections/BILLS?api_key=${GOVINFO_API_KEY}`
)
```

Available collections:
- BILLS - Congressional Bills
- CREC - Congressional Record
- FR - Federal Register
- CFR - Code of Federal Regulations
- And many more...

See: https://api.govinfo.gov/docs/

## Troubleshooting

### No Articles Displayed
1. Check browser console for API errors
2. Verify API keys are valid
3. Check NewsAPI rate limits
4. Ensure internet connection is active

### Slow Loading
1. Reduce number of parallel API calls
2. Decrease article limits per category
3. Implement caching (see below)

### API Rate Limits

NewsAPI Free Tier Limits:
- 100 requests/day
- 1 request/second

**Recommendation**: Implement caching to reduce API calls.

## Performance Optimization

### Add Server-Side Caching

Create `/lib/cache.ts`:

```typescript
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

export function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}
```

Use in `/app/api/news/route.ts`:

```typescript
import { getCached, setCache } from '@/lib/cache';

export async function GET(request: Request) {
  const cacheKey = 'news-feed';
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  // ... fetch news ...

  const result = { success: true, articles, stats };
  setCache(cacheKey, result);
  return NextResponse.json(result);
}
```

## Future Enhancements

1. **Save Favorites**: Allow users to bookmark articles
2. **Email Digests**: Send daily/weekly summaries
3. **Notifications**: Alert users to breaking news
4. **Advanced Filters**: Date ranges, sources, keywords
5. **Article Analytics**: Track most-read articles
6. **RSS Integration**: Add RSS feed support
7. **AI Summarization**: Use Claude to summarize articles
8. **Personalization**: ML-based recommendations

## File Structure

```
/app
  /api
    /news
      route.ts          # Main API endpoint
  /dashboard
    /market-news
      page.tsx          # Server component wrapper
      /_components
        market-news-client.tsx  # Client-side UI
```

## Support

- NewsAPI Docs: https://newsapi.org/docs
- GovInfo API Docs: https://api.govinfo.gov/docs/
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

## Credits

- **NewsAPI**: Powers news aggregation
- **GovInfo API**: Provides official government documents
- **Design Inspiration**: Based on your reference images (Union and NewsHub designs)

---

**Last Updated**: December 13, 2025
**Version**: 1.0.0
