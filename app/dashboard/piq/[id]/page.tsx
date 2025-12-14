import { Suspense } from "react";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import {
  ScoreCardHeader,
  HardStopBanner,
  ComplianceMatrixTable,
  tagMatrixRows,
} from "@/components/proposaliq";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Download, Share2, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { OpportunityAnalysis, Scorecard, ComplianceMatrix } from "@/lib/proposaliq/schemas";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getAnalysisData(analysisId: string) {
  // Get analysis
  const { data: analysis, error: analysisError } = await supabaseAdmin
    .from("piq_analysis")
    .select("*")
    .eq("id", analysisId)
    .single();

  if (analysisError || !analysis) {
    return null;
  }

  // Get scorecard
  const { data: scorecardData } = await supabaseAdmin
    .from("piq_scorecards")
    .select("*")
    .eq("analysis_id", analysisId)
    .single();

  // Get compliance matrix
  const { data: matrixData } = await supabaseAdmin
    .from("piq_compliance_matrices")
    .select("*")
    .eq("analysis_id", analysisId)
    .single();

  // Get document
  const { data: document } = await supabaseAdmin
    .from("piq_documents")
    .select("*")
    .eq("id", analysis.document_id)
    .single();

  return {
    analysis: analysis.analysis as OpportunityAnalysis,
    scorecard: scorecardData?.scorecard as Scorecard,
    matrix: matrixData?.matrix as ComplianceMatrix,
    documentId: document?.id,
    opportunityId: analysis.opportunity_id,
  };
}

export default async function AnalysisResultsPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getAnalysisData(id);

  if (!data) {
    notFound();
  }

  const { analysis, scorecard, matrix, documentId } = data;
  const matrixRows = matrix ? tagMatrixRows(matrix) : [];

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunity Analysis</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered extraction and bid/no-bid assessment
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          {documentId && (
            <Link href={`/dashboard/documents/${documentId}`} target="_blank">
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                View PDF
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Scorecard Header */}
      {scorecard && (
        <ScoreCardHeader
          title={analysis.opportunity_snapshot.title}
          agency={analysis.opportunity_snapshot.agency || ""}
          due={analysis.key_dates.proposal_due?.date}
          setAside={analysis.opportunity_snapshot.set_aside?.type}
          decision={scorecard.decision}
          score={scorecard.overall_score}
          confidence={scorecard.confidence}
        />
      )}

      {/* Hard Stops */}
      {scorecard?.hard_stops && scorecard.hard_stops.length > 0 && (
        <HardStopBanner items={scorecard.hard_stops} />
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
          <TabsTrigger value="dates">Key Dates</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Opportunity Details */}
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">Solicitation Number</div>
                <div className="font-medium">
                  {analysis.opportunity_snapshot.solicitation_number || "—"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">NAICS Code</div>
                <div className="font-medium">
                  {analysis.opportunity_snapshot.naics_code || "—"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Contract Type</div>
                <div className="font-medium">
                  {analysis.opportunity_snapshot.contract_type || "—"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Estimated Value</div>
                <div className="font-medium">
                  {analysis.opportunity_snapshot.estimated_value?.low &&
                  analysis.opportunity_snapshot.estimated_value?.high
                    ? `$${analysis.opportunity_snapshot.estimated_value.low.toLocaleString()} - $${analysis.opportunity_snapshot.estimated_value.high.toLocaleString()}`
                    : "—"}
                </div>
              </div>
              {analysis.opportunity_snapshot.security_requirements?.clearance_level && (
                <div>
                  <div className="text-sm text-muted-foreground">Security Clearance</div>
                  <Badge variant="secondary">
                    {analysis.opportunity_snapshot.security_requirements.clearance_level}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scorecard Breakdown */}
          {scorecard && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {scorecard.strengths.map((strength, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Weaknesses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Weaknesses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {scorecard.weaknesses.map((weakness, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-orange-600 mt-0.5">⚠</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Category Scores */}
          {scorecard && (
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(scorecard.category_scores).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-muted-foreground">
                        {value.score}/100 (Weight: {(value.weight * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-signal-orange transition-all"
                        style={{ width: `${value.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="mt-6">
          {matrix && (
            <ComplianceMatrixTable
              rows={matrixRows}
              documentId={documentId}
              showWorkflowStage={true}
            />
          )}
        </TabsContent>

        {/* Evaluation Tab */}
        <TabsContent value="evaluation" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Evaluation Method</div>
                <Badge variant="outline" className="mt-1">
                  {analysis.evaluation_criteria?.evaluation_method || "Not Specified"}
                </Badge>
              </div>

              {analysis.evaluation_criteria?.factors && (
                <div className="mt-4 space-y-3">
                  <div className="text-sm font-medium">Evaluation Factors</div>
                  {analysis.evaluation_criteria.factors.map((factor, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-medium">{factor.name}</div>
                          {factor.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {factor.description}
                            </div>
                          )}
                        </div>
                        {factor.weight && (
                          <Badge variant="secondary">{(factor.weight * 100).toFixed(0)}%</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Key Dates Tab */}
        <TabsContent value="dates" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Important Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.key_dates.questions_due && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium">Questions Due</div>
                    <div className="text-sm text-muted-foreground">
                      Last day to submit questions
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{analysis.key_dates.questions_due.date}</div>
                    {analysis.key_dates.questions_due.time && (
                      <div className="text-sm text-muted-foreground">
                        {analysis.key_dates.questions_due.time}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {analysis.key_dates.proposal_due && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-signal-orange/10 border border-signal-orange/20">
                  <div>
                    <div className="font-medium">Proposal Due</div>
                    <div className="text-sm text-muted-foreground">
                      Final submission deadline
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{analysis.key_dates.proposal_due.date}</div>
                    {analysis.key_dates.proposal_due.time && (
                      <div className="text-sm text-muted-foreground">
                        {analysis.key_dates.proposal_due.time}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {analysis.key_dates.anticipated_award && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium">Anticipated Award</div>
                    <div className="text-sm text-muted-foreground">
                      Expected contract award date
                    </div>
                  </div>
                  <div className="font-medium">{analysis.key_dates.anticipated_award}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
