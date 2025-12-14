/**
 * ProposalIQ TypeScript Schemas
 * Type definitions for analysis, scorecards, and compliance matrices
 */

export type WorkflowStage =
  | "Intake"
  | "StrategicAssessment"
  | "CompanyAssessment"
  | "BidScorecard"
  | "DecisionDashboard"
  | "ProposalAssembly"
  | "DraftStudio"
  | "OpportunityGateway";

export type EvidenceSource = {
  page?: number | null;
  section?: string;
  text_snippet?: string;
  confidence?: number;
};

export type ComplianceMatrixRow = {
  req_id: string;
  priority: "Must" | "Should" | "May";
  requirement_type: string;
  requirement_statement: string;
  status: string;
  source?: EvidenceSource;
  workflow_stage?: WorkflowStage;
  assigned_to?: string;
  notes?: string;
};

export type ComplianceMatrix = {
  compliance_matrix: {
    metadata: {
      total_requirements: number;
      must_have_count: number;
      should_have_count: number;
      may_have_count: number;
    };
    rows: ComplianceMatrixRow[];
  };
};

export type ScoreCategory = {
  score: number;
  weight: number;
  weighted: number;
  breakdown?: Record<string, unknown>;
};

export type Scorecard = {
  overall_score: number;
  decision: "STRONG_BID" | "CONDITIONAL_BID" | "EVALUATE_FURTHER" | "NO_BID";
  confidence: number;
  category_scores: {
    technical_alignment?: ScoreCategory;
    past_performance?: ScoreCategory;
    competitive_position?: ScoreCategory;
    resource_availability?: ScoreCategory;
    strategic_value?: ScoreCategory;
    pursuit_roi?: ScoreCategory;
  };
  strengths: string[];
  weaknesses: string[];
  hard_stops?: Array<{ type: string; detail: string }>;
};

export type OpportunitySnapshot = {
  solicitation_number?: string;
  title: string;
  agency?: string;
  naics_code?: string;
  set_aside?: {
    type: string;
    percentage?: number;
  };
  contract_type?: string;
  estimated_value?: {
    low?: number;
    high?: number;
  };
  security_requirements?: {
    clearance_level?: string;
  };
  competition_status?: {
    is_recompete: boolean;
    incumbent_name?: string;
  };
};

export type OpportunityAnalysis = {
  extraction_metadata: {
    document_type: "rfp" | "rfi" | "rfq" | "grant" | "sources_sought";
    extraction_confidence: "high" | "medium" | "low";
    extracted_at: string;
  };
  opportunity_snapshot: OpportunitySnapshot;
  key_dates: {
    questions_due?: {
      date: string;
      time?: string;
    };
    proposal_due?: {
      date: string;
      time?: string;
    };
    anticipated_award?: string;
  };
  requirements?: {
    technical_requirements?: Array<{
      description: string;
      priority: "Must" | "Should" | "May";
    }>;
    management_requirements?: Array<{
      description: string;
      priority: "Must" | "Should" | "May";
    }>;
  };
  evaluation_criteria?: {
    evaluation_method?: "LPTA" | "Best_Value" | "Tradeoff";
    factors?: Array<{
      name: string;
      weight?: number;
      description?: string;
    }>;
  };
};

/**
 * Classify a requirement into a workflow stage based on content
 */
export function classifyRequirementToStage(input: {
  requirement_type: string;
  requirement_statement: string;
}): WorkflowStage {
  const t = (input.requirement_type || "").toLowerCase();
  const s = (input.requirement_statement || "").toLowerCase();

  // Submission mechanics, forms, file naming, deadlines
  if (
    t === "submission" ||
    /(submit|due by|no later than|email|portal|file name|page limit|format)/.test(s)
  ) {
    return "Intake";
  }

  // Evaluation factors, method, scoring language
  if (
    /(evaluation factor|best value|lpta|tradeoff|section m|52\.212-2)/.test(s)
  ) {
    return "StrategicAssessment";
  }

  // Requirements that test capabilities, licenses, clearances
  if (
    /(license|certification|clearance|cui|nist|cmmc|iso|insurance|required experience)/.test(
      s
    )
  ) {
    return "CompanyAssessment";
  }

  // Pricing, CLIN, rate, cost
  if (
    t === "pricing" ||
    /(price|clin|rate|labor category|cost realism|pricing sheet)/.test(s)
  ) {
    return "BidScorecard";
  }

  // Decision-level constraints
  if (
    /(mandatory site visit|site visit required|risk|penalty|liquidated damages|incumbent)/.test(
      s
    )
  ) {
    return "DecisionDashboard";
  }

  // Past performance, resumes, attachments
  if (
    t === "pastperformance" ||
    /(past performance|cpars|reference|resume|org chart|attachment)/.test(s)
  ) {
    return "ProposalAssembly";
  }

  // Technical approach, narratives
  if (
    t === "technical" ||
    t === "management" ||
    /(technical approach|management plan|narrative|describe how)/.test(s)
  ) {
    return "DraftStudio";
  }

  // Default
  return "OpportunityGateway";
}

/**
 * Tag matrix rows with workflow stages
 */
export function tagMatrixRows(matrix: ComplianceMatrix): ComplianceMatrixRow[] {
  return matrix.compliance_matrix.rows.map((r) => ({
    ...r,
    workflow_stage: classifyRequirementToStage({
      requirement_type: r.requirement_type,
      requirement_statement: r.requirement_statement,
    }),
  }));
}
