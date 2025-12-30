-- Combined FedSpace Migrations
-- Generated: Fri Dec 26 15:36:21 MST 2025

-- ═══════════════════════════════════════════════════════════
-- Global Helper Functions
-- ═══════════════════════════════════════════════════════════

-- Generic function to update updated_at timestamp
-- This function is used by multiple tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enable required PostgreSQL extensions
-- earthdistance depends on cube extension
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- ═══════════════════════════════════════════════════════════
-- Migration: 20251213183000_create_opportunities_table.sql
-- ═══════════════════════════════════════════════════════════

-- Create table for storing SAM.gov opportunities
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  solicitation_number TEXT,
  department TEXT,
  sub_tier TEXT,
  office TEXT,
  posted_date TIMESTAMP WITH TIME ZONE,
  type TEXT,
  base_type TEXT,
  archive_type TEXT,
  archive_date TIMESTAMP WITH TIME ZONE,
  type_of_set_aside TEXT,
  type_of_set_aside_description TEXT,
  response_deadline TIMESTAMP WITH TIME ZONE,
  naics_code TEXT,
  classification_code TEXT,
  active TEXT,
  description TEXT,
  organization_type TEXT,

  -- Office Address
  office_zipcode TEXT,
  office_city TEXT,
  office_country_code TEXT,
  office_state TEXT,

  -- Place of Performance
  pop_street_address TEXT,
  pop_city_code TEXT,
  pop_city_name TEXT,
  pop_state_code TEXT,
  pop_state_name TEXT,
  pop_zip TEXT,
  pop_country_code TEXT,
  pop_country_name TEXT,

  -- Links
  additional_info_link TEXT,
  ui_link TEXT,

  -- Full JSON data for reference
  full_data JSONB,

  -- Source tracking
  source TEXT NOT NULL DEFAULT 'gsa_leasing', -- 'gsa_leasing' or 'all'

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_opportunities_notice_id ON public.opportunities(notice_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_source ON public.opportunities(source);
CREATE INDEX IF NOT EXISTS idx_opportunities_response_deadline ON public.opportunities(response_deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_posted_date ON public.opportunities(posted_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_active ON public.opportunities(active);
CREATE INDEX IF NOT EXISTS idx_opportunities_pop_state_code ON public.opportunities(pop_state_code);
CREATE INDEX IF NOT EXISTS idx_opportunities_department ON public.opportunities(department);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read opportunities
CREATE POLICY "Allow authenticated users to read opportunities"
  ON public.opportunities
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow service role to insert/update opportunities (for cron jobs)
CREATE POLICY "Allow service role to manage opportunities"
  ON public.opportunities
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ═══════════════════════════════════════════════════════════
-- Migration: 20251214150000_create_broker_listings.sql
-- ═══════════════════════════════════════════════════════════

-- Create enum types for broker listings
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lease_type AS ENUM (
    'full_service',
    'modified_gross',
    'triple_net',
    'ground_lease'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create broker_listings table
CREATE TABLE IF NOT EXISTS broker_listings (
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
CREATE INDEX IF NOT EXISTS idx_broker_listings_user_id ON broker_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_broker_listings_status ON broker_listings(status);
CREATE INDEX IF NOT EXISTS idx_broker_listings_state ON broker_listings(state);
CREATE INDEX IF NOT EXISTS idx_broker_listings_city ON broker_listings(city);
CREATE INDEX IF NOT EXISTS idx_broker_listings_property_type ON broker_listings(property_type);
CREATE INDEX IF NOT EXISTS idx_broker_listings_available_sf ON broker_listings(available_sf);
CREATE INDEX IF NOT EXISTS idx_broker_listings_federal_score ON broker_listings(federal_score) WHERE federal_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_broker_listings_location ON broker_listings(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_broker_listings_created_at ON broker_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_broker_listings_published_at ON broker_listings(published_at DESC) WHERE published_at IS NOT NULL;

-- Create GiST index for location-based queries (optional, for future spatial queries)
-- CREATE INDEX idx_broker_listings_location_gist ON broker_listings USING GIST (ll_to_earth(latitude, longitude));

-- Row Level Security (RLS) Policies
ALTER TABLE broker_listings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active listings
DROP POLICY IF EXISTS "Anyone can view active listings" ON broker_listings;
CREATE POLICY "Anyone can view active listings"
  ON broker_listings
  FOR SELECT
  USING (status = 'active');

-- Policy: Users can view their own listings regardless of status
DROP POLICY IF EXISTS "Users can view their own listings" ON broker_listings;
CREATE POLICY "Users can view their own listings"
  ON broker_listings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own listings
DROP POLICY IF EXISTS "Users can create listings" ON broker_listings;
CREATE POLICY "Users can create listings"
  ON broker_listings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own listings
DROP POLICY IF EXISTS "Users can update their own listings" ON broker_listings;
CREATE POLICY "Users can update their own listings"
  ON broker_listings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own listings
DROP POLICY IF EXISTS "Users can delete their own listings" ON broker_listings;
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
DROP TRIGGER IF EXISTS broker_listings_updated_at ON broker_listings;
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
DROP TRIGGER IF EXISTS broker_listings_published_at ON broker_listings;
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


-- ═══════════════════════════════════════════════════════════
-- Migration: 20251214140000_create_company_profiles.sql
-- ═══════════════════════════════════════════════════════════

-- Company profiles for qualification matching and bid analysis
CREATE TABLE IF NOT EXISTS company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Company Information
  company_name TEXT NOT NULL,
  duns_number TEXT,
  uei_number TEXT,
  cage_code TEXT,

  -- Business Classifications
  business_types TEXT[] DEFAULT '{}', -- ['small_business', 'minority_owned', 'veteran_owned', 'woman_owned', etc.]
  set_aside_certifications TEXT[] DEFAULT '{}', -- ['8a', 'sdvosb', 'wosb', 'hubzone', 'edwosb', 'vosb']

  -- NAICS Codes (what the company can do)
  naics_codes TEXT[] DEFAULT '{}', -- ['541511', '541512', '541519', etc.]
  primary_naics TEXT, -- Main NAICS code

  -- Past Performance & Experience
  years_in_business INT,
  federal_experience_years INT,
  largest_contract_value DECIMAL(15,2),
  contracts_completed INT DEFAULT 0,

  -- Capabilities & Certifications
  clearance_level TEXT, -- 'none', 'confidential', 'secret', 'top_secret', 'ts_sci'
  cleared_facility BOOLEAN DEFAULT false,
  geographic_coverage TEXT[] DEFAULT '{}', -- ['DC', 'VA', 'MD', 'CA', 'nationwide']

  -- Financial Information
  annual_revenue DECIMAL(15,2),
  bonding_capacity DECIMAL(15,2),

  -- Team & Resources
  employee_count INT,
  key_personnel JSONB DEFAULT '[]', -- [{name, title, clearance, certifications, years_experience}]

  -- Core Competencies (free text for now, can structure later)
  core_competencies TEXT[] DEFAULT '{}',
  past_performance_summary TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one profile per user
  UNIQUE(user_id)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_company_profiles_user ON company_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_company_profiles_naics ON company_profiles USING GIN(naics_codes);
CREATE INDEX IF NOT EXISTS idx_company_profiles_certifications ON company_profiles USING GIN(set_aside_certifications);

-- Enable Row Level Security
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see and manage their own profile
DROP POLICY IF EXISTS "Users can view own company profile" ON company_profiles;
CREATE POLICY "Users can view own company profile"
  ON company_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own company profile" ON company_profiles;
CREATE POLICY "Users can insert own company profile"
  ON company_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own company profile" ON company_profiles;
CREATE POLICY "Users can update own company profile"
  ON company_profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own company profile" ON company_profiles;
CREATE POLICY "Users can delete own company profile"
  ON company_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_company_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_company_profiles_updated_at ON company_profiles;
CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_company_profiles_updated_at();

-- Add helpful comment
COMMENT ON TABLE company_profiles IS 'Company profiles for contractors using FedSpace - used for qualification checks and bid/no-bid analysis';


-- ═══════════════════════════════════════════════════════════
-- Migration: 20251214130000_create_saved_opportunities.sql
-- ═══════════════════════════════════════════════════════════

-- Create saved_opportunities table for users to track solicitations
CREATE TABLE saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notice_id TEXT NOT NULL,
  opportunity_data JSONB NOT NULL, -- Store full opportunity object
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

-- Create indexes for fast lookups
CREATE INDEX idx_saved_opportunities_user ON saved_opportunities(user_id);
CREATE INDEX idx_saved_opportunities_status ON saved_opportunities(user_id, status);
CREATE INDEX idx_saved_opportunities_notice ON saved_opportunities(notice_id);

-- Enable Row Level Security
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own saved opportunities"
  ON saved_opportunities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved opportunities"
  ON saved_opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved opportunities"
  ON saved_opportunities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved opportunities"
  ON saved_opportunities FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_saved_opportunities_updated_at
  BEFORE UPDATE ON saved_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_opportunities_updated_at();


-- ═══════════════════════════════════════════════════════════
-- Migration: 20251214141000_create_opportunity_inquiries.sql
-- ═══════════════════════════════════════════════════════════

-- Create opportunity_inquiries table for lead capture
CREATE TABLE opportunity_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Opportunity Information
  opportunity_id TEXT NOT NULL,
  opportunity_title TEXT NOT NULL,

  -- User Information
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_phone TEXT,

  -- Property Information
  property_address TEXT NOT NULL,
  broker_listing_id UUID REFERENCES broker_listings(id) ON DELETE SET NULL,

  -- Additional Details
  message TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_opportunity_inquiries_user_id ON opportunity_inquiries(user_id);
CREATE INDEX idx_opportunity_inquiries_opportunity_id ON opportunity_inquiries(opportunity_id);
CREATE INDEX idx_opportunity_inquiries_broker_listing_id ON opportunity_inquiries(broker_listing_id) WHERE broker_listing_id IS NOT NULL;
CREATE INDEX idx_opportunity_inquiries_status ON opportunity_inquiries(status);
CREATE INDEX idx_opportunity_inquiries_created_at ON opportunity_inquiries(created_at DESC);

-- Enable Row Level Security
ALTER TABLE opportunity_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own inquiries
CREATE POLICY "Users can view own inquiries"
  ON opportunity_inquiries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create inquiries
CREATE POLICY "Users can create inquiries"
  ON opportunity_inquiries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own inquiries
CREATE POLICY "Users can update own inquiries"
  ON opportunity_inquiries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own inquiries
CREATE POLICY "Users can delete own inquiries"
  ON opportunity_inquiries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER opportunity_inquiries_updated_at
  BEFORE UPDATE ON opportunity_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE opportunity_inquiries IS 'Stores broker inquiries/interest in GSA opportunities';


-- ═══════════════════════════════════════════════════════════
-- Migration: 20251216000000_create_fedspace_tables.sql
-- ═══════════════════════════════════════════════════════════

/**
 * FedSpace Patent-Pending Algorithm Tables
 *
 * PATENT #1: Federal Neighborhood Score caching
 * PATENT #2: Property-Opportunity Match score caching
 *
 * Created: 2025-12-16
 */

-- ==================== Federal Buildings Table ====================

CREATE TABLE IF NOT EXISTS federal_buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source identification
  source_type TEXT NOT NULL CHECK (source_type IN ('iolp_building', 'iolp_lease', 'sam_gov')),
  source_id TEXT NOT NULL,

  -- Location
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(11, 7) NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT NOT NULL,
  zipcode TEXT,

  -- Space details
  rsf INTEGER DEFAULT 0,
  vacant BOOLEAN DEFAULT false,
  vacant_rsf INTEGER DEFAULT 0,

  -- Property type
  property_type TEXT CHECK (property_type IN ('owned', 'leased')),

  -- Lease info (for leased properties)
  lease_expiration_date TIMESTAMPTZ,

  -- Building info
  construction_year INTEGER,
  agency TEXT,

  -- Full source data (JSONB for flexibility)
  source_data JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes for spatial queries
  CONSTRAINT unique_source UNIQUE (source_type, source_id)
);

-- Spatial index for fast radius queries (used by R-Tree)
CREATE INDEX idx_federal_buildings_location ON federal_buildings USING gist (
  ll_to_earth(latitude::float, longitude::float)
);

-- Regular indexes
CREATE INDEX idx_federal_buildings_state ON federal_buildings (state);
CREATE INDEX idx_federal_buildings_property_type ON federal_buildings (property_type);
CREATE INDEX idx_federal_buildings_lease_expiration ON federal_buildings (lease_expiration_date) WHERE lease_expiration_date IS NOT NULL;
CREATE INDEX idx_federal_buildings_agency ON federal_buildings (agency);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_federal_buildings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER federal_buildings_updated_at
  BEFORE UPDATE ON federal_buildings
  FOR EACH ROW
  EXECUTE FUNCTION update_federal_buildings_updated_at();

-- Enable RLS
ALTER TABLE federal_buildings ENABLE ROW LEVEL SECURITY;

-- Public read access (buildings are public data)
CREATE POLICY "Federal buildings are publicly readable"
  ON federal_buildings
  FOR SELECT
  USING (true);

-- Only service role can insert/update
CREATE POLICY "Service role can manage federal buildings"
  ON federal_buildings
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ==================== Federal Neighborhood Scores Cache ====================

CREATE TABLE IF NOT EXISTS federal_neighborhood_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Location queried
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(11, 7) NOT NULL,
  radius_miles NUMERIC(5, 2) NOT NULL DEFAULT 5.0,

  -- Score results (JSONB to store full FederalNeighborhoodScore object)
  score_data JSONB NOT NULL,

  -- Quick access fields (denormalized for queries)
  overall_score NUMERIC(4, 1) NOT NULL,
  grade TEXT NOT NULL CHECK (grade IN ('A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F')),
  percentile INTEGER CHECK (percentile >= 0 AND percentile <= 100),

  -- Metrics (denormalized for analytics)
  total_properties INTEGER,
  leased_properties INTEGER,
  owned_properties INTEGER,
  total_rsf BIGINT,
  expiring_leases_count INTEGER,

  -- Cache management
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  hit_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Composite unique index for location + radius
  CONSTRAINT unique_location_radius UNIQUE (latitude, longitude, radius_miles)
);

-- Spatial index for nearby cache lookups
CREATE INDEX idx_neighborhood_scores_location ON federal_neighborhood_scores USING gist (
  ll_to_earth(latitude::float, longitude::float)
);

-- Index for cache cleanup
CREATE INDEX idx_neighborhood_scores_expires ON federal_neighborhood_scores (expires_at);

-- Index for score queries
CREATE INDEX idx_neighborhood_scores_grade ON federal_neighborhood_scores (grade);
CREATE INDEX idx_neighborhood_scores_overall ON federal_neighborhood_scores (overall_score DESC);

-- Function to increment hit count
CREATE OR REPLACE FUNCTION increment_neighborhood_score_hit()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE federal_neighborhood_scores
  SET hit_count = hit_count + 1,
      last_accessed_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE federal_neighborhood_scores ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Neighborhood scores are publicly readable"
  ON federal_neighborhood_scores
  FOR SELECT
  USING (true);

-- Authenticated users can create cache entries
CREATE POLICY "Authenticated users can cache neighborhood scores"
  ON federal_neighborhood_scores
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Service role can manage all
CREATE POLICY "Service role can manage neighborhood scores"
  ON federal_neighborhood_scores
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ==================== Property-Opportunity Match Scores Cache ====================

CREATE TABLE IF NOT EXISTS property_match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Property and opportunity identification
  property_id UUID, -- References broker_listings or properties table
  opportunity_id UUID, -- References opportunities table
  notice_id TEXT, -- SAM.gov notice ID

  -- Score results (JSONB to store full MatchingResult object)
  score_data JSONB NOT NULL,

  -- Quick access fields (denormalized for queries)
  overall_score NUMERIC(4, 1) NOT NULL,
  grade TEXT NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
  qualified BOOLEAN NOT NULL,
  competitive BOOLEAN NOT NULL,

  -- Early termination info (if disqualified)
  early_terminated BOOLEAN DEFAULT false,
  failed_constraint TEXT CHECK (failed_constraint IN ('STATE_MATCH', 'RSF_MINIMUM', 'SET_ASIDE', 'ADA', 'CLEARANCE')),
  computation_saved_pct INTEGER,

  -- Factor scores (denormalized for analytics)
  location_score NUMERIC(4, 1),
  space_score NUMERIC(4, 1),
  building_score NUMERIC(4, 1),
  timeline_score NUMERIC(4, 1),
  experience_score NUMERIC(4, 1),

  -- Cache management
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  hit_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  computation_time_ms NUMERIC(10, 2),

  -- Composite unique index
  CONSTRAINT unique_property_opportunity UNIQUE (property_id, opportunity_id)
);

-- Indexes
CREATE INDEX idx_match_scores_property ON property_match_scores (property_id);
CREATE INDEX idx_match_scores_opportunity ON property_match_scores (opportunity_id);
CREATE INDEX idx_match_scores_notice ON property_match_scores (notice_id);
CREATE INDEX idx_match_scores_grade ON property_match_scores (grade);
CREATE INDEX idx_match_scores_qualified ON property_match_scores (qualified, competitive);
CREATE INDEX idx_match_scores_expires ON property_match_scores (expires_at);
CREATE INDEX idx_match_scores_overall ON property_match_scores (overall_score DESC);

-- Index for early termination analytics
CREATE INDEX idx_match_scores_early_termination ON property_match_scores (early_terminated, failed_constraint);

-- Enable RLS
ALTER TABLE property_match_scores ENABLE ROW LEVEL SECURITY;

-- Users can read their own property match scores
CREATE POLICY "Users can read their property match scores"
  ON property_match_scores
  FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM broker_listings WHERE user_id = auth.uid()
    )
  );

-- Authenticated users can create cache entries for their properties
CREATE POLICY "Users can cache their property match scores"
  ON property_match_scores
  FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM broker_listings WHERE user_id = auth.uid()
    )
  );

