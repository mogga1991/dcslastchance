"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle, CheckCircle2 } from "lucide-react";

interface ComplianceRiskProps {
  onUpdate?: () => void;
}

export default function ComplianceRisk({ onUpdate }: ComplianceRiskProps) {
  const complianceItems = [
    { name: "Insurance COI", status: "missing", required: true },
    { name: "Bonding Capacity", status: "missing", required: true },
    { name: "License(s)", status: "missing", required: false },
    { name: "Safety Plan", status: "missing", required: false },
    { name: "Cybersecurity Policy", status: "missing", required: false },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance & Risk</CardTitle>
        <CardDescription>
          Upload compliance documents and certifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {complianceItems.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {item.status === "uploaded" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.name}
                  </p>
                  {item.required && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Required</p>
                  )}
                </div>
              </div>
              <Badge variant={item.status === "uploaded" ? "default" : "secondary"}>
                {item.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
