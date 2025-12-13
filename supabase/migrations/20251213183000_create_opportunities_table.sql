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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