-- Service role can manage all
CREATE POLICY "Service role can manage match scores"
  ON property_match_scores
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ==================== Cache Cleanup Function ====================

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Delete expired neighborhood scores
  DELETE FROM federal_neighborhood_scores
  WHERE expires_at < NOW();

  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Delete expired match scores
  DELETE FROM property_match_scores
  WHERE expires_at < NOW();

  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== Analytics Views ====================

-- View: Federal score distribution
CREATE OR REPLACE VIEW federal_score_distribution AS
SELECT
  grade,
  COUNT(*) as count,
  AVG(overall_score) as avg_score,
  AVG(total_properties) as avg_properties,
  AVG(total_rsf) as avg_rsf
FROM federal_neighborhood_scores
WHERE expires_at > NOW()
GROUP BY grade
ORDER BY grade;

-- View: Match score distribution
CREATE OR REPLACE VIEW match_score_distribution AS
SELECT
  grade,
  qualified,
  competitive,
  COUNT(*) as count,
  AVG(overall_score) as avg_score,
  AVG(computation_time_ms) as avg_computation_ms
FROM property_match_scores
WHERE expires_at > NOW()
GROUP BY grade, qualified, competitive
ORDER BY grade, qualified DESC, competitive DESC;

-- View: Early termination analytics
CREATE OR REPLACE VIEW early_termination_analytics AS
SELECT
  failed_constraint,
  COUNT(*) as disqualification_count,
  AVG(computation_saved_pct) as avg_computation_saved,
  ROUND(COUNT(*)::NUMERIC / NULLIF((SELECT COUNT(*) FROM property_match_scores WHERE early_terminated = true), 0) * 100, 2) as disqualification_rate
