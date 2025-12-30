# Fix Database Schema for Property Listings

## Problem
The property listing form fails with "Failed to create broker listing" because the database is missing required columns (`building_class`, `lister_role`, etc.).

## Root Cause
Two database migrations were not applied:
1. `20251214120000_add_lister_role_to_broker_listings.sql`
2. `20251214131000_simplify_broker_listings_mvp.sql`

## Solution

### Option 1: Apply via Supabase Dashboard SQL Editor (RECOMMENDED)

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/xgeigainkrobwgwapego/sql
   - Or: Supabase Dashboard → Your Project → SQL Editor

2. **Copy the migration SQL:**
   - Open file: `supabase/migrations/apply_missing_columns.sql`
   - Copy ALL the contents

3. **Paste and Run:**
   - Paste the SQL into the SQL Editor
   - Click "Run" button
   - Wait for success message

4. **Verify:**
   - The migration should add these columns:
     - `building_class` (class_a, class_b, class_c)
     - `lister_role` (owner, broker, agent, salesperson)
     - `license_number`
     - `brokerage_company`
     - `ada_accessible`
     - `parking_spaces`
     - `leed_certified`
     - `year_built`
     - `notes`

### Option 2: Apply via Command Line (if you have access)

```bash
# Make sure you're logged into Supabase
export SUPABASE_ACCESS_TOKEN=your_access_token_here
supabase link --project-ref xgeigainkrobwgwapego
supabase db push
```

### Option 3: Apply via psql (Direct Connection)

If you have the database password:

```bash
psql "postgresql://postgres.xgeigainkrobwgwapego:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" < supabase/migrations/apply_missing_columns.sql
```

## After Applying the Migration

1. **Test the property listing form:**
   - Go to: Dashboard → List Property
   - Fill out all steps
   - Click "Submit Listing"
   - Should succeed without errors

2. **Verify listings appear in:**
   - "Available Properties" page (public listings)
   - "My Listings" page (your properties)

## Troubleshooting

If you still get errors after applying the migration:

1. Check that all columns were added:
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'broker_listings'
   ORDER BY column_name;
   ```

2. Verify enum types were created:
   ```sql
   SELECT t.typname, e.enumlabel
   FROM pg_type t
   JOIN pg_enum e ON t.oid = e.enumtypid
   WHERE t.typname IN ('building_class', 'lister_role')
   ORDER BY t.typname, e.enumsortorder;
   ```

3. Check for any other error messages in the browser console or server logs

## Need Help?

If you encounter issues:
1. Check the Supabase Dashboard logs
2. Look for errors in the browser console (F12 → Console)
3. Check the Next.js server logs
