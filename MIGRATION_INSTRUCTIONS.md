# Manual Migration Instructions

## ⚠️ ACTION REQUIRED: Run Migrations in Supabase Dashboard

The Supabase migrations need to be applied manually because the CLI can't sync with the remote database.

---

## Step 1: Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: **clxqdctofuxqjjonvytm**
3. Navigate to **SQL Editor** in the left sidebar

---

## Step 2: Run saved_opportunities Migration

Copy and paste this SQL into the SQL Editor and click **Run**:

```sql
-- Create saved_opportunities table for users to track solicitations
CREATE TABLE IF NOT EXISTS saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notice_id TEXT NOT NULL,
  opportunity_data JSONB NOT NULL,
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'reviewing', 'pursuing', 'submitted', 'won', 'lost', 'no_bid')),
  notes TEXT,
  bid_decision TEXT CHECK (bid_decision IN ('pending', 'bid', 'no_bid')),
  bid_decision_reasoning TEXT,
  qualification_status TEXT CHECK (qualification_status IN ('pending', 'qualified', 'not_qualified', 'partial')),
  qualification_notes TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, notice_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_user ON saved_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_status ON saved_opportunities(user_id, status);
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_notice ON saved_opportunities(notice_id);

-- Enable RLS
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop if exist, then create)
DROP POLICY IF EXISTS "Users can view own saved opportunities" ON saved_opportunities;
CREATE POLICY "Users can view own saved opportunities"
  ON saved_opportunities FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved opportunities" ON saved_opportunities;
CREATE POLICY "Users can insert own saved opportunities"
  ON saved_opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own saved opportunities" ON saved_opportunities;
CREATE POLICY "Users can update own saved opportunities"
  ON saved_opportunities FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved opportunities" ON saved_opportunities;
CREATE POLICY "Users can delete own saved opportunities"
  ON saved_opportunities FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger function
CREATE OR REPLACE FUNCTION update_saved_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS update_saved_opportunities_updated_at ON saved_opportunities;
CREATE TRIGGER update_saved_opportunities_updated_at
  BEFORE UPDATE ON saved_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_opportunities_updated_at();
```

**Expected Result**: You should see "Success. No rows returned" message.

---

## Step 3: Verify Table Creation

Run this query to verify:

```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'saved_opportunities'
ORDER BY ordinal_position;
```

**Expected Result**: Should show all columns (id, user_id, notice_id, opportunity_data, status, notes, etc.)

---

## Step 4: Test RLS Policies

Run this query:

```sql
SELECT * FROM saved_opportunities LIMIT 1;
```

**Expected Result**: Should return 0 rows (table is empty) or show only your opportunities (if you've saved any).

---

##  Step 5: Mark Task Complete

Once the migration is successful, you can proceed with the rest of Sprint 1.

---

## Troubleshooting

### Error: "relation already exists"
This means the table is already created. You can skip this migration.

### Error: "permission denied"
Make sure you're running this in the Supabase SQL Editor, which has admin privileges.

### Error: "column already exists"
The migration might have been partially applied. Check what exists and run only the missing parts.

---

## Next Migration: company_profiles

After this migration succeeds, we'll create the company_profiles table next.

File location: `supabase/migrations/20251214140000_create_company_profiles.sql` (to be created)

---

**Status**: ⏳ Waiting for manual execution
**Once complete**: Update Sprint tracker and move to next task
