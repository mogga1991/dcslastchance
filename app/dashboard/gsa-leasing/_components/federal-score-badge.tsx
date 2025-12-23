import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Building2 } from "lucide-react";
// FederalNeighborhoodScore type definition
export interface FederalNeighborhoodScore {
  score: number;
  totalProperties: number;
  leasedProperties: number;
  ownedProperties: number;
  totalRSF: number;
  vacantRSF: number;
  density: number;
  percentile: number;
}

interface FederalScoreBadgeProps {
  score: number;
  scoreData?: FederalNeighborhoodScore;
  compact?: boolean;
}

export function FederalScoreBadge({ score, scoreData, compact = false }: FederalScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) {
      return "bg-green-100 text-green-800 border-green-300";
    } else if (score >= 50) {
      return "bg-blue-100 text-blue-800 border-blue-300";
    } else if (score >= 25) {
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    } else {
      return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return "Excellent";
    if (score >= 50) return "Good";
    if (score >= 25) return "Fair";
    return "Low";
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const badge = (
    <Badge
      variant="outline"
      className={`text-xs font-semibold ${getScoreColor(score)}`}
    >
      <Building2 className="h-3 w-3 mr-1" />
      Federal Score: {score}
      {!compact && ` (${getScoreLabel(score)})`}
    </Badge>
  );

  if (!scoreData) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold border-b pb-1 mb-2">
              Federal Neighborhood Score: {score}/100
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="text-gray-600">Total Properties:</div>
              <div className="font-medium">{formatNumber(scoreData.totalProperties)}</div>

              <div className="text-gray-600">Leased:</div>
              <div className="font-medium">{formatNumber(scoreData.leasedProperties)}</div>

              <div className="text-gray-600">Owned:</div>
              <div className="font-medium">{formatNumber(scoreData.ownedProperties)}</div>

              <div className="text-gray-600">Total RSF:</div>
              <div className="font-medium">{formatNumber(scoreData.totalRSF)} SF</div>

              <div className="text-gray-600">Vacant RSF:</div>
              <div className="font-medium">{formatNumber(scoreData.vacantRSF)} SF</div>

              <div className="text-gray-600">Density:</div>
              <div className="font-medium">{scoreData.density}/sq mi</div>

              <div className="text-gray-600">Percentile:</div>
              <div className="font-medium">{scoreData.percentile}th</div>
            </div>

            <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
              Score based on federal property density, total space, and leasing activity within 5 miles
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
