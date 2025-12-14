-- ============================================================================
-- GovCon OS - Initial Schema Migration
-- Foundation Tables + Addendum A (Capability Evidence & Bid/No-Bid)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- Foundation: Organizations & Users
-- ============================================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

CREATE INDEX idx_users_org_email ON users(organization_id, email);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- RBAC: User Roles
-- ============================================================================

CREATE TYPE user_role AS ENUM (
  'admin',
  'capture',
  'proposal',
  'technical',
  'pricing',
  'reviewer',
  'readonly'
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id, role)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_org ON user_roles(organization_id);

-- ============================================================================
-- Audit Events
-- ============================================================================

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_events_org ON audit_events(organization_id);
CREATE INDEX idx_audit_events_user ON audit_events(user_id);
CREATE INDEX idx_audit_events_type ON audit_events(event_type);
CREATE INDEX idx_audit_events_entity ON audit_events(entity_type, entity_id);
CREATE INDEX idx_audit_events_created ON audit_events(created_at DESC);

-- ============================================================================
-- Addendum A: Capability Evidence Locker
-- ============================================================================

CREATE TYPE capability_doc_type AS ENUM (
  'past_performance',
  'resume',
  'certification',
  'insurance',
  'capability_statement',
  'cpars',
  'safety_plan',
  'other'
);

CREATE TABLE capability_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  doc_type capability_doc_type NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_capability_docs_org ON capability_documents(organization_id);
CREATE INDEX idx_capability_docs_type ON capability_documents(doc_type);
CREATE INDEX idx_capability_docs_tags ON capability_documents USING gin(tags);

CREATE TABLE capability_document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  capability_document_id UUID NOT NULL REFERENCES capability_documents(id) ON DELETE CASCADE,
  version INT NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  sha256 VARCHAR(64) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  raw_text TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(capability_document_id, version)
);

CREATE INDEX idx_capability_doc_versions_doc ON capability_document_versions(capability_document_id);
CREATE INDEX idx_capability_doc_versions_org ON capability_document_versions(organization_id);

CREATE TYPE fact_type AS ENUM (
  'clearance',
  'certification',
  'naics',
  'psc',
  'set_aside',
  'bonding',
  'insurance',
  'labor_category',
  'past_performance',
  'key_personnel',
  'equipment',
  'location'
);

CREATE TABLE capability_facts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  capability_document_version_id UUID NOT NULL REFERENCES capability_document_versions(id) ON DELETE CASCADE,
  fact_type fact_type NOT NULL,
  fact_key VARCHAR(100) NOT NULL,
  fact_value TEXT NOT NULL,
  confidence NUMERIC(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  citation JSONB NOT NULL,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_capability_facts_org ON capability_facts(organization_id);
CREATE INDEX idx_capability_facts_doc_version ON capability_facts(capability_document_version_id);
CREATE INDEX idx_capability_facts_type_key ON capability_facts(organization_id, fact_type, fact_key);
CREATE INDEX idx_capability_facts_type ON capability_facts(fact_type);

CREATE TYPE claim_type AS ENUM ('technical', 'management', 'past_performance', 'compliance');
CREATE TYPE claim_status AS ENUM ('draft', 'verified', 'needs_evidence');

CREATE TABLE company_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  claim_text TEXT NOT NULL,
  claim_type claim_type NOT NULL,
  supporting_facts JSONB DEFAULT '[]'::jsonb,
  status claim_status DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_claims_org ON company_claims(organization_id);
CREATE INDEX idx_company_claims_type ON company_claims(claim_type);
CREATE INDEX idx_company_claims_status ON company_claims(status);

-- ============================================================================
-- Addendum A: Bid/No-Bid Scoring
-- ============================================================================

-- Note: This references opportunity_id which will be created in Sprint 2
-- For now, we'll create the table structure with a placeholder

CREATE TYPE bid_decision_status AS ENUM ('pending', 'bid', 'no_bid', 'conditional');

CREATE TABLE bid_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL, -- FK will be added in Sprint 2
  decision bid_decision_status DEFAULT 'pending',
  overall_score NUMERIC(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
  gate_status JSONB DEFAULT '{}'::jsonb,
  score_breakdown JSONB DEFAULT '{}'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  rationale TEXT,
  decided_by UUID REFERENCES users(id),
  decided_at TIMESTAMPTZ,
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bid_decisions_org ON bid_decisions(organization_id);
CREATE INDEX idx_bid_decisions_opportunity ON bid_decisions(opportunity_id);
CREATE INDEX idx_bid_decisions_status ON bid_decisions(decision);

CREATE TYPE match_type AS ENUM ('exact', 'partial', 'related');

CREATE TABLE requirement_evidence_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL, -- FK will be added in Sprint 4 (extraction)
  capability_fact_id UUID NOT NULL REFERENCES capability_facts(id) ON DELETE CASCADE,
  match_type match_type NOT NULL,
  match_confidence NUMERIC(3,2) CHECK (match_confidence >= 0 AND match_confidence <= 1),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requirement_id, capability_fact_id)
);

CREATE INDEX idx_requirement_evidence_org ON requirement_evidence_links(organization_id);
CREATE INDEX idx_requirement_evidence_req ON requirement_evidence_links(requirement_id);
CREATE INDEX idx_requirement_evidence_fact ON requirement_evidence_links(capability_fact_id);

-- ============================================================================
-- Triggers for updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_claims_updated_at BEFORE UPDATE ON company_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bid_decisions_updated_at BEFORE UPDATE ON bid_decisions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) - Tenancy Isolation
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirement_evidence_links ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies will be added in Sprint 1 along with auth implementation
-- For now, create a bypass for migrations and seeds

-- ============================================================================
-- Completion
-- ============================================================================

COMMENT ON SCHEMA public IS 'GovCon OS - Sprint 1 Initial Schema (Foundation + Addendum A)';
