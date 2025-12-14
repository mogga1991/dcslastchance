import type { SAMOpportunity } from "@/lib/sam-gov";

export type OpportunityStatus =
  | "saved"
  | "reviewing"
  | "pursuing"
  | "submitted"
  | "won"
  | "lost"
  | "no_bid";

export type BidDecision = "pending" | "bid" | "no_bid";

export type QualificationStatus = "pending" | "qualified" | "not_qualified" | "partial";

export interface SavedOpportunity {
  id: string;
  user_id: string;
  notice_id: string;
  opportunity_data: SAMOpportunity;
  status: OpportunityStatus;
  notes: string | null;
  bid_decision: BidDecision | null;
  bid_decision_reasoning: string | null;
  qualification_status: QualificationStatus | null;
  qualification_notes: string | null;
  saved_at: string;
  updated_at: string;
}

export interface CreateSavedOpportunityInput {
  notice_id: string;
  opportunity_data: SAMOpportunity;
  notes?: string;
}

export interface UpdateSavedOpportunityInput {
  status?: OpportunityStatus;
  notes?: string;
  bid_decision?: BidDecision;
  bid_decision_reasoning?: string;
  qualification_status?: QualificationStatus;
  qualification_notes?: string;
}
