-- =============================================================================
-- AI Summaries Cache Table
-- Stores LLM-generated summaries of GSA opportunities
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to opportunity (can be SAM.gov notice_id or internal opportunity_id)
  opportunity_id TEXT NOT NULL UNIQUE,
  notice_id TEXT,  -- SAM.gov notice ID for deduplication
  
  -- Summary content
  summary JSONB NOT NULL,
  /*
  Summary structure:
  {
    "headline": "GSA seeks 45,000 SF Class A office in downtown DC",
    "location": {
      "description": "Within 5 miles of Union Station, Washington DC",
      "delineatedArea": "Downtown DC, Capitol Hill, NoMa",
      "state": "DC",
      "city": "Washington"
    },
    "space": {
      "minSF": 40000,
      "maxSF": 50000,
      "description": "40,000-50,000 rentable square feet"
    },
    "propertyRequirements": {
      "type": "Office",
      "class": "A",
      "features": ["ADA compliant", "LEED Silver or higher", "24/7 access"]
    },
    "specialConditions": [
      "Must have secured parking for 50+ vehicles",
      "SCIF-capable space required",
      "Loading dock access"
    ],
    "dates": {
      "responseDeadline": "2025-03-15",
      "anticipatedOccupancy": "2025-09-01",
      "leaseTerm": "15 years"
    },
    "evaluationCriteria": [
      "Price (40%)",
      "Location (30%)", 
      "Technical capability (30%)"
    ],
    "brokerTakeaway": "Strong opportunity for Class A properties near Metro. LEED certification is mandatory."
  }
  */
  
  -- Raw input (for debugging/reprocessing)
  raw_description TEXT,
  
  -- Metadata
  model_used TEXT NOT NULL,  -- e.g., "claude-3-5-sonnet-20241022"
  tokens_used INTEGER,
  generation_time_ms INTEGER,
  
  -- Versioning (allows re-summarization if prompt improves)
  prompt_version TEXT DEFAULT 'v1',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indexes
CREATE INDEX idx_ai_summaries_opportunity ON ai_summaries(opportunity_id);
CREATE INDEX idx_ai_summaries_notice ON ai_summaries(notice_id) WHERE notice_id IS NOT NULL;
CREATE INDEX idx_ai_summaries_expires ON ai_summaries(expires_at);

-- RLS Policies (summaries are public read, system write)
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;

-- Anyone can read summaries
CREATE POLICY "ai_summaries_read_all" ON ai_summaries
  FOR SELECT USING (true);

-- Only service role can insert/update
CREATE POLICY "ai_summaries_service_write" ON ai_summaries
  FOR ALL USING (auth.role() = 'service_role');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_ai_summaries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_summaries_updated_at
  BEFORE UPDATE ON ai_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_summaries_updated_at();

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON TABLE ai_summaries IS 'Cache for LLM-generated opportunity summaries';
COMMENT ON COLUMN ai_summaries.summary IS 'Structured JSON summary of the opportunity';
COMMENT ON COLUMN ai_summaries.prompt_version IS 'Version of prompt used, for bulk re-summarization';
COMMENT ON COLUMN ai_summaries.expires_at IS 'Summaries expire after 30 days by default';
