"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface ProposalLibraryProps {
  onUpdate?: () => void;
}

export default function ProposalLibrary({ onUpdate }: ProposalLibraryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposal Library</CardTitle>
        <CardDescription>
          Approved boilerplate content for proposal drafting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="mb-4">Build a library of reusable proposal content</p>
          <Button>Add Content</Button>
        </div>
      </CardContent>
    </Card>
  );
}
