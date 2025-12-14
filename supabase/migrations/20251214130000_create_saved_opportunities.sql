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
