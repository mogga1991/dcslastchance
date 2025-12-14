import { z } from "zod";

/** =========================
 *  Shared / enums
 *  ========================= */

export const YesNoUnknown = z.enum(["Yes", "No", "Unknown"]);
export type YesNoUnknown = z.infer<typeof YesNoUnknown>;

export const Severity = z.enum(["Low", "Medium", "High"]);
export type Severity = z.infer<typeof Severity>;

export const NoticeType = z.enum(["RFP", "RFQ", "RFI", "Grant", "Other"]);
export type NoticeType = z.infer<typeof NoticeType>;

export const AwardType = z.enum(["LPTA", "BestValue", "Tradeoff", "Unknown"]);
export type AwardType = z.infer<typeof AwardType>;

export const SetAsideType = z.enum([
  "Small Business",
  "WOSB",
  "EDWOSB",
  "SDVOSB",
  "8(a)",
  "HUBZone",
  "Unrestricted",
  "Other",
  "Unknown",
]);
export type SetAsideType = z.infer<typeof SetAsideType>;

export const RoleType = z.enum(["CO", "CS", "COR", "Other", "Unknown"]);
export type RoleType = z.infer<typeof RoleType>;

export const SourceType = z.enum(["PDF", "Attachment", "SAM"]);
export type SourceType = z.infer<typeof SourceType>;

/** =========================
 *  Opportunity Analysis Schema (Checklist output)
 *  ========================= */

export const OpportunityAnalysisSchema = z.object({
  schema_version: z.literal("1.0"),

  opportunity: z.object({
    notice_id: z.string().default(""),
    solicitation_number: z.string().default(""),
    title: z.string().default(""),
    notice_type: NoticeType,

    agency: z.string().default(""),
    sub_agency: z.string().default(""),
    office: z.string().default(""),

    place_of_performance: z.object({
      locations: z.array(z.string()).default([]),
      remote_allowed: YesNoUnknown,
    }),

    naics: z.array(z.string()).default([]),
    psc: z.array(z.string()).default([]),

    set_aside: z.object({
      type: SetAsideType,
      size_standard: z.string().default(""),
      eligibility_notes: z.string().default(""),
    }),

    key_dates: z.object({
      posted_date: z.string().default(""),
      questions_due: z.string().default(""),
      proposal_due: z.string().default(""),
      proposal_due_timezone: z.string().default(""),
      period_of_performance: z.object({
        base_start: z.string().default(""),
        base_end: z.string().default(""),
        options: z.array(z.string()).default([]),
      }),
    }),

    submission: z.object({
      method: z.enum(["Email", "Portal", "SAM", "Other", "Unknown"]),
      destination: z.string().default(""),
      file_rules: z.object({
        allowed_formats: z.array(z.string()).default([]),
        max_file_size_mb: z.number().nullable().default(null),
        naming_rules: z.string().default(""),
        page_limits: z.string().default(""),
        font_margin_rules: z.string().default(""),
      }),
    }),

    contacts: z
      .array(
        z.object({
          name: z.string().default(""),
          role: RoleType,
          email: z.string().default(""),
          phone: z.string().default(""),
        })
      )
      .default([]),
  }),

  eligibility_gate: z.object({
    eligible_to_bid: YesNoUnknown,
    hard_stops: z
      .array(
        z.object({
          type: z.enum(["SetAside", "Clearance", "License", "Deadline", "SiteVisit", "Other"]),
          detail: z.string(),
        })
      )
      .default([]),

    registrations_required: z
      .array(
        z.object({
          name: z.enum(["SAM", "UEI", "CAGE", "WAWF", "Other"]),
          status: z.enum(["Required", "NotRequired", "Unknown"]),
          notes: z.string().default(""),
        })
      )
      .default([]),

    clearance: z.object({
      personnel_clearance_required: YesNoUnknown,
      personnel_clearance_level: z.string().default(""),
      facility_clearance_required: YesNoUnknown,
      facility_clearance_level: z.string().default(""),
    }),

    licenses_certifications: z
      .array(
        z.object({
          name: z.string(),
          required: YesNoUnknown,
          details: z.string().default(""),
          proof_needed: z.string().default(""),
        })
      )
      .default([]),
  }),

  evaluation: z.object({
    award_type: AwardType,
    factors: z
      .array(
        z.object({
          name: z.string(),
          importance: z.enum(["High", "Medium", "Low", "Unknown"]),
          weight_percent: z.number().nullable().default(null),
          notes: z.string().default(""),
          pass_fail: YesNoUnknown,
        })
      )
      .default([]),
    price_evaluation: z.object({
      method: z.enum(["TotalEvaluatedPrice", "UnitRates", "CostRealism", "Other", "Unknown"]),
      notes: z.string().default(""),
    }),
    incumbent: z.object({
      present: YesNoUnknown,
      name: z.string().default(""),
      notes: z.string().default(""),
    }),
  }),

  scope: z.object({
    summary_2_sentences: z.string().default(""),
    deliverables: z
      .array(
        z.object({
          deliverable: z.string(),
          frequency: z.string().default(""),
          acceptance: z.string().default(""),
        })
      )
      .default([]),
    service_levels: z
      .array(
        z.object({
          metric: z.string(),
          target: z.string().default(""),
          measurement: z.string().default(""),
        })
      )
      .default([]),
    staffing: z.object({
      roles: z
        .array(
          z.object({
            role: z.string(),
            qty: z.number().nullable().default(null),
            onsite: YesNoUnknown,
            notes: z.string().default(""),
          })
        )
        .default([]),
      labor_categories: z.array(z.string()).default([]),
    }),
    reporting: z
      .array(
        z.object({
          type: z.string(),
          frequency: z.string().default(""),
          format: z.string().default(""),
        })
      )
      .default([]),
  }),

  compliance: z.object({
    required_volumes: z
      .array(
        z.object({
          volume: z.string(),
          requirements: z.array(z.string()).default([]),
        })
      )
      .default([]),
    mandatory_forms: z
      .array(
        z.object({
          name: z.string(),
          where: z.string().default(""),
          notes: z.string().default(""),
        })
      )
      .default([]),
    required_attachments: z
      .array(
        z.object({
          name: z.string(),
          purpose: z.string().default(""),
          provided: YesNoUnknown,
        })
      )
      .default([]),
    site_visit: z.object({
      required: YesNoUnknown,
      date: z.string().default(""),
      notes: z.string().default(""),
    }),
  }),

  risk_flags: z
    .array(
      z.object({
        risk: z.string(),
        severity: Severity,
        why: z.string().default(""),
        mitigation: z.string().default(""),
      })
    )
    .default([]),

  win_plan: z.object({
    win_themes: z.array(z.string()).default([]),
    differentiators: z.array(z.string()).default([]),
    questions_for_co: z.array(z.string()).default([]),
    submission_package_plan: z
      .array(
        z.object({
          file_name: z.string(),
          contents: z.array(z.string()).default([]),
        })
      )
      .default([]),
  }),

  source_map: z
    .array(
      z.object({
        claim: z.string(),
        source_type: SourceType,
        location: z.object({
          page: z.number().nullable().default(null),
          section: z.string().default(""),
          quote: z.string().default(""),
        }),
      })
    )
    .default([]),
});

