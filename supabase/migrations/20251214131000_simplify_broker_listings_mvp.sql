-- Add building_class enum type
CREATE TYPE building_class AS ENUM (
  'class_a',
  'class_b',
  'class_c'
);

-- Add new MVP fields to broker_listings
ALTER TABLE broker_listings
ADD COLUMN building_class building_class,
ADD COLUMN ada_accessible BOOLEAN DEFAULT false,
ADD COLUMN parking_spaces INTEGER CHECK (parking_spaces IS NULL OR parking_spaces >= 0),
ADD COLUMN leed_certified BOOLEAN DEFAULT false,
ADD COLUMN year_built INTEGER CHECK (year_built IS NULL OR (year_built >= 1800 AND year_built <= EXTRACT(YEAR FROM CURRENT_DATE) + 2)),
ADD COLUMN notes TEXT;

-- Make some previously required fields optional for MVP
ALTER TABLE broker_listings
ALTER COLUMN title DROP NOT NULL,
ALTER COLUMN description DROP NOT NULL,
ALTER COLUMN property_type DROP NOT NULL,
ALTER COLUMN asking_rent_sf DROP NOT NULL,
ALTER COLUMN lease_type DROP NOT NULL,
ALTER COLUMN broker_name DROP NOT NULL,
ALTER COLUMN broker_company DROP NOT NULL,
ALTER COLUMN broker_phone DROP NOT NULL,
ALTER COLUMN lister_role DROP NOT NULL;

-- Set defaults for optional fields
ALTER TABLE broker_listings
ALTER COLUMN property_type SET DEFAULT 'office',
ALTER COLUMN lease_type SET DEFAULT 'full_service',
ALTER COLUMN asking_rent_sf SET DEFAULT 0;

-- Add index on building_class for filtering
CREATE INDEX idx_broker_listings_building_class ON broker_listings(building_class) WHERE building_class IS NOT NULL;

-- Add comments
COMMENT ON COLUMN broker_listings.building_class IS 'Building class rating (Class A, B, or C)';
COMMENT ON COLUMN broker_listings.ada_accessible IS 'Whether the property is ADA accessible';
COMMENT ON COLUMN broker_listings.parking_spaces IS 'Number of available parking spaces';
COMMENT ON COLUMN broker_listings.leed_certified IS 'Whether the property is LEED certified';
COMMENT ON COLUMN broker_listings.year_built IS 'Year the property was built';
COMMENT ON COLUMN broker_listings.notes IS 'Additional notes or description about the property';
