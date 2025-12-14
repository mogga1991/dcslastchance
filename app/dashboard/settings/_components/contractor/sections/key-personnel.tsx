"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface KeyPersonnelProps {
  onUpdate?: () => void;
}

export default function KeyPersonnel({ onUpdate }: KeyPersonnelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Personnel</CardTitle>
        <CardDescription>
          Staff profiles for staffing plan requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="mb-4">Add key personnel to populate staffing plans automatically</p>
          <Button>Add Personnel</Button>
        </div>
      </CardContent>
    </Card>
  );
}
