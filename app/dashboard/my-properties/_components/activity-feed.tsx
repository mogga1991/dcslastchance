"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Eye,
  ThumbsUp,
  FileText,
  Trophy,
  Bookmark,
  Building2,
  TrendingUp,
  Clock,
  Filter,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type:
    | "new_match"
    | "viewed"
    | "interested"
    | "proposal_submitted"
    | "won"
    | "saved"
    | "property_viewed"
    | "high_score_match";
  title: string;
  description: string;
  property_title?: string;
  opportunity_title?: string;
  match_score?: number;
  timestamp: string;
  metadata?: {
    agency?: string;
    value?: number;
    views?: number;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const activityConfig = {
  new_match: {
    icon: Zap,
    color: "text-blue-600 bg-blue-100",
    label: "New Match",
  },
  viewed: {
    icon: Eye,
    color: "text-gray-600 bg-gray-100",
    label: "Viewed",
  },
  interested: {
    icon: ThumbsUp,
    color: "text-green-600 bg-green-100",
    label: "Marked Interested",
  },
  proposal_submitted: {
    icon: FileText,
    color: "text-purple-600 bg-purple-100",
    label: "Proposal Submitted",
  },
  won: {
    icon: Trophy,
    color: "text-yellow-600 bg-yellow-100",
    label: "Won",
  },
  saved: {
    icon: Bookmark,
    color: "text-indigo-600 bg-indigo-100",
    label: "Saved",
  },
  property_viewed: {
    icon: Building2,
    color: "text-cyan-600 bg-cyan-100",
    label: "Property Viewed",
  },
  high_score_match: {
    icon: TrendingUp,
    color: "text-red-600 bg-red-100",
    label: "Hot Match",
  },
};

export default function ActivityFeed({ activities: initialActivities }: ActivityFeedProps) {
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const getFilteredActivities = () => {
    const now = new Date();
    let filtered = initialActivities;

    // Time filter
    if (filter !== "all") {
      filtered = filtered.filter((activity) => {
        const activityDate = new Date(activity.timestamp);
        const diffTime = now.getTime() - activityDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (filter === "today") return diffDays < 1;
        if (filter === "week") return diffDays < 7;
        if (filter === "month") return diffDays < 30;
        return true;
      });
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter((activity) => activity.type === typeFilter);
    }

    return filtered;
  };

  const filteredActivities = getFilteredActivities();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const groupActivitiesByDate = () => {
    const groups: { [key: string]: ActivityItem[] } = {};

    filteredActivities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "Yesterday";
      } else {
        groupKey = date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(activity);
    });

    return groups;
  };

  const groupedActivities = groupActivitiesByDate();

  // Count activities by type
  const activityCounts = initialActivities.reduce(
    (counts, activity) => {
      counts[activity.type] = (counts[activity.type] || 0) + 1;
      return counts;
    },
    {} as { [key: string]: number }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Activity Feed</h2>
        <p className="text-sm text-gray-600 mt-1">
          Recent activity across your properties and opportunities
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Time Filter */}
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
          <Clock className="h-4 w-4 text-gray-500" />
          <Button
            variant={filter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All Time
          </Button>
          <Button
            variant={filter === "today" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("today")}
          >
            Today
          </Button>
          <Button
            variant={filter === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("week")}
          >
            This Week
          </Button>
          <Button
            variant={filter === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("month")}
          >
            This Month
          </Button>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg flex-wrap">
          <Filter className="h-4 w-4 text-gray-500" />
          <Button
            variant={typeFilter === null ? "default" : "ghost"}
            size="sm"
            onClick={() => setTypeFilter(null)}
          >
            All ({initialActivities.length})
          </Button>
          {Object.entries(activityCounts).map(([type, count]) => (
            <Button
              key={type}
              variant={typeFilter === type ? "default" : "ghost"}
              size="sm"
              onClick={() => setTypeFilter(type)}
            >
              {activityConfig[type as keyof typeof activityConfig]?.label} ({count})
            </Button>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      {Object.keys(groupedActivities).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No activities found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters to see more activity
          </p>
          <Button
            onClick={() => {
              setFilter("all");
              setTypeFilter(null);
            }}
            variant="outline"
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedActivities).map(([dateGroup, activities]) => (
            <div key={dateGroup}>
              {/* Date Header */}
              <div className="sticky top-0 bg-gray-50 py-2 px-4 rounded-lg mb-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {dateGroup}
                </h3>
              </div>

              {/* Activities for this date */}
              <div className="space-y-3">
                {activities.map((activity) => {
                  const config = activityConfig[activity.type];
                  const Icon = config.icon;

                  return (
                    <div
                      key={activity.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={cn(
                            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                            config.color
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 mb-1">
                                {activity.title}
                              </p>
                              <p className="text-sm text-gray-600 mb-2">
                                {activity.description}
                              </p>

                              {/* Metadata */}
                              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                {activity.property_title && (
                                  <span className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {activity.property_title}
                                  </span>
                                )}
                                {activity.match_score && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                    {activity.match_score}% Match
                                  </span>
                                )}
                                {activity.metadata?.agency && (
                                  <span>{activity.metadata.agency}</span>
                                )}
                                {activity.metadata?.value && (
                                  <span className="font-medium">
                                    {formatCurrency(activity.metadata.value)} value
                                  </span>
                                )}
                                {activity.metadata?.views && (
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {activity.metadata.views} views
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Timestamp */}
                            <div className="flex-shrink-0">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(activity.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredActivities.length >= 20 && (
        <div className="text-center pt-4">
          <Button variant="outline">Load More Activity</Button>
        </div>
      )}
    </div>
  );
}
