# ProposalIQ Pipeline

Complete extraction, scoring, and compliance analysis system for government RFPs/RFQs/RFIs.

## Overview

This module provides:

1. **Zod Schemas** - Type-safe JSON schemas for all data structures
2. **Prompt Builders** - Structured prompts for LLM extraction
3. **Pipeline** - End-to-end orchestration
4. **Utils** - Scoring consistency and validation

## Quick Start

```typescript
import { runProposalIqPipeline, CompanyProfile, LlmCaller } from "@/lib/proposaliq";

// Your LLM caller (Anthropic, OpenAI, etc.)
const llm: LlmCaller = async ({ model, prompt, temperature }) => {
  const response = await anthropic.messages.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature,
    max_tokens: 4096,
  });
  return response.content[0].text;
};

// Your company profile
const companyProfile: CompanyProfile = {
  company_profile_version: "1.0",
  company: {
    name: "Acme Corp",
    set_asides: ["Small Business", "SDVOSB"],
    naics: ["541512", "541519"],
    capabilities: ["Cloud Migration", "Cybersecurity"],
    // ... more fields
  },
  // ... proof_library, constraints
};

// Run the pipeline
const result = await runProposalIqPipeline({
  llm,
  model: "claude-sonnet-4",
  companyProfile,
  solicitationId: "RFP-2024-001",
  solicitationText: pdfExtractedText,
});

// Access results
console.log("Decision:", result.scorecard.decision.bid_decision);
console.log("Fit Score:", result.scorecard.decision.fit_score_0_100);
console.log("Hard Stops:", result.scorecard.hard_stops_triggered);
console.log("Requirements:", result.complianceMatrix.compliance_matrix.rows.length);

// UI-ready cards
console.log("Header:", result.cards.header);
console.log("Next Actions:", result.cards.nextActions);
```

## Schemas

### OpportunityAnalysis

Complete extraction of solicitation details:

```typescript
{
  opportunity: {
    notice_id, solicitation_number, title, notice_type,
    agency, sub_agency, office,
    place_of_performance, naics, psc, set_aside,
    key_dates, submission, contacts
  },
  eligibility_gate: {
    eligible_to_bid, hard_stops, registrations_required,
    clearance, licenses_certifications
  },
  evaluation: { award_type, factors, price_evaluation, incumbent },
  scope: { summary, deliverables, service_levels, staffing, reporting },
  compliance: { required_volumes, mandatory_forms, required_attachments, site_visit },
  risk_flags: [...],
  win_plan: { win_themes, differentiators, questions_for_co, submission_package_plan },
  source_map: [...]
}
```

### Scorecard

Weighted 0-100 scoring:

```typescript
{
  decision: {
    bid_decision: "BidPrime" | "BidTeam" | "Conditional" | "NoBid" | "NoBidIneligible",
    fit_score_0_100: number,
    confidence_0_100: number,
    one_sentence_rationale: string
  },
  hard_stops_triggered: [...],
  category_scores: [
    { category: "EligibilityFit", weight: 20, score_0_max: 18, reasons: [...] },
    // ... 7 more categories
  ],
  next_actions: [...]
}
```

### ComplianceMatrix

Auto-extracted requirements:

```typescript
{
  compliance_matrix: {
    solicitation_id: string,
    rows: [
      {
        req_id: "R-001",
        source: { page, section, text_snippet },
        requirement_type: "Submission" | "Technical" | ...,
        requirement_statement: string,
        priority: "Must" | "Should" | "May",
        evaluation_link: "Direct" | "Indirect" | "Unknown",
        response_location: { volume, section, page },
        proof_needed: ["Form", "Resume", ...],
        status: "Comply" | "ComplyWithClarification" | ...,
        owner: "AI" | "User" | "ProposalTeam",
        notes: string
      }
    ]
  }
}
```

### CompanyProfile

Your company's capabilities:

```typescript
{
  company: {
    name, uei, cage, set_asides, naics, psc,
    capabilities, tools_platforms, licenses, certifications,
    clearances: { personnel, facility }
  },
  proof_library: {
    past_performance: [...],
    resumes: [...],
    templates: { capability_statement, past_perf_sheet }
  },
  constraints: {
    min_contract_value, max_travel, risk_tolerance, avoid_keywords
  }
}
```

