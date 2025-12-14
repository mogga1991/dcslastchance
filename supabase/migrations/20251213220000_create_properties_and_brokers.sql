-- ============================================================================
-- PROPERTIES AND BROKER PROFILES SCHEMA
-- For GSA Lease Matching Platform - Property-to-Opportunity Scoring
-- ============================================================================

-- Enable required extensions for geospatial queries
create extension if not exists cube;
create extension if not exists earthdistance;

-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  broker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID, -- Will reference public.orgs after ProposalIQ migration

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL DEFAULT 'office', -- office, warehouse, retail, mixed

  -- Location
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT,
  country_code TEXT DEFAULT 'US',
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),

  -- Space Details
  total_sqft INTEGER NOT NULL,
  available_sqft INTEGER NOT NULL,
  usable_sqft INTEGER, -- If different from rentable
  min_divisible_sqft INTEGER,
  is_contiguous BOOLEAN DEFAULT true,

  -- Building Details
  building_class TEXT CHECK (building_class IN ('A', 'A+', 'B', 'C')),
  total_floors INTEGER,
  available_floors INTEGER[],
  year_built INTEGER,
  last_renovated INTEGER,

  -- Accessibility
  ada_compliant BOOLEAN DEFAULT false,
  public_transit_access BOOLEAN DEFAULT false,
  parking_spaces INTEGER,
  parking_ratio DECIMAL(4, 2), -- Spaces per 1000 SF

  -- Features (JSONB for flexibility)
  features JSONB DEFAULT '{
    "fiber": false,
    "backupPower": false,
    "loadingDock": false,
    "security24x7": false,
    "secureAccess": false,
    "scifCapable": false,
    "dataCenter": false,
    "cafeteria": false,
    "fitnessCenter": false,
    "conferenceCenter": false
  }'::jsonb,

  -- Certifications
  certifications TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timeline
  available_date TIMESTAMP WITH TIME ZONE,
  min_lease_term_months INTEGER,
  max_lease_term_months INTEGER,
  build_out_weeks_needed INTEGER DEFAULT 0,

  -- Financial
  lease_rate_per_sf DECIMAL(10, 2),
  lease_rate_type TEXT CHECK (lease_rate_type IN ('annual', 'monthly')),
  operating_expenses_per_sf DECIMAL(10, 2),

  -- Images and Documents
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  floor_plans TEXT[] DEFAULT ARRAY[]::TEXT[],
  documents TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'leased', 'inactive')),
  featured BOOLEAN DEFAULT false,

  -- Metrics
  views INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create broker_profiles table (extends user profiles with gov lease experience)
CREATE TABLE IF NOT EXISTS public.broker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Company Info
  company_name TEXT,
  license_number TEXT,
  license_state TEXT,

  -- Government Experience
  government_lease_experience BOOLEAN DEFAULT false,
  government_leases_count INTEGER DEFAULT 0,
  gsa_certified BOOLEAN DEFAULT false,

  -- Business Details
  years_in_business INTEGER DEFAULT 0,
  total_portfolio_sqft BIGINT DEFAULT 0,

  -- References (JSONB array)
  gov_references JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"agency": "GSA", "contractValue": 5000000, "year": 2023}]

  -- Flexibility
  willing_to_build_to_suit BOOLEAN DEFAULT false,
  willing_to_provide_improvements BOOLEAN DEFAULT false,

  -- Preferences
  preferred_agencies TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_states TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Contact
  phone TEXT,
  website TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_scores table (cache calculated match scores)
CREATE TABLE IF NOT EXISTS public.property_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,

  -- Overall Score
  overall_score INTEGER NOT NULL,
  grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
  competitive BOOLEAN DEFAULT false,
  qualified BOOLEAN DEFAULT false,

  -- Category Scores (JSONB for detailed breakdown)
  category_scores JSONB NOT NULL,
  -- Example structure:
  -- {
  --   "location": {"score": 85, "weight": 0.30, "weighted": 25.5, "breakdown": {...}},
  --   "space": {"score": 90, "weight": 0.25, "weighted": 22.5, "breakdown": {...}},
  --   ...
  -- }

  -- Insights
  strengths TEXT[] DEFAULT ARRAY[]::TEXT[],
  weaknesses TEXT[] DEFAULT ARRAY[]::TEXT[],
  recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
  disqualifiers TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Metadata
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),

  UNIQUE(property_id, opportunity_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_broker_id ON public.properties(broker_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_state ON public.properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_available_date ON public.properties(available_date);
CREATE INDEX IF NOT EXISTS idx_properties_building_class ON public.properties(building_class);
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties USING gist(
  ll_to_earth(latitude::double precision, longitude::double precision)
);

-- Broker profiles indexes
CREATE INDEX IF NOT EXISTS idx_broker_profiles_user_id ON public.broker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_broker_profiles_gsa_certified ON public.broker_profiles(gsa_certified);

-- Property scores indexes
CREATE INDEX IF NOT EXISTS idx_property_scores_property_id ON public.property_scores(property_id);
CREATE INDEX IF NOT EXISTS idx_property_scores_opportunity_id ON public.property_scores(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_property_scores_overall_score ON public.property_scores(overall_score);
CREATE INDEX IF NOT EXISTS idx_property_scores_expires_at ON public.property_scores(expires_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on properties
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at on broker_profiles
CREATE TRIGGER update_broker_profiles_updated_at
  BEFORE UPDATE ON public.broker_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_scores ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Anyone can view active properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Brokers can manage their own properties"
  ON public.properties FOR ALL
  TO authenticated
  USING (broker_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Service role can manage all properties"
  ON public.properties FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Broker profiles policies
CREATE POLICY "Anyone can view broker profiles"
  ON public.broker_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own broker profile"
  ON public.broker_profiles FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all broker profiles"
  ON public.broker_profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Property scores policies
CREATE POLICY "Anyone can view property scores"
  ON public.property_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage property scores"
  ON public.property_scores FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to clean up expired property scores
CREATE OR REPLACE FUNCTION cleanup_expired_property_scores()
RETURNS void AS $$
BEGIN
  DELETE FROM public.property_scores
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cleanup_expired_property_scores() TO service_role;
