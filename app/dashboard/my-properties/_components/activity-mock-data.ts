// Mock data for Activity Feed

export interface ActivityItem {
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

const now = new Date();

export const mockActivities: ActivityItem[] = [
  // Today
  {
    id: "act-1",
    type: "high_score_match",
    title: "Hot Match Alert!",
    description: "New 94% match for FBI Field Office Lease",
    property_title: "Downtown Federal Building",
    match_score: 94,
    timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 min ago
    metadata: {
      agency: "FBI",
      value: 6000000,
    },
  },
  {
    id: "act-2",
    type: "property_viewed",
    title: "Property Getting Attention",
    description: "Rosslyn Tower received 12 views from federal agencies",
    property_title: "Rosslyn Tower",
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    metadata: {
      views: 12,
    },
  },
  {
    id: "act-3",
    type: "interested",
    title: "Marked as Interested",
    description: "You expressed interest in Department of State Consular Services Office",
    property_title: "Rosslyn Tower",
    match_score: 92,
    timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    metadata: {
      agency: "State Department",
      value: 4150000,
    },
  },
  {
    id: "act-4",
    type: "new_match",
    title: "New Opportunity Match",
    description: "DOT Regional Office matched with Arlington Office Complex",
    property_title: "Arlington Office Complex",
    match_score: 88,
    timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    metadata: {
      agency: "Department of Transportation",
      value: 2600000,
    },
  },

  // Yesterday
  {
    id: "act-5",
    type: "proposal_submitted",
    title: "Proposal Submitted",
    description: "Successfully submitted proposal for USDA Forest Service Regional HQ",
    property_title: "Bethesda Medical Office",
    match_score: 87,
    timestamp: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    metadata: {
      agency: "USDA",
      value: 3500000,
    },
  },
  {
    id: "act-6",
    type: "new_match",
    title: "3 New Matches Found",
    description: "Downtown Federal Building matched with 3 new GSA opportunities",
    property_title: "Downtown Federal Building",
    match_score: 89,
    timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "act-7",
    type: "saved",
    title: "Opportunity Saved",
    description: "Saved NIH Medical Research Facility Lease for later review",
    property_title: "Bethesda Medical Office",
    match_score: 89,
    timestamp: new Date(now.getTime() - 28 * 60 * 60 * 1000).toISOString(), // 28 hours ago
    metadata: {
      agency: "NIH",
      value: 3850000,
    },
  },

  // 2 days ago
  {
    id: "act-8",
    type: "won",
    title: "🎉 Opportunity Won!",
    description: "Your proposal for DOE Energy Information Administration Office was accepted!",
    property_title: "Downtown Federal Building",
    match_score: 95,
    timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      agency: "Department of Energy",
      value: 5100000,
    },
  },
  {
    id: "act-9",
    type: "interested",
    title: "Marked as Interested",
    description: "Expressed interest in Defense Information Systems Agency Office Lease",
    property_title: "Arlington Office Complex",
    match_score: 91,
    timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000).toISOString(),
    metadata: {
      agency: "DOD - DISA",
      value: 2450000,
    },
  },
  {
    id: "act-10",
    type: "property_viewed",
    title: "Property Views Increasing",
    description: "Capitol Hill Office Building gained 8 new views this week",
    property_title: "Capitol Hill Office Building",
    timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000).toISOString(),
    metadata: {
      views: 8,
    },
  },

  // 3 days ago
  {
    id: "act-11",
    type: "new_match",
    title: "New Match Found",
    description: "EPA Regional Office Expansion matched with Arlington Office Complex",
    property_title: "Arlington Office Complex",
    match_score: 88,
    timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      agency: "EPA",
      value: 3000000,
    },
  },
  {
    id: "act-12",
    type: "proposal_submitted",
    title: "Proposal Submitted",
    description: "Submitted proposal for Treasury Department Regional Office",
    property_title: "Arlington Office Complex",
    match_score: 89,
    timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
    metadata: {
      agency: "Treasury",
      value: 2800000,
    },
  },

  // 4 days ago
  {
    id: "act-13",
    type: "high_score_match",
    title: "Excellent Match Found",
    description: "92% match for Department of State Consular Services",
    property_title: "Rosslyn Tower",
    match_score: 92,
    timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      agency: "State Department",
      value: 4150000,
    },
  },
  {
    id: "act-14",
    type: "viewed",
    title: "Opportunity Viewed",
    description: "Reviewed GSA Lease for Office Space in Washington DC",
    property_title: "Downtown Federal Building",
    match_score: 94,
    timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000).toISOString(),
    metadata: {
      agency: "GSA",
      value: 6750000,
    },
  },

  // 5 days ago
  {
    id: "act-15",
    type: "won",
    title: "🏆 Another Win!",
    description: "Won Small Business Administration Regional Office lease",
    property_title: "Capitol Hill Office Building",
    match_score: 87,
    timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      agency: "SBA",
      value: 1650000,
    },
  },
  {
    id: "act-16",
    type: "interested",
    title: "Marked as Interested",
    description: "Showed interest in Library of Congress Administrative Offices",
    property_title: "Capitol Hill Office Building",
    match_score: 86,
    timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
    metadata: {
      agency: "Library of Congress",
      value: 1350000,
    },
  },

  // Last week
  {
    id: "act-17",
    type: "new_match",
    title: "Multiple New Matches",
    description: "Bethesda Medical Office matched with 5 new healthcare-related opportunities",
    property_title: "Bethesda Medical Office",
    match_score: 85,
    timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      agency: "HHS/NIH",
    },
  },
  {
    id: "act-18",
    type: "proposal_submitted",
    title: "Proposal Submitted",
    description: "Submitted for NASA Goddard Space Flight Center Office Annex",
    property_title: "Bethesda Medical Office",
    match_score: 90,
    timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      agency: "NASA",
      value: 4500000,
    },
  },
  {
    id: "act-19",
    type: "property_viewed",
    title: "High Interest Property",
    description: "Downtown Federal Building is trending with 45 views this week",
    property_title: "Downtown Federal Building",
    timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000).toISOString(),
    metadata: {
      views: 45,
    },
  },
  {
    id: "act-20",
    type: "saved",
    title: "Opportunity Saved",
    description: "Bookmarked SEC Regional Examination Office for review",
    property_title: "Downtown Federal Building",
    match_score: 91,
    timestamp: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      agency: "SEC",
      value: 5850000,
    },
  },
];