## Prompts

Three system prompts for strict JSON output:

```typescript
import { buildExtractionPrompt, buildScoringPrompt, buildComplianceMatrixPrompt } from "@/lib/proposaliq";

// 1. Extraction
const extractionPrompt = buildExtractionPrompt({
  companyProfileJson: JSON.stringify(profile),
  solicitationText: pdfText,
});

// 2. Scoring
const scoringPrompt = buildScoringPrompt({
  companyProfileJson: JSON.stringify(profile),
  opportunityAnalysisJson: JSON.stringify(analysis),
});

// 3. Compliance Matrix
const matrixPrompt = buildComplianceMatrixPrompt({
  solicitationId: "RFP-2024-001",
  solicitationText: pdfText,
});
```

## Pipeline

End-to-end orchestration:

```typescript
const { opportunityAnalysis, scorecard, complianceMatrix, cards } = await runProposalIqPipeline({
  llm,
  model: "claude-sonnet-4",
  companyProfile,
  solicitationId,
  solicitationText,
});
```

**Pipeline Steps:**

1. Validates company profile
2. Extracts opportunity analysis
3. Scores bid/no-bid decision
4. Generates compliance matrix
5. Builds UI-ready cards

## Utils

### enforceScorecardConsistency

Prevents nonsense scores:

```typescript
import { enforceScorecardConsistency } from "@/lib/proposaliq";

const cleaned = enforceScorecardConsistency(scorecard);
// - Sums category scores correctly
// - Forces NoBidIneligible if hard stops
// - Clamps confidence when hard stops present
// - Ensures fit_score is 0-100
```

## Database Storage

Store results in Supabase as JSONB:

```sql
ALTER TABLE analyses ADD COLUMN opportunity_analysis JSONB;
ALTER TABLE analyses ADD COLUMN scorecard JSONB;
ALTER TABLE analyses ADD COLUMN compliance_matrix JSONB;

-- Index for queries
CREATE INDEX idx_analyses_decision ON analyses ((scorecard->'decision'->>'bid_decision'));
CREATE INDEX idx_analyses_fit_score ON analyses ((scorecard->'decision'->>'fit_score_0_100'));
```

## UI Cards

Pre-built summary for dashboards:

```typescript
const { cards } = result;

// Header card
cards.header.title;
cards.header.solicitation_number;
cards.header.decision; // "BidPrime"
cards.header.fit_score; // 82

// Hard stops
cards.hardStops; // [{ type: "Clearance", detail: "Secret required" }]

// Top risks
cards.topRisks; // Top 5 risk flags

// Compliance summary
cards.complianceSummary.must_count; // 23
cards.complianceSummary.top_must_items; // First 10 Must requirements
```

## Error Handling

```typescript
try {
  const result = await runProposalIqPipeline({ ... });
} catch (error) {
  if (error.message.includes("Schema validation failed")) {
    // LLM returned invalid JSON
    console.error("AI output validation error:", error);
  } else if (error.message.includes("not JSON")) {
    // LLM returned non-JSON text
    console.error("AI did not return JSON:", error);
  } else {
    // Other errors (network, etc.)
    throw error;
  }
}
```

## Testing

```typescript
import { OpportunityAnalysisSchema, ScorecardSchema, ComplianceMatrixSchema } from "@/lib/proposaliq";

// Validate AI output
const parsed = OpportunityAnalysisSchema.safeParse(llmOutput);
if (!parsed.success) {
  console.error("Validation errors:", parsed.error.errors);
}
```

## Integration Checklist

- [ ] Create company profile in DB
- [ ] Extract PDF text (use pdf-parse or similar)
- [ ] Call `runProposalIqPipeline`
- [ ] Store results as JSONB in Supabase
- [ ] Display `cards` in dashboard
- [ ] Show full compliance matrix in detail view
- [ ] Add source_map citations for trust
- [ ] Export compliance matrix to Excel

## Next Steps

1. Add PDF extraction endpoint
2. Create `/api/analyze` that calls this pipeline
3. Build UI components for each card type
4. Add Excel export for compliance matrix
5. Implement scoring adjustments UI
