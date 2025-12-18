// Mock data for Property Performance Dashboard

export interface PropertyPerformance {
  property_id: string;
  property_title: string;
  property_address: string;
  total_matches: number;
  high_quality_matches: number; // >85%
  medium_quality_matches: number; // 70-85%
  low_quality_matches: number; // <70%
  viewed_count: number;
  interested_count: number;
  proposals_submitted: number;
  won_count: number;
  total_views: number;
  avg_match_score: number;
  engagement_rate: number; // % of matches acted upon
  conversion_rate: number; // % of interested that became proposals
  win_rate: number; // % of submitted that won
  trend: "up" | "down" | "stable";
  weekly_new_matches: number;
  monthly_revenue_potential: number;
}

export const mockPropertyPerformances: PropertyPerformance[] = [
  {
    property_id: "1",
    property_title: "Downtown Federal Building",
    property_address: "1500 Pennsylvania Avenue NW, Washington, DC 20004",
    total_matches: 45,
    high_quality_matches: 28, // 62%
    medium_quality_matches: 12, // 27%
    low_quality_matches: 5, // 11%
    viewed_count: 42,
    interested_count: 18,
    proposals_submitted: 12,
    won_count: 5,
    total_views: 245,
    avg_match_score: 89,
    engagement_rate: 82, // 37/45 acted upon
    conversion_rate: 67, // 12/18 interested became proposals
    win_rate: 42, // 5/12 proposals won
    trend: "up",
    weekly_new_matches: 8,
    monthly_revenue_potential: 2850000,
  },
  {
    property_id: "2",
    property_title: "Rosslyn Tower",
    property_address: "1812 North Moore Street, Arlington, VA 22209",
    total_matches: 38,
    high_quality_matches: 22,
    medium_quality_matches: 11,
    low_quality_matches: 5,
    viewed_count: 35,
    interested_count: 15,
    proposals_submitted: 9,
    won_count: 3,
    total_views: 312,
    avg_match_score: 87,
    engagement_rate: 76,
    conversion_rate: 60,
    win_rate: 33,
    trend: "up",
    weekly_new_matches: 7,
    monthly_revenue_potential: 2200000,
  },
  {
    property_id: "3",
    property_title: "Arlington Office Complex",
    property_address: "2200 Wilson Boulevard, Arlington, VA 22201",
    total_matches: 32,
    high_quality_matches: 18,
    medium_quality_matches: 10,
    low_quality_matches: 4,
    viewed_count: 30,
    interested_count: 12,
    proposals_submitted: 7,
    won_count: 2,
    total_views: 189,
    avg_match_score: 85,
    engagement_rate: 72,
    conversion_rate: 58,
    win_rate: 29,
    trend: "stable",
    weekly_new_matches: 6,
    monthly_revenue_potential: 1680000,
  },
  {
    property_id: "4",
    property_title: "Bethesda Medical Office",
    property_address: "7315 Wisconsin Avenue, Bethesda, MD 20814",
    total_matches: 24,
    high_quality_matches: 14,
    medium_quality_matches: 7,
    low_quality_matches: 3,
    viewed_count: 22,
    interested_count: 9,
    proposals_submitted: 5,
    won_count: 2,
    total_views: 156,
    avg_match_score: 83,
    engagement_rate: 67,
    conversion_rate: 56,
    win_rate: 40,
    trend: "up",
    weekly_new_matches: 4,
    monthly_revenue_potential: 1950000,
  },
  {
    property_id: "5",
    property_title: "Capitol Hill Office Building",
    property_address: "500 East Capitol Street SE, Washington, DC 20003",
    total_matches: 18,
    high_quality_matches: 8,
    medium_quality_matches: 6,
    low_quality_matches: 4,
    viewed_count: 16,
    interested_count: 7,
    proposals_submitted: 4,
    won_count: 1,
    total_views: 98,
    avg_match_score: 78,
    engagement_rate: 61,
    conversion_rate: 57,
    win_rate: 25,
    trend: "down",
    weekly_new_matches: 3,
    monthly_revenue_potential: 890000,
  },
];
