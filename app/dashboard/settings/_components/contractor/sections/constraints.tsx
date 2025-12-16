"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ConstraintsProps {
  onUpdate?: () => void;
}

export default function Constraints({ onUpdate: _onUpdate }: ConstraintsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Constraints & Policies</CardTitle>
        <CardDescription>
          Define what NOT to say in proposals (compliance guardrails)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="prohibited_claims">
            Prohibited Claims
          </Label>
          <Textarea
            id="prohibited_claims"
            placeholder="Enter claims that should NOT be made (one per line)&#10;Example: ISO 9001 certified&#10;Example: GSA Schedule holder"
            rows={5}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            AI will avoid making these claims unless evidence is provided
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prohibited_scopes">
            Prohibited Scopes
          </Label>
          <Textarea
            id="prohibited_scopes"
            placeholder="Enter scopes of work to avoid (one per line)&#10;Example: International travel&#10;Example: Construction over $1M"
            rows={5}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            AI will flag RFPs with these scope requirements
          </p>
        </div>

        <Button>Save Constraints</Button>
      </CardContent>
    </Card>
  );
}
