// ============================================================================
// GovCon OS Zod Validation Schemas
// ============================================================================

import { z } from 'zod';

// ============================================================================
// Citation Schema (Used across RFP extraction and capability evidence)
// ============================================================================

export const CitationSchema = z.object({
  document_version_id: z.string().uuid(),
  page: z.number().int().positive(),
  start_offset: z.number().int().nonnegative(),
  end_offset: z.number().int().nonnegative(),
  quote: z.string().min(1).max(1000),
});

// ============================================================================
// User & Auth
// ============================================================================

export const UserRoleSchema = z.enum([
  'admin',
  'capture',
  'proposal',
  'technical',
  'pricing',
  'reviewer',
  'readonly',
]);

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8),
  role: UserRoleSchema,
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// ============================================================================
// Capability Evidence Locker
// ============================================================================

export const CapabilityDocTypeSchema = z.enum([
  'past_performance',
  'resume',
  'certification',
  'insurance',
  'capability_statement',
  'cpars',
  'safety_plan',
  'other',
]);

export const CreateCapabilityDocumentSchema = z.object({
  title: z.string().min(1).max(500),
  doc_type: CapabilityDocTypeSchema,
  tags: z.array(z.string()).optional().default([]),
});

export const UploadCapabilityDocVersionSchema = z.object({
  file_name: z.string().min(1).max(500),
  content_type: z.string(),
  size_bytes: z.number().int().positive(),
  file_data: z.string(), // Base64 encoded
});

export const FactTypeSchema = z.enum([
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
  'location',
]);

export const CapabilityFactSchema = z.object({
  fact_type: FactTypeSchema,
  fact_key: z.string().min(1).max(100),
  fact_value: z.string(),
  confidence: z.number().min(0).max(1),
  citation: CitationSchema,
});

export const CapabilityExtractionSchema = z.object({
  document_type: CapabilityDocTypeSchema,
  facts: z.array(CapabilityFactSchema),
});

export const CreateCompanyClaimSchema = z.object({
  claim_text: z.string().min(1),
  claim_type: z.enum(['technical', 'management', 'past_performance', 'compliance']),
  supporting_facts: z.array(z.string().uuid()).optional().default([]),
});

export const UpdateCompanyClaimSchema = z.object({
  claim_text: z.string().min(1).optional(),
  status: z.enum(['draft', 'verified', 'needs_evidence']).optional(),
  supporting_facts: z.array(z.string().uuid()).optional(),
});

// ============================================================================
// Bid/No-Bid Scoring
// ============================================================================

export const HardGateSchema = z.object({
  gate_id: z.string(),
  gate_name: z.string(),
  passed: z.boolean(),
  overridden: z.boolean().default(false),
  override_reason: z.string().nullable(),
  override_by: z.string().uuid().nullable(),
  requirement_citation: CitationSchema.nullable(),
  evidence_citation: z
    .object({
      capability_fact_id: z.string().uuid(),
      fact_value: z.string(),
      source_preview: z.string(),
    })
    .nullable(),
  failure_reason: z.string().nullable(),
});

export const ScoreFactorSchema = z.object({
  factor_id: z.string(),
  factor_name: z.string(),
  score: z.number().min(0).max(100),
  rationale: z.string(),
  requirement_citation: CitationSchema.nullable(),
  evidence_citations: z.array(
    z.object({
      capability_fact_id: z.string().uuid(),
      fact_type: z.string(),
      fact_value: z.string(),
      source_preview: z.string(),
    })
  ),
  gap: z.string().nullable(),
});

export const ScoreCategorySchema = z.object({
  category_id: z.string(),
  category_name: z.string(),
  weight: z.number().min(0).max(1),
  raw_score: z.number().min(0).max(100),
  weighted_score: z.number(),
  factors: z.array(ScoreFactorSchema),
});

export const ScoreBreakdownSchema = z.object({
  categories: z.array(ScoreCategorySchema),
  overall_score: z.number().min(0).max(100),
});

export const RecommendationSchema = z.object({
  recommendation_id: z.string().uuid(),
  type: z.enum([
    'upload_evidence',
    'team_partner',
    'submit_rfi',
    'assign_personnel',
    'request_extension',
    'verify_capability',
  ]),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  title: z.string(),
  description: z.string(),
  impact: z.string(),
  related_requirement_id: z.string().uuid().nullable(),
  related_gate_id: z.string().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed', 'dismissed']),
  assigned_to: z.string().uuid().nullable(),
  due_date: z.string().datetime().nullable(),
});

export const UpdateBidDecisionSchema = z.object({
  decision: z.enum(['pending', 'bid', 'no_bid', 'conditional']).optional(),
  rationale: z.string().optional(),
});

export const OverrideGateSchema = z.object({
  gate_id: z.string(),
  override_reason: z.string().min(1),
});

export const UpdateRecommendationSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'dismissed']).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
});

// ============================================================================
// Audit Events
// ============================================================================

export const CreateAuditEventSchema = z.object({
  event_type: z.string(),
  entity_type: z.string().nullable().optional(),
  entity_id: z.string().uuid().nullable().optional(),
  metadata: z.record(z.any()).optional().default({}),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
});