export type OpportunityAnalysis = z.infer<typeof OpportunityAnalysisSchema>;

/** =========================
 *  Scorecard Schema
 *  ========================= */

export const ScoreDecision = z.enum([
  "BidPrime",
  "BidTeam",
  "Conditional",
  "NoBid",
  "NoBidIneligible",
]);
export type ScoreDecision = z.infer<typeof ScoreDecision>;

export const ScoreCategory = z.enum([
  "EligibilityFit",
  "CapabilityFit",
  "PastPerformance",
  "CompetitivePositioning",
  "DeliveryStaffing",
  "ComplianceComplexity",
  "FinancialAttractiveness",
  "Risk",
]);
export type ScoreCategory = z.infer<typeof ScoreCategory>;

export const ScorecardSchema = z.object({
  schema_version: z.literal("1.0"),
  decision: z.object({
    bid_decision: ScoreDecision,
    fit_score_0_100: z.number().min(0).max(100),
    confidence_0_100: z.number().min(0).max(100),
    one_sentence_rationale: z.string(),
  }),
  hard_stops_triggered: z
    .array(
      z.object({
        type: z.enum(["SetAside", "Clearance", "License", "Deadline", "SiteVisit", "Other"]),
        detail: z.string(),
      })
    )
    .default([]),
  category_scores: z
    .array(
      z.object({
        category: ScoreCategory,
        weight: z.number(),
        score_0_max: z.number(),
        max: z.number(),
        reasons: z.array(z.string()).default([]),
        evidence: z
          .array(
            z.object({
              page: z.number().nullable().default(null),
              section: z.string().default(""),
              quote: z.string().default(""),
            })
          )
          .default([]),
      })
    )
    .default([]),
  next_actions: z
    .array(
      z.object({
        action: z.enum([
          "SubmitQuestions",
          "FindPartner",
          "PriceModel",
          "StartComplianceMatrix",
          "DraftOutline",
          "Skip",
        ]),
        detail: z.string().default(""),
      })
    )
    .default([]),
});

