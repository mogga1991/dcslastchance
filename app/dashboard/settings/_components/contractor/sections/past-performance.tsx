"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface PastPerformanceProps {
  onUpdate?: () => void;
}

export default function PastPerformance({ onUpdate: _onUpdate }: PastPerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Past Performance Projects</CardTitle>
        <CardDescription>
          Reference projects for qualification and scoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="mb-4">Add past performance projects to improve your bid/no-bid scoring</p>
          <Button>Add Project</Button>
        </div>
      </CardContent>
    </Card>
  );
}
