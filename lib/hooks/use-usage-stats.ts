import { useQuery } from "@tanstack/react-query";
import type { UsageStats } from "@/app/api/user/usage-stats/route";

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
