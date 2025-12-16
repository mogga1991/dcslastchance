import { useQuery } from "@tanstack/react-query";

// UsageStats type - define locally since the route is disabled
interface UsageStats {
  analyses_used: number;
  analyses_limit: number;
  credits_remaining: number;
  subscription_tier?: string;
  period_end?: string;
  // Additional stats
  analysesUsed?: number;
  analysesLimit?: number;
  totalAnalyses?: number;
  avgBidScore?: number;
  daysUntilNextDeadline?: number;
  credits?: number;
  upcomingDeadlines?: Array<{ date: string; title: string }>;
  planName?: string;
  daysUntilReset?: number;
}

export function useUsageStats() {
  return useQuery<UsageStats>({
    queryKey: ["usage-stats"],
    queryFn: async () => {
      const response = await fetch("/api/user/usage-stats");
      if (!response.ok) {
        throw new Error("Failed to fetch usage stats");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}
