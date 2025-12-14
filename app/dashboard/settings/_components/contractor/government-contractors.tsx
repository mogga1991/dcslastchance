"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Building2, FileText, Users, Shield, BookOpen, AlertTriangle, CheckCircle2 } from "lucide-react";
import CompanyEligibility from "./sections/company-eligibility";
import CapabilitiesCapacity from "./sections/capabilities-capacity";
import PastPerformance from "./sections/past-performance";
import KeyPersonnel from "./sections/key-personnel";
import ComplianceRisk from "./sections/compliance-risk";
import ProposalLibrary from "./sections/proposal-library";
import Constraints from "./sections/constraints";

export default function GovernmentContractors() {
  const [activeSection, setActiveSection] = useState("company");
  const [completeness, setCompleteness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchCompleteness();
  }, []);

  const fetchCompleteness = async () => {
    try {
      const response = await fetch("/api/contractor-profile/completeness");
      if (!response.ok) throw new Error("Failed to fetch completeness");
      const data = await response.json();
      setCompleteness(data);
    } catch (error) {
      console.error("Error fetching completeness:", error);
      toast.error("Failed to load profile completeness");
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: "company", label: "Company & Eligibility", icon: Building2 },
    { id: "capabilities", label: "Capabilities", icon: FileText },
    { id: "past-performance", label: "Past Performance", icon: CheckCircle2 },
    { id: "personnel", label: "Key Personnel", icon: Users },
    { id: "compliance", label: "Compliance & Risk", icon: Shield },
    { id: "library", label: "Proposal Library", icon: BookOpen },
    { id: "constraints", label: "Constraints", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Completeness */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Government Contractor Knowledge Base
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              This information powers RFP qualification, bid/no-bid scoring, and proposal drafting
            </p>
          </div>
          <Badge
            variant={
              completeness?.percent >= 75
                ? "default"
                : completeness?.percent >= 50
                ? "secondary"
                : "destructive"
            }
            className="text-sm px-3 py-1"
          >
            {loading ? "..." : `${completeness?.percent || 0}% Complete`}
          </Badge>
        </div>

        {!loading && (
          <>
            <Progress value={completeness?.percent || 0} className="h-2" />

            {completeness?.missing && completeness.missing.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Missing Items:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {completeness.missing.map((item: any, idx: number) => (
                    <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>
                        <strong>{item.section}:</strong> {item.item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-2 h-auto bg-transparent">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs hidden sm:block">{section.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="company" className="mt-6">
          <CompanyEligibility onUpdate={fetchCompleteness} />
        </TabsContent>

        <TabsContent value="capabilities" className="mt-6">
          <CapabilitiesCapacity onUpdate={fetchCompleteness} />
        </TabsContent>

        <TabsContent value="past-performance" className="mt-6">
          <PastPerformance onUpdate={fetchCompleteness} />
        </TabsContent>

        <TabsContent value="personnel" className="mt-6">
          <KeyPersonnel onUpdate={fetchCompleteness} />
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <ComplianceRisk onUpdate={fetchCompleteness} />
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          <ProposalLibrary onUpdate={fetchCompleteness} />
        </TabsContent>

        <TabsContent value="constraints" className="mt-6">
          <Constraints onUpdate={fetchCompleteness} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
