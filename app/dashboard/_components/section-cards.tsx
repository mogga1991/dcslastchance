import { FileSearch, CreditCard, Clock, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              Analyses This Month
            </CardDescription>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              80% Remaining
            </Badge>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            3 / 15
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
            Pro Plan - Resets in 18 days
          </div>
          <div className="text-muted-foreground">
            12 analyses remaining this period
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Analysis Credits
            </CardDescription>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Active
            </Badge>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            5
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
            Prepaid credit pack
          </div>
          <div className="text-muted-foreground">
            Never expires - Use anytime
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming Deadlines
            </CardDescription>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Next 7 Days
            </Badge>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-amber-600">
            Next: Dec 15, 2024 (3 days)
          </div>
          <div className="text-muted-foreground">
            DHS Cybersecurity RFP
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg. Bid Score
            </CardDescription>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Strong Bid
            </Badge>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            72
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
            Last 30 days (8 analyses)
          </div>
          <div className="text-muted-foreground">
            Above 60 = Conditional Bid
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
