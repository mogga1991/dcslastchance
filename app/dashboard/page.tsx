import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SectionCards } from "./_components/section-cards";
import { Button } from "@/components/ui/button";
import { Upload, FileSearch, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllOpportunitiesClient from "./_components/all-opportunities-client";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Mock recent analyses data (will be replaced with real database queries)
  const recentAnalyses = [
    {
      id: 1,
      title: "DHS Cybersecurity Services RFP",
      solicitation: "70RSAT24R00000001",
      status: "completed",
      bidScore: 82,
      dueDate: "2024-12-15",
      type: "rfp",
    },
    {
      id: 2,
      title: "DOD Cloud Infrastructure RFQ",
      solicitation: "HQ003424R0001",
      status: "completed",
      bidScore: 68,
      dueDate: "2024-12-20",
      type: "rfq",
    },
    {
      id: 3,
      title: "GSA IT Services BPA",
      solicitation: "47QTCA24R0001",
      status: "processing",
      bidScore: null,
      dueDate: "2024-12-25",
      type: "rfp",
    },
  ];

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col items-start justify-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome to ProposalIQ
            </h1>
            <p className="text-muted-foreground">
              AI-powered RFP analysis and bid/no-bid intelligence for government contractors
            </p>
          </div>
          <Link href="/dashboard/upload">
            <Button size="lg" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload & Analyze
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="@container/main flex flex-1 flex-col gap-2">
          <SectionCards />
        </div>

        {/* Tabs for Recent Analyses and All Opportunities */}
        <Tabs defaultValue="analyses" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="analyses">Recent Analyses</TabsTrigger>
            <TabsTrigger value="opportunities">All Opportunities</TabsTrigger>
          </TabsList>

          <TabsContent value="analyses" className="mt-6">
            {/* Recent Analyses */}
            <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5" />
                  Recent Analyses
                </CardTitle>
                <CardDescription>
                  Your latest RFP/RFI/RFQ analyses and bid recommendations
                </CardDescription>
              </div>
              <Link href="/dashboard/my-proposals">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{analysis.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {analysis.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {analysis.solicitation}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Due: {new Date(analysis.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {analysis.status === "completed" && analysis.bidScore ? (
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-2xl font-bold">
                            {analysis.bidScore}
                          </span>
                        </div>
                        <Badge
                          variant={
                            analysis.bidScore >= 75
                              ? "default"
                              : analysis.bidScore >= 60
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            analysis.bidScore >= 75
                              ? "bg-green-100 text-green-800 border-green-300"
                              : analysis.bidScore >= 60
                              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                              : ""
                          }
                        >
                          {analysis.bidScore >= 75
                            ? "Strong Bid"
                            : analysis.bidScore >= 60
                            ? "Conditional"
                            : "Evaluate"}
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Processing...
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/my-proposals?id=${analysis.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="mt-6">
            {/* All SAM.gov Opportunities with Map */}
            <AllOpportunitiesClient />
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/dashboard/upload">
              <CardHeader>
                <Upload className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Upload Document</CardTitle>
                <CardDescription>
                  Upload a new RFP, RFI, RFQ, or Grant for AI-powered analysis
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/dashboard/deadlines">
              <CardHeader>
                <Clock className="h-8 w-8 text-amber-600 mb-2" />
                <CardTitle>View Deadlines</CardTitle>
                <CardDescription>
                  Track upcoming proposal due dates and question deadlines
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/dashboard/saved-opportunities">
              <CardHeader>
                <FileSearch className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Saved Opportunities</CardTitle>
                <CardDescription>
                  Review bookmarked opportunities and bid recommendations
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}