FROM property_match_scores
WHERE early_terminated = true
  AND expires_at > NOW()
GROUP BY failed_constraint
ORDER BY disqualification_count DESC;

-- View: Top performing properties (by avg match score)
CREATE OR REPLACE VIEW top_performing_properties AS
SELECT
  pms.property_id,
  bl.street_address,
  bl.city,
  bl.state,
  COUNT(*) as match_count,
  AVG(pms.overall_score) as avg_match_score,
  SUM(CASE WHEN pms.competitive THEN 1 ELSE 0 END) as competitive_matches,
  MAX(pms.overall_score) as best_match_score
FROM property_match_scores pms
LEFT JOIN broker_listings bl ON bl.id = pms.property_id
WHERE pms.expires_at > NOW()
  AND pms.qualified = true
GROUP BY pms.property_id, bl.street_address, bl.city, bl.state
HAVING COUNT(*) >= 3
ORDER BY avg_match_score DESC
LIMIT 100;

-- ==================== Helper Functions ====================

-- Function to get or calculate federal neighborhood score
CREATE OR REPLACE FUNCTION get_federal_neighborhood_score(
  p_latitude NUMERIC,
  p_longitude NUMERIC,
  p_radius_miles NUMERIC DEFAULT 5.0
)
RETURNS JSONB AS $$
DECLARE
  cached_score JSONB;
