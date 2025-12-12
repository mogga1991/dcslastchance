import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import OpportunitiesList from "./_components/opportunities-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Filter, Map } from "lucide-react";

export default async function GSALeasingPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    redirect("/sign-in");
  }

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-center gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                GSA Lease Opportunities
              </h1>
              <p className="text-muted-foreground">
                Live contract opportunities from SAM.gov filtered for GSA Public Buildings Service
              </p>
            </div>
          </div>
        </div>

        {/* Filter Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Filter className="h-5 w-5" />
              Active Filters
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Opportunities are pre-filtered to match GSA.gov criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-blue-700 dark:text-blue-400">Department</span>
                <Badge variant="secondary" className="w-fit">General Services Administration</Badge>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-blue-700 dark:text-blue-400">Sub-tier</span>
                <Badge variant="secondary" className="w-fit">Public Buildings Service</Badge>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-blue-700 dark:text-blue-400">NAICS Code</span>
                <Badge variant="secondary" className="w-fit">531120 - Lessors of Nonresidential Buildings</Badge>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-blue-700 dark:text-blue-400">Notice Types</span>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Solicitation</Badge>
                  <Badge variant="outline" className="text-xs">Presolicitation</Badge>
                  <Badge variant="outline" className="text-xs">Sources Sought</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-blue-700 dark:text-blue-400">Response Date</span>
                <Badge variant="secondary" className="w-fit">Today or Later</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opportunities List */}
        <OpportunitiesList />

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              About GSA Lease Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              This page displays GSA lease contract opportunities using data from the System for
              Award Management (SAM.gov). SAM.gov is the authoritative site for federal contract opportunities.
            </p>
            <p>
              <strong>Important:</strong> Each location represents a general area. Requirements can span
              multiple cities. Refer to the notice on SAM.gov for the most up-to-date information,
              including the delineated area and specific requirements.
            </p>
            <p>
              All opportunities shown match the exact filtering criteria used on the official GSA.gov
              lease opportunities map.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
