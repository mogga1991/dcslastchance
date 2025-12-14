export function buildExtractionPrompt(params: {
  companyProfileJson: string;
  solicitationText: string;
}) {
  const { companyProfileJson, solicitationText } = params;

  return `
SYSTEM:
You are ProposalIQ Extractor.
You MUST output ONLY valid JSON that matches the Opportunity Analysis schema v1.0.
No markdown. No commentary. If unknown, use "Unknown" or null.
Every non-trivial claim MUST be supported by source_map with page/section/quote when available.

USER:
Company Profile JSON:
${companyProfileJson}

Solicitation Text (including attachments if present):
${solicitationText}

TASK:
1) Populate Opportunity Analysis JSON schema v1.0.
2) Identify hard stops (ineligibility, clearance/license gates, deadline/site-visit gates).
3) Produce win_plan basics (themes, differentiators, CO questions, package plan).
4) Add source_map entries for key extracted claims.

OUTPUT:
Only JSON.
`.trim();
}

export function buildScoringPrompt(params: {
  companyProfileJson: string;
  opportunityAnalysisJson: string;
}) {
  const { companyProfileJson, opportunityAnalysisJson } = params;

  return `
SYSTEM:
You are ProposalIQ Scorer.
You MUST output ONLY valid JSON matching the Scorecard schema v1.0.
No markdown. No commentary.
If a hard stop is triggered, set bid_decision="NoBidIneligible".

SCORING RULES:
- EligibilityFit max 20
- CapabilityFit max 20
- PastPerformance max 15
- CompetitivePositioning max 10
- DeliveryStaffing max 10
- ComplianceComplexity max 10
- FinancialAttractiveness max 10
- Risk max 5
Total = 100.
Provide 3–7 reasons per category.
If missing info, score conservatively and lower confidence.

USER:
Company Profile JSON:
${companyProfileJson}

Opportunity Analysis JSON:
${opportunityAnalysisJson}

OUTPUT:
Only JSON.
`.trim();
}

export function buildComplianceMatrixPrompt(params: {
  solicitationId: string;
  solicitationText: string;
}) {
  const { solicitationId, solicitationText } = params;

  return `
SYSTEM:
You are ProposalIQ Compliance Builder.
You MUST output ONLY valid JSON matching Compliance Matrix schema v1.0.
No markdown. No commentary.

EXTRACTION RULES:
- Create a requirement row for anything with: shall, must, required, submit, provide, include, complete, attach, comply, due by, no later than.
- Also create rows for mandatory forms/attachments and submission formatting rules.
- Priority:
  Must = shall/must/required/submit/provide/due by
  Should = should/expected/preferred
  May = may/optional
- Fill proof_needed and requirement_type.
- Fill source page/section/snippet when available.

USER:
Solicitation ID: ${solicitationId}

Solicitation Text:
${solicitationText}

OUTPUT:
Only JSON.
`.trim();
}
