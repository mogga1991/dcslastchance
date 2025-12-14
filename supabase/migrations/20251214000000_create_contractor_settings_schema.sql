-- ============================================================================
-- CONTRACTOR SETTINGS SCHEMA
-- Comprehensive knowledge base for government contractors
-- Used by AI for RFP qualification, bid/no-bid scoring, and proposal drafting
-- ============================================================================

-- ============================================================================
-- 1. CONTRACTOR PROFILES
-- Core company information and eligibility data
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.contractor_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Legal & Registration
  legal_name VARCHAR(255) NOT NULL,
  dba_name VARCHAR(255),
  uei VARCHAR(12),  -- Unique Entity Identifier
  cage VARCHAR(5),  -- Commercial and Government Entity Code

  -- SAM Registration
  sam_status VARCHAR(20) DEFAULT 'unknown' CHECK (sam_status IN ('active', 'inactive', 'unknown')),
  sam_expiration_date DATE,

  -- Business Classification
  business_size VARCHAR(20) DEFAULT 'unknown' CHECK (business_size IN ('small', 'other', 'unknown')),
  socio_status JSONB DEFAULT '[]'::jsonb,  -- Array of: ["8a", "sdvosb", "wosb", "hubzone", "vosb"]

  -- Industry Codes
  naics_primary VARCHAR(6),
  naics_secondary JSONB DEFAULT '[]'::jsonb,  -- Array of NAICS codes
  psc_codes JSONB DEFAULT '[]'::jsonb,  -- Product Service Codes

  -- Service Areas & Capabilities
  service_areas JSONB DEFAULT '[]'::jsonb,  -- States/regions
  typical_contract_types JSONB DEFAULT '[]'::jsonb,  -- ["FFP", "T&M", "CPFF", etc.]

  -- Contract Size & Capacity
  contract_size_min NUMERIC(15, 2),
  contract_size_max NUMERIC(15, 2),
  mobilization_days INTEGER,
  self_perform_pct INTEGER CHECK (self_perform_pct >= 0 AND self_perform_pct <= 100),

  -- Staffing
  headcount_ft INTEGER DEFAULT 0,
  headcount_pt INTEGER DEFAULT 0,
  headcount_1099 INTEGER DEFAULT 0,
  surge_capacity_notes TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(org_id)
);

-- ============================================================================
-- 2. CAPABILITY DOCUMENTS (Evidence Locker)
-- Document uploads that AI can cite for verification
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.capability_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Document Classification
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
    'capability_statement',
    'cpars',
    'ppq',
    'resume',
    'insurance_coi',
    'license',
    'bonding_letter',
    'safety_plan',
    'cyber_policy',
    'other'
  )),

  -- File Information
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  storage_url TEXT NOT NULL,
  file_size_bytes BIGINT,

  -- Processing Status
  status VARCHAR(20) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'ready', 'failed')),
  processing_error TEXT,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. DOCUMENT VERSIONS
-- Track document versions for citation accuracy
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.capability_documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  checksum VARCHAR(64) NOT NULL,  -- SHA-256 hash

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(document_id, version)
);

-- ============================================================================
-- 4. DOCUMENT PAGES (for citation)
-- Store parsed document content with page-level granularity
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.document_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_version_id UUID NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,

  -- Page Content
  text_content TEXT,

  -- Citation Metadata
  offsets JSONB,  -- {start: 0, end: 100} for character positions

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(document_version_id, page_number)
);

