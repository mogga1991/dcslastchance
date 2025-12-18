// Mock data for Achievements & Badges

import {
  Trophy,
  Target,
  Flame,
  Zap,
  Star,
  Award,
  TrendingUp,
  Eye,
  Rocket,
  Heart,
} from "lucide-react";

export interface Badge {
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

export interface Achievement {
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

export const mockAchievements: Achievement[] = [
  // Matches Category
  {
    id: "ach-matches",
    title: "Match Master",
    description: "Unlock badges by receiving quality matches for your properties",
    category: "matches",
    totalProgress: {
      current: 45,
      target: 100,
    },
    badges: [
      {
        id: "badge-matches-10",
        name: "First Ten",
        description: "Receive your first 10 opportunity matches",
        icon: Zap,
        color: "amber",
        tier: "bronze",
        earned: true,
        earnedDate: "2024-11-15T10:00:00Z",
        rarity: "common",
      },
      {
        id: "badge-matches-25",
        name: "Quarter Century",
        description: "Accumulate 25 total matches",
        icon: Zap,
        color: "gray",
        tier: "silver",
        earned: true,
        earnedDate: "2024-12-01T14:30:00Z",
        rarity: "common",
      },
      {
        id: "badge-matches-50",
        name: "Half Century",
        description: "Reach 50 matches across your portfolio",
        icon: Zap,
        color: "yellow",
        tier: "gold",
        earned: false,
        rarity: "rare",
        progress: {
          current: 45,
          target: 50,
        },
      },
      {
        id: "badge-matches-100",
        name: "Century Club",
        description: "Achieve 100 total matches",
        icon: Zap,
        color: "purple",
        tier: "platinum",
        earned: false,
        rarity: "epic",
        progress: {
          current: 45,
          target: 100,
        },
      },
    ],
  },

  // Proposals Category
  {
    id: "ach-proposals",
    title: "Proposal Pro",
    description: "Submit proposals and demonstrate your commitment",
    category: "proposals",
    totalProgress: {
      current: 12,
      target: 50,
    },
    badges: [
      {
        id: "badge-proposals-1",
        name: "First Submission",
        description: "Submit your very first proposal",
        icon: Target,
        color: "amber",
        tier: "bronze",
        earned: true,
        earnedDate: "2024-10-28T09:00:00Z",
        rarity: "common",
      },
      {
        id: "badge-proposals-5",
        name: "Getting Serious",
        description: "Submit 5 proposals",
        icon: Target,
        color: "gray",
        tier: "silver",
        earned: true,
        earnedDate: "2024-11-20T16:00:00Z",
        rarity: "common",
      },
      {
        id: "badge-proposals-10",
        name: "Consistent Submitter",
        description: "Reach 10 proposal submissions",
        icon: Target,
        color: "yellow",
        tier: "gold",
        earned: true,
        earnedDate: "2024-12-10T11:00:00Z",
        rarity: "rare",
      },
      {
        id: "badge-proposals-25",
        name: "Proposal Machine",
        description: "Submit 25 proposals",
        icon: Target,
        color: "purple",
        tier: "platinum",
        earned: false,
        rarity: "epic",
        progress: {
          current: 12,
          target: 25,
        },
      },
    ],
  },

  // Wins Category
  {
    id: "ach-wins",
    title: "Victory Lane",
    description: "Win competitive opportunities and grow your business",
    category: "wins",
    totalProgress: {
      current: 5,
      target: 25,
    },
    badges: [
      {
        id: "badge-wins-1",
        name: "First Win",
        description: "Win your first opportunity",
        icon: Trophy,
        color: "amber",
        tier: "bronze",
        earned: true,
        earnedDate: "2024-11-05T10:00:00Z",
        rarity: "rare",
      },
      {
        id: "badge-wins-3",
        name: "Triple Threat",
        description: "Secure 3 won opportunities",
        icon: Trophy,
        color: "gray",
        tier: "silver",
        earned: true,
        earnedDate: "2024-12-01T15:00:00Z",
        rarity: "rare",
      },
      {
        id: "badge-wins-5",
        name: "High Five",
        description: "Celebrate 5 wins",
        icon: Trophy,
        color: "yellow",
        tier: "gold",
        earned: true,
        earnedDate: "2024-12-15T09:00:00Z",
        rarity: "epic",
      },
      {
        id: "badge-wins-10",
        name: "Double Digits",
        description: "Win 10 opportunities",
        icon: Trophy,
        color: "purple",
        tier: "platinum",
        earned: false,
        rarity: "legendary",
        progress: {
          current: 5,
          target: 10,
        },
      },
    ],
  },

  // Engagement Category
  {
    id: "ach-engagement",
    title: "Active Player",
    description: "Stay engaged and take action on opportunities",
    category: "engagement",
    totalProgress: {
      current: 37,
      target: 100,
    },
    badges: [
      {
        id: "badge-engagement-rate",
        name: "Quick Responder",
        description: "Maintain 70%+ engagement rate",
        icon: TrendingUp,
        color: "amber",
        tier: "bronze",
        earned: true,
        earnedDate: "2024-11-10T10:00:00Z",
        rarity: "common",
      },
      {
        id: "badge-engagement-streak",
        name: "7 Day Streak",
        description: "Take action every day for a week",
        icon: Flame,
        color: "gray",
        tier: "silver",
        earned: true,
        earnedDate: "2024-12-05T12:00:00Z",
        rarity: "rare",
      },
      {
        id: "badge-engagement-views",
        name: "Popular Property",
        description: "Get 100+ property views from agencies",
        icon: Eye,
        color: "yellow",
        tier: "gold",
        earned: false,
        rarity: "rare",
        progress: {
          current: 78,
          target: 100,
        },
      },
      {
        id: "badge-engagement-speed",
        name: "Lightning Fast",
        description: "Respond to 10 matches within 24 hours",
        icon: Rocket,
        color: "purple",
        tier: "platinum",
        earned: false,
        rarity: "epic",
        progress: {
          current: 7,
          target: 10,
        },
      },
    ],
  },

  // Special Category
  {
    id: "ach-special",
    title: "Elite Achievements",
    description: "Rare accomplishments for exceptional performance",
    category: "special",
    totalProgress: {
      current: 2,
      target: 10,
    },
    badges: [
      {
        id: "badge-special-hot-streak",
        name: "Hot Streak",
        description: "Get 3 hot matches (90%+) in one week",
        icon: Flame,
        color: "amber",
        tier: "bronze",
        earned: true,
        earnedDate: "2024-12-10T10:00:00Z",
        rarity: "rare",
      },
      {
        id: "badge-special-perfect-week",
        name: "Perfect Week",
        description: "Win 100% of proposals submitted in one week",
        icon: Star,
        color: "yellow",
        tier: "gold",
        earned: false,
        rarity: "legendary",
        progress: {
          current: 0,
          target: 1,
        },
      },
      {
        id: "badge-special-top-performer",
        name: "Top Performer",
        description: "Have a property ranked #1 in performance",
        icon: Award,
        color: "purple",
        tier: "platinum",
        earned: true,
        earnedDate: "2024-12-01T10:00:00Z",
        rarity: "epic",
      },
      {
        id: "badge-special-million-dollar",
        name: "Million Dollar Deal",
        description: "Win an opportunity worth $1M+",
        icon: Trophy,
        color: "purple",
        tier: "platinum",
        earned: false,
        rarity: "legendary",
        progress: {
          current: 0,
          target: 1,
        },
      },
    ],
  },
];

// Calculate totals
export const calculateBadgeStats = () => {
  let totalBadges = 0;
  let totalEarned = 0;

  mockAchievements.forEach((achievement) => {
    totalBadges += achievement.badges.length;
    totalEarned += achievement.badges.filter((b) => b.earned).length;
  });

  return { totalBadges, totalEarned };
};
