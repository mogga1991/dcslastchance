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
