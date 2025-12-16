"use client";

import { useAnalyses, useCredits } from "@/hooks/use-sentyr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering for pages using auth
export const dynamic = 'force-dynamic';

export default function AnalysisPage() {
  const { analyses, loading: analysesLoading } = useAnalyses();
  const { totalCredits, loading: creditsLoading } = useCredits();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Clock className="mr-1 h-3 w-3" />
            Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getBidRecommendationBadge = (recommendation?: string, score?: number) => {
    if (!recommendation) return null;

    const config = {
      STRONG_BID: { color: "bg-green-500", text: "Strong Bid" },
      CONDITIONAL_BID: { color: "bg-yellow-500", text: "Conditional Bid" },
      EVALUATE_FURTHER: { color: "bg-orange-500", text: "Evaluate Further" },
      NO_BID: { color: "bg-red-500", text: "No Bid" },
    };

    const { color, text } = config[recommendation as keyof typeof config] || {
      color: "bg-gray-500",
      text: recommendation,
    };

    return (
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${color}`} />
        <span className="text-sm font-medium">{text}</span>
        {score && <span className="text-sm text-muted-foreground">({score}/100)</span>}
      </div>
    );
  };

  if (analysesLoading || creditsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">RFP Analysis</h1>
          <p className="text-muted-foreground">
            Upload and analyze government solicitations with AI
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Available Credits</p>
            <p className="text-2xl font-bold">{totalCredits}</p>
          </div>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            New Analysis
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Analyses</CardDescription>
            <CardTitle className="text-3xl">{analyses.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">
              {analyses.filter((a) => a.status === "completed").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Strong Bids</CardDescription>
            <CardTitle className="text-3xl">
              {analyses.filter((a) => a.bid_recommendation === "STRONG_BID").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Analyses List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Opportunities</h2>

        {analyses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by uploading your first RFP document
              </p>
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Upload RFP
              </Button>
            </CardContent>
          </Card>
        ) : (
          analyses.map((analysis) => (
            <Card key={analysis.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{analysis.title || 'Untitled Analysis'}</CardTitle>
                      {analysis.status && getStatusBadge(analysis.status)}
                    </div>
                    {analysis.agency && (
                      <CardDescription className="mb-2">{analysis.agency}</CardDescription>
                    )}
                    {analysis.solicitation_number && (
                      <p className="text-sm text-muted-foreground">
                        Solicitation: {analysis.solicitation_number}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {analysis.created_at ? new Date(analysis.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                    {analysis.status === "completed" && analysis.bid_recommendation && (
                      <div className="mt-2">
                        {getBidRecommendationBadge(
                          analysis.bid_recommendation,
                          analysis.bid_score
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              {analysis.status === "completed" && (
                <CardContent>
                  <Link href={`/analysis/${analysis.id}`}>
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Full Analysis
                    </Button>
                  </Link>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
