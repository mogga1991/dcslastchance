import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type ScoreCardHeaderProps = {
  title: string;
  agency: string;
  due?: string;
  setAside?: string;
  decision: "STRONG_BID" | "CONDITIONAL_BID" | "EVALUATE_FURTHER" | "NO_BID";
  score: number;
  confidence: number;
};

const DECISION_STYLES = {
  STRONG_BID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  CONDITIONAL_BID: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  EVALUATE_FURTHER: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  NO_BID: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const DECISION_LABELS = {
  STRONG_BID: "Strong Bid",
  CONDITIONAL_BID: "Conditional Bid",
  EVALUATE_FURTHER: "Evaluate Further",
  NO_BID: "No Bid",
};

export function ScoreCardHeader({
  title,
  agency,
  due,
  setAside,
  decision,
  score,
  confidence,
}: ScoreCardHeaderProps) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">{agency}</div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {setAside && <Badge variant="secondary">{setAside}</Badge>}
            <Badge variant="outline" className={DECISION_STYLES[decision]}>
              {DECISION_LABELS[decision]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Fit Score */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-sm font-medium">Fit Score</div>
              <div className="text-xs text-muted-foreground">
                {score}/100
              </div>
            </div>
            <Progress value={score} className="h-2" />
          </div>

          {/* Confidence */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-sm font-medium">Confidence</div>
              <div className="text-xs text-muted-foreground">
                {confidence}/100
              </div>
            </div>
            <Progress value={confidence} className="h-2" />
          </div>
        </div>

        {/* Due Date */}
        {due && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Proposal Due:</span>
            <span className="font-medium">{due}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
