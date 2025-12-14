// ============================================================================
// GovCon OS Shared Types
// ============================================================================

export type UUID = string;
export type Timestamp = Date | string;

// ============================================================================
// User Roles (RBAC)
// ============================================================================
export enum UserRole {
  ADMIN = 'admin',
  CAPTURE_MANAGER = 'capture',
  PROPOSAL_MANAGER = 'proposal',
  TECHNICAL_WRITER = 'technical',
  PRICING_ANALYST = 'pricing',
  REVIEWER = 'reviewer',
  READONLY = 'readonly',
}

// ============================================================================
// Core Entities
// ============================================================================

export interface Organization {
  id: UUID;
  name: string;
  slug: string;
  settings: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface User {
  id: UUID;
  organization_id: UUID;
  email: string;
  name: string;
  password_hash: string;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface UserRoleAssignment {
  id: UUID;
  organization_id: UUID;
  user_id: UUID;
  role: UserRole;
  created_at: Timestamp;
}

export interface AuditEvent {
  id: UUID;
  organization_id: UUID;
  user_id: UUID | null;
  event_type: string;
  entity_type: string | null;
  entity_id: UUID | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Timestamp;
}

// ============================================================================
// Capability Evidence Locker (Addendum A)
// ============================================================================

export type CapabilityDocType =
  | 'past_performance'
  | 'resume'
  | 'certification'
  | 'insurance'
  | 'capability_statement'
  | 'cpars'
  | 'safety_plan'
  | 'other';

export interface CapabilityDocument {
  id: UUID;
  organization_id: UUID;
  title: string;
  doc_type: CapabilityDocType;
  tags: string[];
  created_by: UUID;
  created_at: Timestamp;
}

export interface CapabilityDocumentVersion {
  id: UUID;
  organization_id: UUID;
  capability_document_id: UUID;
  version: number;
  file_name: string;
  content_type: string;
  size_bytes: number;
  sha256: string;
  storage_key: string;
  raw_text: string | null;
  uploaded_by: UUID;
  created_at: Timestamp;
}

export type FactType =
  | 'clearance'
  | 'certification'
  | 'naics'
  | 'psc'
  | 'set_aside'
  | 'bonding'
  | 'insurance'
  | 'labor_category'
  | 'past_performance'
  | 'key_personnel'
  | 'equipment'
  | 'location';

export interface Citation {
  document_version_id: UUID;
  page: number;
  start_offset: number;
  end_offset: number;
  quote: string;
}

export interface CapabilityFact {
  id: UUID;
  organization_id: UUID;
  capability_document_version_id: UUID;
  fact_type: FactType;
  fact_key: string;
  fact_value: string;
  confidence: number; // 0.00-1.00
  citation: Citation;
  verified_by: UUID | null;
  verified_at: Timestamp | null;
  created_at: Timestamp;
}

export type ClaimType = 'technical' | 'management' | 'past_performance' | 'compliance';
export type ClaimStatus = 'draft' | 'verified' | 'needs_evidence';

export interface CompanyClaim {
  id: UUID;
  organization_id: UUID;
  claim_text: string;
  claim_type: ClaimType;
  supporting_facts: UUID[]; // Array of capability_fact_ids
  status: ClaimStatus;
  created_by: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ============================================================================
// Bid/No-Bid Scoring (Addendum A)
// ============================================================================

export type BidDecision = 'pending' | 'bid' | 'no_bid' | 'conditional';

export interface HardGate {
  gate_id: string;
  gate_name: string;
  passed: boolean;
  overridden: boolean;
  override_reason: string | null;
  override_by: UUID | null;
  requirement_citation: Citation | null;
  evidence_citation: {
    capability_fact_id: UUID;
    fact_value: string;
    source_preview: string;
  } | null;
  failure_reason: string | null;
}

export interface ScoreFactor {
  factor_id: string;
  factor_name: string;
  score: number; // 0-100
  rationale: string;
  requirement_citation: Citation | null;
  evidence_citations: Array<{
    capability_fact_id: UUID;
    fact_type: string;
    fact_value: string;
    source_preview: string;
  }>;
  gap: string | null;
}

export interface ScoreCategory {
  category_id: string;
  category_name: string;
  weight: number; // 0-1, sum to 1.0
  raw_score: number; // 0-100
  weighted_score: number;
  factors: ScoreFactor[];
}

export interface ScoreBreakdown {
  categories: ScoreCategory[];
  overall_score: number; // 0-100
}

export interface GateStatus {
  passed: string[];
  failed: string[];
  overridden: string[];
}

export type RecommendationType =
  | 'upload_evidence'
  | 'team_partner'
  | 'submit_rfi'
  | 'assign_personnel'
  | 'request_extension'
  | 'verify_capability';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
export type RecommendationStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed';

export interface Recommendation {
  recommendation_id: UUID;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  impact: string;
  related_requirement_id: UUID | null;
  related_gate_id: string | null;
  status: RecommendationStatus;
  assigned_to: UUID | null;
  due_date: Timestamp | null;
}

export interface BidDecisionRecord {
  id: UUID;
  organization_id: UUID;
  opportunity_id: UUID;
  decision: BidDecision;
  overall_score: number;
  gate_status: GateStatus;
  score_breakdown: ScoreBreakdown;
  recommendations: Recommendation[];
  rationale: string | null;
  decided_by: UUID | null;
  decided_at: Timestamp | null;
  requires_approval: boolean;
  approved_by: UUID | null;
  approved_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type MatchType = 'exact' | 'partial' | 'related';

export interface RequirementEvidenceLink {
  id: UUID;
  organization_id: UUID;
  requirement_id: UUID;
  capability_fact_id: UUID;
  match_type: MatchType;
  match_confidence: number; // 0.00-1.00
  verified_by: UUID | null;
  verified_at: Timestamp | null;
  created_at: Timestamp;
}

// ============================================================================
// Default Hard Gates & Score Categories
// ============================================================================

export const DEFAULT_HARD_GATES = [
  { id: 'clearance', name: 'Facility Clearance Required' },
  { id: 'bonding', name: 'Bonding Capacity Sufficient' },
  { id: 'set_aside', name: 'Set-Aside Eligibility' },
  { id: 'mandatory_cert', name: 'Mandatory Certifications' },
  { id: 'timeline_feasible', name: 'Timeline Feasibility' },
  { id: 'geographic_coverage', name: 'Geographic Coverage' },
] as const;

export const DEFAULT_SCORE_CATEGORIES = [
  { id: 'technical_fit', name: 'Technical Fit', weight: 0.25 },
  { id: 'past_performance', name: 'Past Performance Relevance', weight: 0.25 },
  { id: 'compliance_readiness', name: 'Compliance Readiness', weight: 0.20 },
  { id: 'capacity', name: 'Capacity & Staffing', weight: 0.15 },
  { id: 'pricing_risk', name: 'Pricing & Margin Risk', weight: 0.15 },
] as const;
