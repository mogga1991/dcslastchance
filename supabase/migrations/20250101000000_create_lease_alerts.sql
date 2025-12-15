-- Create lease_expiration_alerts table
CREATE TABLE IF NOT EXISTS lease_expiration_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Property identifiers
  location_code TEXT NOT NULL,
  building_name TEXT,

  -- Location
  address TEXT,
  city TEXT,
  state TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Lease details
  lease_expiration_date DATE,
  building_rsf INTEGER,
  agency_abbr TEXT,

  -- Alert settings
  is_active BOOLEAN DEFAULT true,
  notify_days_before INTEGER DEFAULT 90, -- Notify 90 days before expiration
  last_notified_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lease_alerts_user_id ON lease_expiration_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_lease_alerts_location_code ON lease_expiration_alerts(location_code);
CREATE INDEX IF NOT EXISTS idx_lease_alerts_expiration_date ON lease_expiration_alerts(lease_expiration_date);
CREATE INDEX IF NOT EXISTS idx_lease_alerts_active ON lease_expiration_alerts(is_active) WHERE is_active = true;

-- Create unique constraint to prevent duplicate alerts
CREATE UNIQUE INDEX IF NOT EXISTS idx_lease_alerts_unique
  ON lease_expiration_alerts(user_id, location_code);

-- Enable RLS
ALTER TABLE lease_expiration_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own alerts"
  ON lease_expiration_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts"
  ON lease_expiration_alerts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON lease_expiration_alerts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON lease_expiration_alerts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lease_alert_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_lease_alert_updated_at
  BEFORE UPDATE ON lease_expiration_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_lease_alert_updated_at();

-- Add comment to table
COMMENT ON TABLE lease_expiration_alerts IS 'User alerts for expiring federal leases';