BEGIN
  -- Try to get from cache
  SELECT score_data INTO cached_score
  FROM federal_neighborhood_scores
  WHERE latitude = p_latitude
    AND longitude = p_longitude
    AND radius_miles = p_radius_miles
    AND expires_at > NOW();

  IF cached_score IS NOT NULL THEN
    -- Update hit count
    UPDATE federal_neighborhood_scores
    SET hit_count = hit_count + 1,
        last_accessed_at = NOW()
    WHERE latitude = p_latitude
      AND longitude = p_longitude
      AND radius_miles = p_radius_miles;

    RETURN jsonb_build_object('cached', true, 'data', cached_score);
  ELSE
    RETURN jsonb_build_object('cached', false, 'data', null);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get or calculate property match score
CREATE OR REPLACE FUNCTION get_property_match_score(
  p_property_id UUID,
  p_opportunity_id UUID
)
RETURNS JSONB AS $$
DECLARE
  cached_score JSONB;
BEGIN
  -- Try to get from cache
  SELECT score_data INTO cached_score
  FROM property_match_scores
  WHERE property_id = p_property_id
    AND opportunity_id = p_opportunity_id
    AND expires_at > NOW();

  IF cached_score IS NOT NULL THEN
    -- Update hit count
    UPDATE property_match_scores
    SET hit_count = hit_count + 1,
        last_accessed_at = NOW()
    WHERE property_id = p_property_id
      AND opportunity_id = p_opportunity_id;

    RETURN jsonb_build_object('cached', true, 'data', cached_score);
  ELSE
    RETURN jsonb_build_object('cached', false, 'data', null);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ==================== Comments ====================

