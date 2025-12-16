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
