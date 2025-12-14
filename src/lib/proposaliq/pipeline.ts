import { z } from "zod";
import {
  CompanyProfile,
  CompanyProfileSchema,
  OpportunityAnalysis,
  OpportunityAnalysisSchema,
  Scorecard,
  ScorecardSchema,
  ComplianceMatrix,
  ComplianceMatrixSchema,
} from "./schemas";
import {
  buildExtractionPrompt,
  buildScoringPrompt,
  buildComplianceMatrixPrompt,
} from "./prompts";

export type LlmCaller = (args: {
  model: string;
  prompt: string;
  temperature?: number;
}) => Promise<string>;

function safeJsonParse<T>(raw: string, schema: z.ZodType<T>): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    // Attempt minimal cleanup if model returned stray text
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      parsed = JSON.parse(raw.slice(start, end + 1));
    } else {
      throw new Error(`LLM output is not JSON. First 200 chars:\n${raw.slice(0, 200)}`);
    }
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Schema validation failed: ${result.error.message}`);
  }
  return result.data;
}

export async function runProposalIqPipeline(params: {
  llm: LlmCaller;
  model: string;
  companyProfile: CompanyProfile;
  solicitationId: string;
  solicitationText: string; // include extracted PDF + attachments text
}) {
  const { llm, model, companyProfile, solicitationId, solicitationText } = params;

  // Validate profile early
  const profile = CompanyProfileSchema.parse(companyProfile);

  // 1) Extract
  const extractionPrompt = buildExtractionPrompt({
    companyProfileJson: JSON.stringify(profile),
    solicitationText,
  });

  const extractionRaw = await llm({ model, prompt: extractionPrompt, temperature: 0.1 });
  const opportunityAnalysis: OpportunityAnalysis = safeJsonParse(extractionRaw, OpportunityAnalysisSchema);

  // 2) Score
  const scoringPrompt = buildScoringPrompt({
    companyProfileJson: JSON.stringify(profile),
    opportunityAnalysisJson: JSON.stringify(opportunityAnalysis),
  });

  const scoringRaw = await llm({ model, prompt: scoringPrompt, temperature: 0.1 });
  const scorecard: Scorecard = safeJsonParse(scoringRaw, ScorecardSchema);

  // 3) Compliance matrix
  const matrixPrompt = buildComplianceMatrixPrompt({ solicitationId, solicitationText });
  const matrixRaw = await llm({ model, prompt: matrixPrompt, temperature: 0.1 });
  const complianceMatrix: ComplianceMatrix = safeJsonParse(matrixRaw, ComplianceMatrixSchema);

  // 4) Render-friendly "cards" (UI-ready)
  const cards = buildUiCards(opportunityAnalysis, scorecard, complianceMatrix);

  return { opportunityAnalysis, scorecard, complianceMatrix, cards };
}

export function buildUiCards(
  analysis: OpportunityAnalysis,
  scorecard: Scorecard,
  matrix: ComplianceMatrix
) {
  // Minimal, useful cards. Expand freely in your app.
  return {
    header: {
      title: analysis.opportunity.title,
      solicitation_number: analysis.opportunity.solicitation_number || analysis.opportunity.notice_id,
      agency: analysis.opportunity.agency,
      due: analysis.opportunity.key_dates.proposal_due,
      set_aside: analysis.opportunity.set_aside.type,
      decision: scorecard.decision.bid_decision,
      fit_score: scorecard.decision.fit_score_0_100,
      confidence: scorecard.decision.confidence_0_100,
    },
    hardStops: scorecard.hard_stops_triggered,
    topRisks: analysis.risk_flags.slice(0, 5),
    evaluation: analysis.evaluation,
    nextActions: scorecard.next_actions,
    complianceSummary: {
      must_count: matrix.compliance_matrix.rows.filter(r => r.priority === "Must").length,
      should_count: matrix.compliance_matrix.rows.filter(r => r.priority === "Should").length,
      may_count: matrix.compliance_matrix.rows.filter(r => r.priority === "May").length,
      top_must_items: matrix.compliance_matrix.rows
        .filter(r => r.priority === "Must")
        .slice(0, 10)
        .map(r => ({ req_id: r.req_id, type: r.requirement_type, text: r.requirement_statement })),
    },
  };
}
