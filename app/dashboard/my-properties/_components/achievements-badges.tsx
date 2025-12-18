"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Target,
  Flame,
  Zap,
  Star,
  Award,
  TrendingUp,
  Eye,
  Lock,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: typeof Trophy;
  color: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  earned: boolean;
  earnedDate?: string;
  progress?: {
    current: number;
    target: number;
  };
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: "matches" | "proposals" | "wins" | "engagement" | "special";
  badges: Badge[];
  totalProgress: {
    current: number;
    target: number;
  };
}

interface AchievementsBadgesProps {
  achievements: Achievement[];
  totalBadgesEarned: number;
  totalBadges: number;
}

const tierConfig = {
  bronze: {
    gradient: "from-amber-600 to-amber-800",
    bg: "bg-amber-100",
    text: "text-amber-900",
    border: "border-amber-300",
  },
  silver: {
    gradient: "from-gray-400 to-gray-600",
    bg: "bg-gray-100",
    text: "text-gray-900",
    border: "border-gray-300",
  },
  gold: {
    gradient: "from-yellow-400 to-yellow-600",
    bg: "bg-yellow-100",
    text: "text-yellow-900",
    border: "border-yellow-300",
  },
  platinum: {
    gradient: "from-blue-400 to-purple-600",
    bg: "bg-purple-100",
    text: "text-purple-900",
    border: "border-purple-300",
  },
};

const rarityConfig = {
  common: { label: "Common", color: "text-gray-600" },
  rare: { label: "Rare", color: "text-blue-600" },
  epic: { label: "Epic", color: "text-purple-600" },
  legendary: { label: "Legendary", color: "text-yellow-600" },
};

export default function AchievementsBadges({
  achievements,
  totalBadgesEarned,
  totalBadges,
}: AchievementsBadgesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);

  const getFilteredAchievements = () => {
    let filtered = achievements;

    if (selectedCategory) {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    if (showEarnedOnly) {
      filtered = filtered.map((achievement) => ({
        ...achievement,
        badges: achievement.badges.filter((b) => b.earned),
      })).filter((a) => a.badges.length > 0);
    }

    return filtered;
  };

  const filteredAchievements = getFilteredAchievements();

  const completionPercentage = Math.round(
    (totalBadgesEarned / totalBadges) * 100
  );

  const categoryStats = achievements.reduce(
    (stats, achievement) => {
      const earnedInCategory = achievement.badges.filter((b) => b.earned).length;
      stats[achievement.category] = (stats[achievement.category] || 0) + earnedInCategory;
      return stats;
    },
    {} as Record<string, number>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Achievements & Badges
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Track your progress and unlock achievements
        </p>
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">{totalBadgesEarned} / {totalBadges}</h3>
            <p className="text-sm opacity-90">Badges Earned</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{completionPercentage}%</p>
            <p className="text-sm opacity-90">Complete</p>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries({
          matches: { label: "Matches", icon: Zap, color: "bg-blue-100 text-blue-700" },
          proposals: { label: "Proposals", icon: Target, color: "bg-purple-100 text-purple-700" },
          wins: { label: "Wins", icon: Trophy, color: "bg-yellow-100 text-yellow-700" },
          engagement: { label: "Engagement", icon: TrendingUp, color: "bg-green-100 text-green-700" },
          special: { label: "Special", icon: Star, color: "bg-pink-100 text-pink-700" },
        }).map(([category, config]) => {
          const Icon = config.icon;
          const count = categoryStats[category] || 0;
          const isSelected = selectedCategory === category;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(isSelected ? null : category)}
              className={cn(
                "p-4 rounded-lg border-2 transition-all",
                isSelected
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2", config.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-600">{config.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedCategory && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Clear Filter
            </Button>
          )}
        </div>
        <Button
          variant={showEarnedOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowEarnedOnly(!showEarnedOnly)}
        >
          {showEarnedOnly ? "Show All" : "Earned Only"}
        </Button>
      </div>

      {/* Achievements List */}
      {filteredAchievements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No achievements found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters
          </p>
          <Button
            onClick={() => {
              setSelectedCategory(null);
              setShowEarnedOnly(false);
            }}
            variant="outline"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden"
            >
              {/* Achievement Header */}
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {achievement.description}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">
                        Progress: {achievement.totalProgress.current} / {achievement.totalProgress.target}
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        {Math.round(
                          (achievement.totalProgress.current / achievement.totalProgress.target) * 100
                        )}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 rounded-full h-2 transition-all"
                        style={{
                          width: `${Math.min(
                            (achievement.totalProgress.current / achievement.totalProgress.target) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {achievement.badges.filter((b) => b.earned).length} / {achievement.badges.length} earned
                  </span>
                </div>
              </div>

              {/* Badges Grid */}
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievement.badges.map((badge) => {
                  const Icon = badge.icon;
                  const tierStyle = tierConfig[badge.tier];
                  const rarityStyle = rarityConfig[badge.rarity];

                  return (
                    <div
                      key={badge.id}
                      className={cn(
                        "relative p-4 rounded-lg border-2 transition-all",
                        badge.earned
                          ? `${tierStyle.bg} ${tierStyle.border} hover:shadow-md`
                          : "bg-gray-50 border-gray-200 opacity-60"
                      )}
                    >
                      {/* Locked Overlay */}
                      {!badge.earned && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 rounded-lg">
                          <Lock className="h-8 w-8 text-gray-600" />
                        </div>
                      )}

                      {/* Badge Icon */}
                      <div
                        className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3",
                          badge.earned
                            ? `bg-gradient-to-br ${tierStyle.gradient} text-white`
                            : "bg-gray-300 text-gray-500"
                        )}
                      >
                        <Icon className="h-8 w-8" />
                      </div>

                      {/* Badge Info */}
                      <div className="text-center">
                        <h4
                          className={cn(
                            "text-sm font-bold mb-1",
                            badge.earned ? tierStyle.text : "text-gray-600"
                          )}
                        >
                          {badge.name}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {badge.description}
                        </p>

                        {/* Rarity & Tier */}
                        <div className="flex items-center justify-center gap-2 text-xs mb-2">
                          <span className={cn("font-medium", rarityStyle.color)}>
                            {rarityStyle.label}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600 capitalize">
                            {badge.tier}
                          </span>
                        </div>

                        {/* Progress or Earned Date */}
                        {badge.earned && badge.earnedDate ? (
                          <p className="text-xs text-gray-500">
                            Earned {formatDate(badge.earnedDate)}
                          </p>
                        ) : badge.progress ? (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-indigo-600 rounded-full h-1.5"
                                style={{
                                  width: `${Math.min(
                                    (badge.progress.current / badge.progress.target) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {badge.progress.current} / {badge.progress.target}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
