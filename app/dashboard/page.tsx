import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SectionCards } from "./_components/section-cards";
import { Button } from "@/components/ui/button";
import { Upload, FileSearch, Clock } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllOpportunitiesClient from "./_components/all-opportunities-client";
import GSALeasingClient from "./gsa-leasing/_components/gsa-leasing-client";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

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

        {/* Tabs for All Opportunities and GSA Leasing */}
        <Tabs defaultValue="opportunities" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="opportunities">All Opportunities</TabsTrigger>
            <TabsTrigger value="leasing">GSA Leasing</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="mt-6">
            {/* All SAM.gov Opportunities with Map */}
            <AllOpportunitiesClient />
          </TabsContent>

          <TabsContent value="leasing" className="mt-6">
            {/* GSA Leasing Opportunities with Map */}
            <GSALeasingClient />
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
