"use client";

/**
 * EXAMPLE INTEGRATION PAGE
 * This demonstrates how to use all ProposalIQ components together
 * Copy this as a template for your actual opportunity analysis pages
 */

import { useState } from "react";
import {
  ScoreCardHeader,
  HardStopBanner,
  ComplianceMatrixTable,
  tagMatrixRows,
} from "@/components/proposaliq";
import type {
  Scorecard,
  ComplianceMatrix,
  ComplianceMatrixRow,
} from "@/lib/proposaliq/schemas";

// Example mock data - replace with real data from your API
const MOCK_SCORECARD: Scorecard = {
  overall_score: 78,
  decision: "STRONG_BID",
  confidence: 85,
  category_scores: {
    technical_alignment: { score: 85, weight: 0.25, weighted: 21.25 },
    past_performance: { score: 75, weight: 0.2, weighted: 15 },
    competitive_position: { score: 80, weight: 0.2, weighted: 16 },
    resource_availability: { score: 70, weight: 0.15, weighted: 10.5 },
    strategic_value: { score: 75, weight: 0.1, weighted: 7.5 },
    pursuit_roi: { score: 80, weight: 0.1, weighted: 8 },
  },
  strengths: [
    "Strong technical capabilities in cloud infrastructure",
    "Relevant past performance with federal agencies",
    "Small business set-aside alignment",
  ],
  weaknesses: [
    "Limited experience with FBI-specific requirements",
    "May need additional security clearances",
  ],
  hard_stops: [
    {
      type: "Security Clearance",
      detail: "Requires Top Secret clearance - 3 team members need upgrading",
    },
  ],
};

const MOCK_MATRIX: ComplianceMatrix = {
  compliance_matrix: {
    metadata: {
      total_requirements: 5,
      must_have_count: 3,
      should_have_count: 1,
      may_have_count: 1,
    },
    rows: [
      {
        req_id: "REQ-001",
        priority: "Must",
        requirement_type: "Security",
        requirement_statement:
          "All personnel must possess an active Top Secret security clearance with SCI eligibility",
        status: "Not Started",
        source: {
          page: 12,
          section: "Section L.3.1",
          text_snippet:
            "The contractor shall ensure all personnel working on this contract possess...",
          confidence: 0.95,
        },
      },
      {
        req_id: "REQ-002",
        priority: "Must",
        requirement_type: "Technical",
        requirement_statement:
          "Provide cloud infrastructure services compatible with FedRAMP High baseline",
        status: "In Progress",
        source: {
          page: 15,
          section: "Section C.2",
          text_snippet: "The cloud environment must meet FedRAMP High...",
          confidence: 0.88,
        },
      },
      {
        req_id: "REQ-003",
        priority: "Should",
        requirement_type: "Submission",
        requirement_statement:
          "Submit technical approach narrative not to exceed 25 pages",
        status: "Not Started",
        source: {
          page: 3,
          section: "Section L.1",
        },
      },
      {
        req_id: "REQ-004",
        priority: "Must",
        requirement_type: "Past Performance",
        requirement_statement:
          "Provide three references from similar federal cloud projects within the last 5 years",
        status: "Completed",
        source: {
          page: 18,
          section: "Section L.4",
        },
      },
      {
        req_id: "REQ-005",
        priority: "May",
        requirement_type: "Technical",
        requirement_statement:
          "Offerors may propose innovative AI/ML capabilities for threat detection",
        status: "Not Started",
      },
    ],
  },
};

export default function ExampleAnalysisPage() {
  // Tag matrix rows with workflow stages
  const [matrixRows, setMatrixRows] = useState(tagMatrixRows(MOCK_MATRIX));

  // Document ID - in real app, fetch from your database
  const documentId = "example-doc-uuid";

  // Handle requirement status updates
  function handleRowUpdate(reqId: string, updates: Partial<ComplianceMatrixRow>) {
    setMatrixRows((prev) =>
      prev.map((row) => (row.req_id === reqId ? { ...row, ...updates } : row))
    );

    // TODO: Save to database
    console.log("Update requirement", reqId, updates);
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Opportunity Analysis</h1>
        <p className="text-muted-foreground">
          AI-powered bid/no-bid analysis and compliance tracking
        </p>
      </div>

      {/* Scorecard Header */}
      <ScoreCardHeader
        title="FBI Cloud Infrastructure Services"
        agency="Federal Bureau of Investigation"
        due="January 15, 2025 at 2:00 PM EST"
        setAside="Small Business Set-Aside"
        decision={MOCK_SCORECARD.decision}
        score={MOCK_SCORECARD.overall_score}
        confidence={MOCK_SCORECARD.confidence}
      />

      {/* Hard Stop Banner */}
      {MOCK_SCORECARD.hard_stops && (
        <HardStopBanner items={MOCK_SCORECARD.hard_stops} />
      )}

      {/* Key Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-2xl border p-6">
          <h3 className="mb-4 text-lg font-semibold">Strengths</h3>
          <ul className="space-y-2">
            {MOCK_SCORECARD.strengths.map((strength, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="rounded-2xl border p-6">
          <h3 className="mb-4 text-lg font-semibold">Weaknesses</h3>
          <ul className="space-y-2">
            {MOCK_SCORECARD.weaknesses.map((weakness, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-orange-600">⚠</span>
                <span className="text-sm">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Compliance Matrix */}
      <ComplianceMatrixTable
        rows={matrixRows}
        documentId={documentId}
        showWorkflowStage={true}
        onRowUpdate={handleRowUpdate}
      />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="rounded-lg bg-primary px-6 py-3 text-primary-foreground">
          Proceed to Proposal Assembly
        </button>
        <button className="rounded-lg border px-6 py-3">
          Export Full Report
        </button>
      </div>
    </div>
  );
}
