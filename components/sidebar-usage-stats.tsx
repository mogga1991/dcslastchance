"use client";

import { useUsageStats } from "@/lib/hooks/use-usage-stats";
import { cn } from "@/lib/utils";
import { TrendingUp, CreditCard, Calendar, Target, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  badge?: {
    text: string;
    variant: "success" | "warning" | "danger" | "info";
  };
  progress?: number; // 0-100
  href?: string;
  mini?: boolean;
}

function StatRow({ icon, label, value, badge, progress, href, mini }: StatRowProps) {
  const badgeColors = {
    success: "bg-green-500/20 text-green-300 border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    danger: "bg-red-500/20 text-red-300 border-red-500/30",
    info: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  };

  const progressColors = {
    high: "bg-green-500",
    medium: "bg-yellow-500",
    low: "bg-red-500",
  };

  let progressColor = progressColors.high;
  if (progress !== undefined) {
    if (progress > 80) {
      progressColor = progressColors.low; // Red when mostly used
    } else if (progress > 50) {
      progressColor = progressColors.medium; // Yellow when halfway
    }
  }

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg transition-colors",
        href && "cursor-pointer hover:bg-white/5",
        mini ? "p-2" : "px-3 py-2"
      )}
    >
      <div className="text-white/60">{icon}</div>
      {!mini && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-white/60 uppercase tracking-wide">{label}</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{value}</span>
              {badge && (
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full border font-medium",
                    badgeColors[badge.variant]
                  )}
                >
                  {badge.text}
                </span>
              )}
            </div>
          </div>
          {progress !== undefined && (
            <div className="mt-1.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", progressColor)}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export default function SidebarUsageStats({ mini = false }: { mini?: boolean }) {
  const { data: stats, isLoading, error } = useUsageStats();

  if (error) {
    return null; // Silently fail - don't break the sidebar
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 text-white/60 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculate progress percentage
  const analysisProgress = ((stats.analysesUsed ?? 0) / (stats.analysesLimit ?? 1)) * 100;

  // Determine bid score badge
  let bidScoreBadge: StatRowProps["badge"] | undefined;
  if ((stats.totalAnalyses ?? 0) > 0) {
    const avgScore = stats.avgBidScore ?? 0;
    if (avgScore >= 75) {
      bidScoreBadge = { text: "Strong", variant: "success" };
    } else if (avgScore >= 60) {
      bidScoreBadge = { text: "Conditional", variant: "warning" };
    } else if (avgScore >= 40) {
      bidScoreBadge = { text: "Evaluate", variant: "warning" };
    } else if (avgScore > 0) {
      bidScoreBadge = { text: "Weak", variant: "danger" };
    }
  }

  // Determine deadline badge
  let deadlineBadge: StatRowProps["badge"] | undefined;
  if (stats.daysUntilNextDeadline !== null && stats.daysUntilNextDeadline !== undefined) {
    if (stats.daysUntilNextDeadline <= 3) {
      deadlineBadge = { text: `${stats.daysUntilNextDeadline}d`, variant: "danger" };
    } else if (stats.daysUntilNextDeadline <= 7) {
      deadlineBadge = { text: `${stats.daysUntilNextDeadline}d`, variant: "warning" };
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm",
        mini ? "p-2" : "p-3"
      )}
    >
      {!mini && (
        <div className="mb-3 pb-2 border-b border-white/10">
          <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wide">Your Usage</h3>
        </div>
      )}

      <div className="space-y-1">
        {/* Analyses */}
        <StatRow
          icon={<TrendingUp className="h-4 w-4" />}
          label="Analyses"
          value={`${stats.analysesUsed ?? 0}/${stats.analysesLimit ?? 0}`}
          badge={
            (stats.analysesLimit ?? 0) - (stats.analysesUsed ?? 0) > 0
              ? { text: `${(stats.analysesLimit ?? 0) - (stats.analysesUsed ?? 0)} left`, variant: "info" }
              : { text: "Limit reached", variant: "warning" }
          }
          progress={analysisProgress}
          href="/dashboard"
          mini={mini}
        />

        {/* Credits */}
        {(stats.credits ?? 0) > 0 && (
          <StatRow
            icon={<CreditCard className="h-4 w-4" />}
            label="Credits"
            value={stats.credits ?? 0}
            badge={{ text: "Active", variant: "success" }}
            href="/dashboard/upgrade"
            mini={mini}
          />
        )}

        {/* Upcoming Deadlines */}
        {(stats.upcomingDeadlines?.length ?? 0) > 0 && (
          <StatRow
            icon={<Calendar className="h-4 w-4" />}
            label="Deadlines"
            value={stats.upcomingDeadlines?.length ?? 0}
            badge={deadlineBadge}
            href="/dashboard/my-proposals"
            mini={mini}
          />
        )}

        {/* Avg Bid Score */}
        {(stats.totalAnalyses ?? 0) > 0 && (
          <StatRow
            icon={<Target className="h-4 w-4" />}
            label="Avg Score"
            value={stats.avgBidScore ?? 0}
            badge={bidScoreBadge}
            href="/dashboard"
            mini={mini}
          />
        )}
      </div>

      {!mini && stats.planName && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60">{stats.planName} Plan</span>
            {(stats.daysUntilReset ?? 0) > 0 && (
              <span className="text-white/60">Resets in {stats.daysUntilReset}d</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