-- ============================================================================
-- 5. CAPABILITY FACTS
-- Structured, citeable facts extracted from evidence documents
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.capability_facts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Fact Classification
  fact_type VARCHAR(50) NOT NULL CHECK (fact_type IN (
    'insurance_limit',
    'license',
    'bonding_capacity',
    'clearance',
    'certification',
    'labor_category',
    'rate',
    'equipment',
    'service_area',
    'past_performance_metric',
    'other'
  )),

  fact_key VARCHAR(255) NOT NULL,
  fact_value JSONB NOT NULL,
  confidence NUMERIC(3, 2) CHECK (confidence >= 0 AND confidence <= 1),

  -- Citation (must be traceable)
  citation JSONB NOT NULL,  -- {document_version_id, page, start_offset, end_offset, quote}

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. PAST PERFORMANCE PROJECTS
-- Reference projects for qualification and scoring
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.past_performance_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Project Basics
  customer_name VARCHAR(255) NOT NULL,
  contract_number VARCHAR(100),

  -- Period of Performance
  pop_start DATE,
  pop_end DATE,

  -- Project Details
  scope_summary TEXT NOT NULL,
  outcomes_metrics TEXT,  -- Quantifiable outcomes/KPIs
  contract_value NUMERIC(15, 2),
  place_of_performance VARCHAR(255),

  -- References (kept private)
  reference_contact JSONB,  -- {name, title, phone, email} - encrypted

  -- Supporting Evidence
  supporting_document_ids JSONB DEFAULT '[]'::jsonb,  -- Array of capability_documents IDs

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. KEY PERSONNEL
-- Staff profiles for staffing plan requirements
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.key_personnel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,

  -- Resume/Evidence
  resume_document_id UUID REFERENCES public.capability_documents(id),

  -- Qualifications
  certifications JSONB DEFAULT '[]'::jsonb,  -- Array of certification names
  clearance_status VARCHAR(20) DEFAULT 'none' CHECK (clearance_status IN ('none', 'eligible', 'active', 'unknown')),

  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. PROPOSAL LIBRARY
-- Approved boilerplate content for proposal drafting
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.proposal_library_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content Classification
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'company_overview',
    'management_approach',
    'qc_plan',
    'staffing_plan',
    'transition_plan',
    'past_performance_narrative',
    'safety_excerpt',
    'cyber_narrative',
    'other'
  )),

  title VARCHAR(255) NOT NULL,
  content_rich_text TEXT NOT NULL,  -- Markdown or HTML

  -- Approval Workflow
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 9. CONSTRAINTS & POLICIES
-- What NOT to say in proposals (compliance guardrails)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.constraints_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Prohibited Claims
  prohibited_claims JSONB DEFAULT '[]'::jsonb,  -- Array of strings

  -- Prohibited Scopes
  prohibited_scopes JSONB DEFAULT '[]'::jsonb,  -- Array of strings

  -- Internal Notes
  internal_approval_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(org_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_contractor_profiles_org ON public.contractor_profiles(org_id);
CREATE INDEX idx_capability_documents_org ON public.capability_documents(org_id);
CREATE INDEX idx_capability_documents_type ON public.capability_documents(document_type);
CREATE INDEX idx_capability_documents_status ON public.capability_documents(status);
CREATE INDEX idx_document_versions_doc ON public.document_versions(document_id);
CREATE INDEX idx_document_pages_version ON public.document_pages(document_version_id);
CREATE INDEX idx_capability_facts_org ON public.capability_facts(org_id);
CREATE INDEX idx_capability_facts_org_type ON public.capability_facts(org_id, fact_type);
CREATE INDEX idx_past_performance_org ON public.past_performance_projects(org_id);
CREATE INDEX idx_key_personnel_org ON public.key_personnel(org_id);
CREATE INDEX idx_proposal_library_org ON public.proposal_library_items(org_id);
CREATE INDEX idx_proposal_library_category ON public.proposal_library_items(category);
CREATE INDEX idx_constraints_policies_org ON public.constraints_policies(org_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.contractor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capability_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capability_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_performance_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constraints_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own org's data
CREATE POLICY "Users can view their own contractor profile"
  ON public.contractor_profiles FOR SELECT
  USING (auth.uid() = org_id);

CREATE POLICY "Users can insert their own contractor profile"
  ON public.contractor_profiles FOR INSERT
  WITH CHECK (auth.uid() = org_id);

CREATE POLICY "Users can update their own contractor profile"
  ON public.contractor_profiles FOR UPDATE
  USING (auth.uid() = org_id);

CREATE POLICY "Users can delete their own contractor profile"
  ON public.contractor_profiles FOR DELETE
  USING (auth.uid() = org_id);

-- Capability Documents
CREATE POLICY "Users can view their own capability documents"
  ON public.capability_documents FOR SELECT
  USING (auth.uid() = org_id);

CREATE POLICY "Users can insert their own capability documents"
  ON public.capability_documents FOR INSERT
  WITH CHECK (auth.uid() = org_id);

CREATE POLICY "Users can update their own capability documents"
  ON public.capability_documents FOR UPDATE
  USING (auth.uid() = org_id);

CREATE POLICY "Users can delete their own capability documents"
  ON public.capability_documents FOR DELETE
  USING (auth.uid() = org_id);

-- Document Versions (cascade from documents)
CREATE POLICY "Users can view document versions"
  ON public.document_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.capability_documents
      WHERE capability_documents.id = document_versions.document_id
      AND capability_documents.org_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage document versions"
  ON public.document_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.capability_documents
      WHERE capability_documents.id = document_versions.document_id
      AND capability_documents.org_id = auth.uid()
    )
  );

