# Federal Data Sync Guide

This guide explains how to sync federal building and lease data from IOLP into your Supabase database.

## Overview

The FedSpace algorithms require federal property data to calculate neighborhood scores and match properties to opportunities. This data is synced from the IOLP (Integrated Online Leasing Platform) ArcGIS service.

## Automatic Daily Sync

A Vercel cron job runs **daily at 2 AM UTC** to automatically sync data:

```json
{
  "path": "/api/cron/sync-federal-data",
  "schedule": "0 2 * * *"
}
```

This keeps your database up-to-date with the latest federal property information.

## Manual Sync Command

You can manually trigger a data sync anytime:

```bash
# From your project directory
npm run sync-federal-data
```

This is useful for:
- Initial data population
- Testing the sync process
- Refreshing data on-demand

## What Gets Synced

### Federal Buildings
- **Source**: IOLP Buildings Layer
- **Record Type**: `iolp_building`
- **Pagination**: Fetches up to 50,000 records in batches of 2,000
- **Data Includes**:
  - Location (lat/lng, address, city, state, zip)
  - Space details (RSF, vacant RSF)
  - Property type (owned/leased)
  - Construction year
  - Agency information

### Federal Leases
- **Source**: IOLP Leases Layer
- **Record Type**: `iolp_lease`
- **Pagination**: Fetches up to 50,000 records in batches of 2,000
- **Data Includes**:
  - Location information
  - Lease expiration dates
  - Space details (RSF)
  - Agency information

## How It Works

1. **Fetch from IOLP** - Queries the IOLP ArcGIS service for all buildings and leases
2. **Batch Processing** - Processes records in batches to handle large datasets
3. **Upsert to Database** - Stores in `federal_buildings` table (creates or updates)
4. **Deduplication** - Uses `(source_type, source_id)` as unique key
5. **Timestamp Tracking** - Updates `last_synced_at` on each sync

## Database Table

All data is stored in the `federal_buildings` table:

```sql
CREATE TABLE federal_buildings (
  id UUID PRIMARY KEY,
  source_type TEXT NOT NULL,        -- 'iolp_building' or 'iolp_lease'
  source_id TEXT NOT NULL,          -- Unique ID from IOLP
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(11, 7) NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT NOT NULL,
  zipcode TEXT,
  rsf INTEGER DEFAULT 0,
  vacant BOOLEAN DEFAULT false,
  vacant_rsf INTEGER DEFAULT 0,
  property_type TEXT,               -- 'owned' or 'leased'
  lease_expiration_date TIMESTAMPTZ,
  construction_year INTEGER,
  agency TEXT,
  source_data JSONB,                -- Full IOLP data
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  UNIQUE (source_type, source_id)
);
```

## API Endpoints

### Trigger Manual Sync
```bash
GET /api/cron/sync-federal-data?force=true
```

### Get Expiring Leases
```bash
GET /api/federal/expiring-leases?months=24&state=DC&limit=50
```

**Parameters:**
- `months` - Look ahead window (default: 24)
- `state` - Filter by state code (optional)
- `limit` - Max results (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "leases": [...],
    "summary": {
      "totalLeases": 1234,
      "showing": 50,
      "totalExpiringRSF": 5000000,
      "urgencyBreakdown": {
        "critical": 45,  // < 90 days
        "high": 123,     // 90-180 days
        "medium": 456,   // 180-365 days
        "low": 610       // > 365 days
      }
    }
  }
}
```

## Usage Examples

### Get Leases Expiring in Next 12 Months (DC Only)
```bash
curl "https://your-app.vercel.app/api/federal/expiring-leases?months=12&state=DC"
```

### Get Critical Leases (< 90 days)
```bash
curl "https://your-app.vercel.app/api/federal/expiring-leases?months=3"
```

### Trigger Manual Sync
```bash
curl "https://your-app.vercel.app/api/cron/sync-federal-data?force=true"
```

## Performance

- **Initial Sync**: 2-5 minutes (depending on IOLP service speed)
- **Subsequent Syncs**: Same duration (upserts existing records)
- **Max Execution Time**: 5 minutes (Vercel limit)
- **Rate Limiting**: Built-in batching prevents API overload

## Troubleshooting

### IOLP Service Unavailable (503)
The IOLP ArcGIS service occasionally goes down for maintenance. The sync will:
- Log the error
- Return gracefully
- Retry on next scheduled run

### Timeout Issues
If syncing times out:
- Increase `maxDuration` in the cron route
- Reduce batch size in `fedspace-integration.ts`
- Run sync during off-peak hours

### Missing Data
If federal scores show 0:
1. Check that sync has run: `SELECT COUNT(*) FROM federal_buildings;`
2. Verify IOLP service is up
3. Manually trigger sync: `npm run sync-federal-data`

## Integration with FedSpace Algorithms

Once data is synced:

1. **Federal Neighborhood Score** uses the `federal_buildings` table to:
   - Build R-Tree spatial index
   - Calculate 6-factor scores
   - Identify expiring leases

2. **Property-Opportunity Matching** uses federal data to:
   - Identify competitive locations
   - Calculate proximity scores
   - Recommend properties

## Monitoring

Check sync status in Vercel:
- Dashboard → Cron Jobs → `sync-federal-data`
- View execution logs
- Monitor success/failure rates

## Security

The cron endpoint requires:
- Valid `CRON_SECRET` environment variable (Vercel sets this automatically)
- OR `force=true` parameter for manual triggers

Make sure to set `CRON_SECRET` in your Vercel environment variables for production security.