export type Scorecard = z.infer<typeof ScorecardSchema>;

/** =========================
 *  Compliance Matrix Schema
 *  ========================= */

export const RequirementType = z.enum([
  "Submission",
  "Technical",
  "Management",
  "PastPerformance",
  "Pricing",
  "Legal",
  "Other",
]);
export type RequirementType = z.infer<typeof RequirementType>;

export const Priority = z.enum(["Must", "Should", "May"]);
export type Priority = z.infer<typeof Priority>;

export const EvaluationLink = z.enum(["Direct", "Indirect", "Unknown"]);
export type EvaluationLink = z.infer<typeof EvaluationLink>;

export const ProofNeeded = z.enum([
  "Form",
  "Resume",
  "Process",
  "Certificate",
  "PastPerformance",
  "PriceSheet",
  "Other",
]);
export type ProofNeeded = z.infer<typeof ProofNeeded>;

export const ComplianceStatus = z.enum([
  "Comply",
  "ComplyWithClarification",
  "ExceptionRequested",
  "Unknown",
]);
export type ComplianceStatus = z.infer<typeof ComplianceStatus>;

export const ComplianceMatrixSchema = z.object({
  schema_version: z.literal("1.0"),
  compliance_matrix: z.object({
    solicitation_id: z.string().default(""),
    rows: z
      .array(
        z.object({
          req_id: z.string(),
          source: z.object({
            page: z.number().nullable().default(null),
            section: z.string().default(""),
            text_snippet: z.string().default(""),
          }),
          requirement_type: RequirementType,
          requirement_statement: z.string(),
          priority: Priority,
          evaluation_link: EvaluationLink,
          response_location: z.object({
            volume: z.string().default(""),
            section: z.string().default(""),
            page: z.number().nullable().default(null),
          }),
          proof_needed: z.array(ProofNeeded).default([]),
          status: ComplianceStatus,
          owner: z.enum(["AI", "User", "ProposalTeam"]).default("AI"),
          notes: z.string().default(""),
        })
      )
      .default([]),
  }),
});

export type ComplianceMatrix = z.infer<typeof ComplianceMatrixSchema>;

/** =========================
 *  Company Profile (minimal "knows you" schema)
 *  ========================= */

export const CompanyProfileSchema = z.object({
  company_profile_version: z.literal("1.0"),
  company: z.object({
    name: z.string(),
    uei: z.string().optional().default(""),
    cage: z.string().optional().default(""),
    set_asides: z.array(z.string()).default([]),
    naics: z.array(z.string()).default([]),
    psc: z.array(z.string()).default([]),
    states_served: z.array(z.string()).default([]),
    capabilities: z.array(z.string()).default([]),
    tools_platforms: z.array(z.string()).default([]),
    licenses: z.array(z.string()).default([]),
    certifications: z.array(z.string()).default([]),
    clearances: z
      .object({
        personnel: z.string().default(""),
        facility: z.string().default(""),
      })
      .default({ personnel: "", facility: "" }),
  }),
  proof_library: z.object({
    past_performance: z
      .array(
        z.object({
          name: z.string(),
          keywords: z.array(z.string()).default([]),
          results: z.array(z.string()).default([]),
          customer_type: z.string().default(""),
          period: z.string().default(""),
        })
      )
      .default([]),
    resumes: z
      .array(
        z.object({
          name: z.string(),
          role: z.string().default(""),
          skills: z.array(z.string()).default([]),
          years: z.number().nullable().default(null),
        })
      )
      .default([]),
    templates: z
      .object({
        capability_statement: z.string().default(""),
        past_perf_sheet: z.string().default(""),
      })
      .default({ capability_statement: "", past_perf_sheet: "" }),
  }),
  constraints: z.object({
    min_contract_value: z.number().nullable().default(null),
    max_travel: z.string().default(""),
    risk_tolerance: z.enum(["Low", "Medium", "High"]).default("Medium"),
    avoid_keywords: z.array(z.string()).default([]),
  }),
});

export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;
