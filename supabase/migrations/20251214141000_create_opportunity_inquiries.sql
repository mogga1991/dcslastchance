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
