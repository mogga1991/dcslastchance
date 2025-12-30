-- Combined migration to add missing columns to broker_listings table
-- This combines migrations 20251214120000 and 20251214131000

-- ====================
-- PART 1: Add lister_role, license_number, brokerage_company
-- From: 20251214120000_add_lister_role_to_broker_listings.sql
-- ====================

-- Add lister_role enum type (if not exists)
DO $$ BEGIN
  CREATE TYPE lister_role AS ENUM (
    'owner',
    'broker',
    'agent',
    'salesperson'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add columns if they don't exist
DO $$
BEGIN
  -- Add lister_role column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'broker_listings' AND column_name = 'lister_role'
  ) THEN
    ALTER TABLE broker_listings ADD COLUMN lister_role lister_role;
  END IF;

  -- Add license_number column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'broker_listings' AND column_name = 'license_number'
  ) THEN
    ALTER TABLE broker_listings ADD COLUMN license_number TEXT;
  END IF;

  -- Add brokerage_company column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'broker_listings' AND column_name = 'brokerage_company'
  ) THEN
    ALTER TABLE broker_listings ADD COLUMN brokerage_company TEXT;
  END IF;
END $$;

-- Update existing records to have a default lister_role (set to 'broker')
UPDATE broker_listings
SET lister_role = 'broker'
WHERE lister_role IS NULL;

-- ====================
-- PART 2: Add MVP fields and make optional fields
-- From: 20251214131000_simplify_broker_listings_mvp.sql
-- ====================

-- Add building_class enum type (if not exists)
DO $$ BEGIN
  CREATE TYPE building_class AS ENUM (
    'class_a',
    'class_b',
    'class_c'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new MVP columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'broker_listings' AND column_name = 'building_class'
  ) THEN
    ALTER TABLE broker_listings ADD COLUMN building_class building_class;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'broker_listings' AND column_name = 'ada_accessible'
  ) THEN
    ALTER TABLE broker_listings ADD COLUMN ada_accessible BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'broker_listings' AND column_name = 'parking_spaces'
  ) THEN
    ALTER TABLE broker_listings ADD COLUMN parking_spaces INTEGER CHECK (parking_spaces IS NULL OR parking_spaces >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'broker_listings' AND column_name = 'leed_certified'
  ) THEN
    ALTER TABLE broker_listings ADD COLUMN leed_certified BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'broker_listings' AND column_name = 'year_built'
  ) THEN
    ALTER TABLE broker_listings ADD COLUMN year_built INTEGER CHECK (year_built IS NULL OR (year_built >= 1800 AND year_built <= EXTRACT(YEAR FROM CURRENT_DATE) + 2));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'broker_listings' AND column_name = 'notes'
  ) THEN
    ALTER TABLE broker_listings ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Make previously required fields optional for MVP
ALTER TABLE broker_listings
ALTER COLUMN title DROP NOT NULL,
ALTER COLUMN description DROP NOT NULL,
ALTER COLUMN property_type DROP NOT NULL,
ALTER COLUMN asking_rent_sf DROP NOT NULL,
ALTER COLUMN lease_type DROP NOT NULL,
ALTER COLUMN broker_name DROP NOT NULL,
ALTER COLUMN broker_company DROP NOT NULL,
ALTER COLUMN broker_phone DROP NOT NULL,
ALTER COLUMN latitude DROP NOT NULL,
ALTER COLUMN longitude DROP NOT NULL;

-- Set defaults for optional fields
ALTER TABLE broker_listings
ALTER COLUMN property_type SET DEFAULT 'office',
ALTER COLUMN lease_type SET DEFAULT 'full_service',
ALTER COLUMN asking_rent_sf SET DEFAULT 0;

-- Create indexes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_broker_listings_lister_role'
  ) THEN
    CREATE INDEX idx_broker_listings_lister_role ON broker_listings(lister_role);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_broker_listings_building_class'
  ) THEN
    CREATE INDEX idx_broker_listings_building_class ON broker_listings(building_class) WHERE building_class IS NOT NULL;
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN broker_listings.lister_role IS 'Role of the person listing the property (owner, broker, agent, salesperson)';
COMMENT ON COLUMN broker_listings.license_number IS 'Real estate license number (required for broker/agent, optional for salesperson)';
COMMENT ON COLUMN broker_listings.brokerage_company IS 'Name of the brokerage company (required for broker/agent/salesperson)';
COMMENT ON COLUMN broker_listings.building_class IS 'Building class rating (Class A, B, or C)';
COMMENT ON COLUMN broker_listings.ada_accessible IS 'Whether the property is ADA accessible';
COMMENT ON COLUMN broker_listings.parking_spaces IS 'Number of available parking spaces';
COMMENT ON COLUMN broker_listings.leed_certified IS 'Whether the property is LEED certified';
COMMENT ON COLUMN broker_listings.year_built IS 'Year the property was built';
COMMENT ON COLUMN broker_listings.notes IS 'Additional notes or description about the property';
