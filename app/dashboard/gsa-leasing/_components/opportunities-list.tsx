"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface SAMOpportunity {
  noticeId: string;
  title: string;
  solicitationNumber: string;
  department: string;
  subTier: string;
  type: string;
  responseDeadLine: string;
  naicsCode: string;
  description: string;
  placeOfPerformance: {
    city: { name: string };
    state: { code: string; name: string };
    zip: string;
  };
  officeAddress: {
    city: string;
    state: string;
    zipcode: string;
  };
  uiLink: string;
}

interface OpportunitiesListProps {
  onLocationSelect?: (opportunities: SAMOpportunity[]) => void;
}

export default function OpportunitiesList({ onLocationSelect }: OpportunitiesListProps) {
  const [opportunities, setOpportunities] = useState<SAMOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedState, setSelectedState] = useState<string>("");

  useEffect(() => {
    fetchOpportunities();
  }, [selectedState]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ limit: "100" });
      if (selectedState) {
        params.append("state", selectedState);
      }

      const response = await fetch(`/api/sam-opportunities?${params.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch opportunities");
      }

      setOpportunities(result.data || []);
      setTotalRecords(result.totalRecords || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDeadline = (deadline: string): number => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyBadge = (deadline: string) => {
    const days = getDaysUntilDeadline(deadline);
    if (days <= 3) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          {days} days left
        </Badge>
      );
    }
    if (days <= 7) {
      return (
        <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800">
          <Clock className="h-3 w-3" />
          {days} days left
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <Calendar className="h-3 w-3" />
        {days} days left
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading GSA lease opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">Error Loading Opportunities</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button onClick={fetchOpportunities} variant="outline" size="sm" className="mt-3">
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Active Opportunities</h2>
          <p className="text-muted-foreground mt-1">
            {totalRecords} GSA lease contract opportunities available
          </p>
        </div>
        <Button onClick={fetchOpportunities} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {opportunities.map((opp) => {
          const location = opp.placeOfPerformance?.city?.name && opp.placeOfPerformance?.state?.name
            ? `${opp.placeOfPerformance.city.name}, ${opp.placeOfPerformance.state.code}`
            : `${opp.officeAddress.city}, ${opp.officeAddress.state}`;

          return (
            <Card key={opp.noticeId} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <Badge variant="outline">{opp.type}</Badge>
                      {getUrgencyBadge(opp.responseDeadLine)}
                    </div>
                    <CardTitle className="text-xl mb-2">{opp.title}</CardTitle>
                    <CardDescription className="flex flex-col gap-1">
                      <span className="font-mono text-sm">
                        {opp.solicitationNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {location}
                      </span>
                    </CardDescription>
                  </div>
                  <Link href={opp.uiLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="gap-2">
                      View on SAM.gov
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Department:</span>
                      <p className="font-medium">{opp.department}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sub-tier:</span>
                      <p className="font-medium">{opp.subTier}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">NAICS Code:</span>
                      <p className="font-medium">{opp.naicsCode}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Response Deadline:</span>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(opp.responseDeadLine).toLocaleString("en-US", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  {opp.description && (
                    <div>
                      <span className="text-muted-foreground text-sm">Description:</span>
                      <p className="text-sm mt-1 line-clamp-3">{opp.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {opportunities.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Opportunities Found</h3>
              <p className="text-muted-foreground">
                No GSA lease opportunities match your current filters.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