COMMENT ON TABLE federal_buildings IS 'Cached federal property data from IOLP and SAM.gov for spatial indexing';
COMMENT ON TABLE federal_neighborhood_scores IS 'PATENT #1: Cached federal neighborhood scores with 24-hour TTL';
COMMENT ON TABLE property_match_scores IS 'PATENT #2: Cached property-opportunity match scores with early-termination analytics';

COMMENT ON COLUMN federal_neighborhood_scores.score_data IS 'Full FederalNeighborhoodScore JSON object';
COMMENT ON COLUMN property_match_scores.score_data IS 'Full MatchingResult JSON object';
COMMENT ON COLUMN property_match_scores.computation_saved_pct IS 'Percentage of computation saved by early termination (0-100)';


-- ═══════════════════════════════════════════════════════════
-- Migration: 20251220000000_create_property_matches.sql
-- ═══════════════════════════════════════════════════════════

-- Create property_matches table for storing match scores between properties and opportunities
CREATE TABLE IF NOT EXISTS public.property_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  property_id UUID NOT NULL REFERENCES broker_listings(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,

  -- Overall Score (0-100)
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  grade TEXT NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
  competitive BOOLEAN DEFAULT false,
  qualified BOOLEAN DEFAULT false,

  -- Category Scores (0-100 for each)
  location_score INTEGER CHECK (location_score >= 0 AND location_score <= 100),
  space_score INTEGER CHECK (space_score >= 0 AND space_score <= 100),
  building_score INTEGER CHECK (building_score >= 0 AND building_score <= 100),
  timeline_score INTEGER CHECK (timeline_score >= 0 AND timeline_score <= 100),
  experience_score INTEGER CHECK (experience_score >= 0 AND experience_score <= 100),

  -- Full Score Breakdown (JSONB for rich details)
  -- Stores the complete MatchScoreResult with all breakdowns
  score_breakdown JSONB NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one match per property-opportunity pair
  UNIQUE(property_id, opportunity_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_property_matches_property
  ON public.property_matches(property_id);

CREATE INDEX IF NOT EXISTS idx_property_matches_opportunity
  ON public.property_matches(opportunity_id);

CREATE INDEX IF NOT EXISTS idx_property_matches_score
  ON public.property_matches(overall_score DESC);

CREATE INDEX IF NOT EXISTS idx_property_matches_competitive
  ON public.property_matches(competitive)
  WHERE competitive = true;

CREATE INDEX IF NOT EXISTS idx_property_matches_qualified
  ON public.property_matches(qualified)
  WHERE qualified = true;

-- Composite index for fetching matches by property with score filter
CREATE INDEX IF NOT EXISTS idx_property_matches_property_score
  ON public.property_matches(property_id, overall_score DESC);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_property_matches_updated_at
  BEFORE UPDATE ON public.property_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.property_matches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view matches for their own properties
CREATE POLICY "Users can view matches for their properties"
  ON public.property_matches
  FOR SELECT
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM broker_listings WHERE user_id = auth.uid()
    )
  );

-- Policy: Service role can manage all matches (for batch matching jobs)
CREATE POLICY "Service role can manage all matches"
  ON public.property_matches
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ═══════════════════════════════════════════════════════════
-- Migration: 20251223000000_create_cache_cleanup_function.sql
-- ═══════════════════════════════════════════════════════════

-- ================================================================
-- Cache Cleanup Function
-- Sprint 2: Essential for preventing cache table bloat
-- ================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Delete expired neighborhood scores
  DELETE FROM federal_neighborhood_scores
  WHERE expires_at < NOW();

  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Delete expired match scores
  DELETE FROM property_match_scores
  WHERE expires_at < NOW();

  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_expired_cache IS 'Removes expired cache entries from federal_neighborhood_scores and property_match_scores tables. Returns count of deleted records.';