-- Document Pages (cascade from versions)
CREATE POLICY "Users can view document pages"
  ON public.document_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.document_versions dv
      JOIN public.capability_documents cd ON cd.id = dv.document_id
      WHERE dv.id = document_pages.document_version_id
      AND cd.org_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage document pages"
  ON public.document_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.document_versions dv
      JOIN public.capability_documents cd ON cd.id = dv.document_id
      WHERE dv.id = document_pages.document_version_id
      AND cd.org_id = auth.uid()
    )
  );

-- Capability Facts
CREATE POLICY "Users can view their own capability facts"
  ON public.capability_facts FOR SELECT
  USING (auth.uid() = org_id);

CREATE POLICY "Users can manage their own capability facts"
  ON public.capability_facts FOR ALL
  USING (auth.uid() = org_id);

-- Past Performance
CREATE POLICY "Users can view their own past performance"
  ON public.past_performance_projects FOR SELECT
  USING (auth.uid() = org_id);

CREATE POLICY "Users can manage their own past performance"
  ON public.past_performance_projects FOR ALL
  USING (auth.uid() = org_id);

-- Key Personnel
CREATE POLICY "Users can view their own key personnel"
  ON public.key_personnel FOR SELECT
  USING (auth.uid() = org_id);

CREATE POLICY "Users can manage their own key personnel"
  ON public.key_personnel FOR ALL
  USING (auth.uid() = org_id);

-- Proposal Library
CREATE POLICY "Users can view their own proposal library"
  ON public.proposal_library_items FOR SELECT
  USING (auth.uid() = org_id);

CREATE POLICY "Users can manage their own proposal library"
  ON public.proposal_library_items FOR ALL
  USING (auth.uid() = org_id);

-- Constraints
CREATE POLICY "Users can view their own constraints"
  ON public.constraints_policies FOR SELECT
  USING (auth.uid() = org_id);

