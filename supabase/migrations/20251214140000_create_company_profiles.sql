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
