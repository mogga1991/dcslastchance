-- Create enum types for broker listings
CREATE TYPE listing_status AS ENUM (
  'draft',
  'pending_review',
  'active',
  'matched',
  'under_contract',
  'leased',
  'withdrawn',
  'expired'
);

CREATE TYPE property_type AS ENUM (
  'office',
  'warehouse',
  'retail',
  'industrial',
  'medical',
  'mixed_use',
  'land',
  'other'
);

CREATE TYPE lease_type AS ENUM (
  'full_service',
  'modified_gross',
  'triple_net',
  'ground_lease'
);

-- Create broker_listings table
CREATE TABLE broker_listings (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Broker Information
  broker_name TEXT NOT NULL,
  broker_company TEXT NOT NULL,
  broker_email TEXT NOT NULL,
  broker_phone TEXT NOT NULL,

  -- Listing Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  property_type property_type NOT NULL,
  status listing_status NOT NULL DEFAULT 'draft',

  -- Location
  street_address TEXT NOT NULL,
  suite_unit TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zipcode TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,

  -- Space Details
  total_sf INTEGER NOT NULL CHECK (total_sf > 0),
  available_sf INTEGER NOT NULL CHECK (available_sf > 0 AND available_sf <= total_sf),
  min_divisible_sf INTEGER CHECK (min_divisible_sf IS NULL OR min_divisible_sf <= available_sf),

  -- Pricing
  asking_rent_sf DECIMAL(10, 2) NOT NULL CHECK (asking_rent_sf >= 0),
  lease_type lease_type NOT NULL,

  -- Availability
  available_date DATE NOT NULL,

  -- Property Features (arrays of text)
  features TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',

  -- Federal Suitability
  gsa_eligible BOOLEAN DEFAULT false,
  set_aside_eligible TEXT[] DEFAULT '{}',

  -- Federal Score (calculated from IOLP data)
  federal_score INTEGER CHECK (federal_score IS NULL OR (federal_score >= 0 AND federal_score <= 100)),
  federal_score_data JSONB,

  -- Media
  images TEXT[] DEFAULT '{}',

  -- Metrics
  views_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_broker_listings_user_id ON broker_listings(user_id);
CREATE INDEX idx_broker_listings_status ON broker_listings(status);
CREATE INDEX idx_broker_listings_state ON broker_listings(state);
CREATE INDEX idx_broker_listings_city ON broker_listings(city);
CREATE INDEX idx_broker_listings_property_type ON broker_listings(property_type);
CREATE INDEX idx_broker_listings_available_sf ON broker_listings(available_sf);
CREATE INDEX idx_broker_listings_federal_score ON broker_listings(federal_score) WHERE federal_score IS NOT NULL;
CREATE INDEX idx_broker_listings_location ON broker_listings(latitude, longitude);
CREATE INDEX idx_broker_listings_created_at ON broker_listings(created_at DESC);
CREATE INDEX idx_broker_listings_published_at ON broker_listings(published_at DESC) WHERE published_at IS NOT NULL;

-- Create GiST index for location-based queries (optional, for future spatial queries)
-- CREATE INDEX idx_broker_listings_location_gist ON broker_listings USING GIST (ll_to_earth(latitude, longitude));

-- Row Level Security (RLS) Policies
ALTER TABLE broker_listings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active listings
CREATE POLICY "Anyone can view active listings"
  ON broker_listings
  FOR SELECT
  USING (status = 'active');

-- Policy: Users can view their own listings regardless of status
CREATE POLICY "Users can view their own listings"
  ON broker_listings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own listings
CREATE POLICY "Users can create listings"
  ON broker_listings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own listings
CREATE POLICY "Users can update their own listings"
  ON broker_listings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own listings
CREATE POLICY "Users can delete their own listings"
  ON broker_listings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_broker_listing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER broker_listings_updated_at
  BEFORE UPDATE ON broker_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_broker_listing_updated_at();

-- Function to set published_at when status changes to active
CREATE OR REPLACE FUNCTION set_broker_listing_published_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Set published_at when status changes to active for the first time
  IF NEW.status = 'active' AND OLD.status != 'active' AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set published_at
CREATE TRIGGER broker_listings_published_at
  BEFORE UPDATE ON broker_listings
  FOR EACH ROW
  EXECUTE FUNCTION set_broker_listing_published_at();

-- Add comment to table
COMMENT ON TABLE broker_listings IS 'Commercial real estate listings submitted by brokers for federal tenant matching';

-- Add comments to important columns
COMMENT ON COLUMN broker_listings.federal_score IS 'Calculated score (0-100) based on proximity to federal properties';
COMMENT ON COLUMN broker_listings.federal_score_data IS 'Detailed IOLP data used to calculate federal_score';
COMMENT ON COLUMN broker_listings.set_aside_eligible IS 'Array of set-aside types (sdvosb, wosb, 8a, hubzone, small_business)';