CREATE POLICY "Users can manage their own constraints"
  ON public.constraints_policies FOR ALL
  USING (auth.uid() = org_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE TRIGGER update_contractor_profiles_updated_at
  BEFORE UPDATE ON public.contractor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capability_documents_updated_at
  BEFORE UPDATE ON public.capability_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_past_performance_updated_at
  BEFORE UPDATE ON public.past_performance_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_key_personnel_updated_at
  BEFORE UPDATE ON public.key_personnel
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposal_library_updated_at
  BEFORE UPDATE ON public.proposal_library_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_constraints_policies_updated_at
  BEFORE UPDATE ON public.constraints_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Calculate profile completeness (0-100%)
CREATE OR REPLACE FUNCTION get_contractor_profile_completeness(user_org_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  missing_items JSONB := '[]'::jsonb;
  total_fields INTEGER := 0;
  completed_fields INTEGER := 0;
  completeness_pct INTEGER;
BEGIN
  -- Check contractor profile
  IF NOT EXISTS (SELECT 1 FROM public.contractor_profiles WHERE org_id = user_org_id) THEN
    missing_items := missing_items || jsonb_build_object('section', 'Company & Eligibility', 'item', 'Complete contractor profile');
  ELSE
    -- Check individual fields
    SELECT
      COUNT(*) FILTER (WHERE legal_name IS NOT NULL),
      COUNT(*) FILTER (WHERE uei IS NOT NULL),
      COUNT(*) FILTER (WHERE cage IS NOT NULL),
      COUNT(*) FILTER (WHERE sam_status = 'active'),
      COUNT(*) FILTER (WHERE naics_primary IS NOT NULL),
      COUNT(*) FILTER (WHERE jsonb_array_length(service_areas) > 0)
    INTO completed_fields
    FROM public.contractor_profiles
    WHERE org_id = user_org_id;

    total_fields := total_fields + 6;
  END IF;

  -- Check evidence documents
  IF NOT EXISTS (
    SELECT 1 FROM public.capability_documents
    WHERE org_id = user_org_id
    AND document_type = 'insurance_coi'
    AND status = 'ready'
  ) THEN
    missing_items := missing_items || jsonb_build_object('section', 'Compliance & Risk', 'item', 'Insurance COI upload');
  ELSE
    completed_fields := completed_fields + 1;
  END IF;
  total_fields := total_fields + 1;

  -- Check past performance
  IF NOT EXISTS (SELECT 1 FROM public.past_performance_projects WHERE org_id = user_org_id) THEN
    missing_items := missing_items || jsonb_build_object('section', 'Past Performance', 'item', 'Add at least one past performance project');
  ELSE
    completed_fields := completed_fields + 1;
  END IF;
  total_fields := total_fields + 1;

  -- Calculate percentage
  IF total_fields > 0 THEN
    completeness_pct := ROUND((completed_fields::NUMERIC / total_fields::NUMERIC) * 100);
  ELSE
    completeness_pct := 0;
  END IF;

  -- Build result
  result := json_build_object(
    'percent', completeness_pct,
    'missing', missing_items
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get company knowledge base for AI retrieval
CREATE OR REPLACE FUNCTION get_company_knowledge_base(user_org_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'contractor_profile', (
      SELECT row_to_json(cp.*)
      FROM public.contractor_profiles cp
      WHERE cp.org_id = user_org_id
    ),
    'capability_facts', (
      SELECT json_agg(cf.*)
      FROM public.capability_facts cf
      WHERE cf.org_id = user_org_id
      AND cf.confidence >= 0.7
      ORDER BY cf.created_at DESC
      LIMIT 50
    ),
    'past_performance', (
      SELECT json_agg(pp.*)
      FROM public.past_performance_projects pp
      WHERE pp.org_id = user_org_id
      ORDER BY pp.pop_end DESC NULLS LAST
      LIMIT 5
    ),
    'key_personnel', (
      SELECT json_agg(json_build_object(
        'name', kp.name,
        'role', kp.role,
        'certifications', kp.certifications,
        'clearance_status', kp.clearance_status
      ))
      FROM public.key_personnel kp
      WHERE kp.org_id = user_org_id
    ),
    'proposal_library', (
      SELECT json_agg(pl.*)
      FROM public.proposal_library_items pl
      WHERE pl.org_id = user_org_id
      AND pl.approved = true
    ),
    'constraints', (
      SELECT row_to_json(cp.*)
      FROM public.constraints_policies cp
      WHERE cp.org_id = user_org_id
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_contractor_profile_completeness(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_company_knowledge_base(UUID) TO authenticated;
