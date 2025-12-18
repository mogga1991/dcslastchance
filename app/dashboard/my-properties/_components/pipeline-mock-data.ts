// Mock data for Opportunity Pipeline

export interface PipelineOpportunity {
  id: string;
  solicitation_number: string;
  title: string;
  agency: string;
  property_title: string;
  match_score: number;
  response_deadline: string;
  estimated_value?: {
    min: number;
    max: number;
  };
  stage: "new" | "interested" | "proposal-prep" | "submitted" | "under-review" | "won" | "lost";
  added_date: string;
}

export const mockPipelineOpportunities: PipelineOpportunity[] = [
  // New Matches
  {
    id: "pipe-1",
    solicitation_number: "47PA0025R0201",
    title: "FBI Field Office Lease - Washington DC, 85,000 SF",
    agency: "FBI",
    property_title: "Downtown Federal Building",
    match_score: 93,
    response_deadline: "2025-02-20T17:00:00Z",
    estimated_value: {
      min: 5200000,
      max: 6800000,
    },
    stage: "new",
    added_date: "2024-12-17T08:00:00Z",
  },
  {
    id: "pipe-2",
    solicitation_number: "47PA0025R0202",
    title: "DOT Regional Office - Arlington VA, 45,000 SF",
    agency: "DOT",
    property_title: "Arlington Office Complex",
    match_score: 88,
    response_deadline: "2025-03-05T17:00:00Z",
    estimated_value: {
      min: 2300000,
      max: 2900000,
    },
    stage: "new",
    added_date: "2024-12-16T14:00:00Z",
  },

  // Interested
  {
    id: "pipe-3",
    solicitation_number: "47PA0025R0001",
    title: "GSA Lease - Office Space in Washington DC Metro Area, 125,000 SF",
    agency: "GSA",
    property_title: "Downtown Federal Building",
    match_score: 94,
    response_deadline: "2025-02-15T17:00:00Z",
    estimated_value: {
      min: 6000000,
      max: 7500000,
    },
    stage: "interested",
    added_date: "2024-12-01T09:00:00Z",
  },
  {
    id: "pipe-4",
    solicitation_number: "47PA0025R0089",
    title: "Department of State Consular Services Office - Rosslyn VA",
    agency: "State",
    property_title: "Rosslyn Tower",
    match_score: 92,
    response_deadline: "2025-03-15T17:00:00Z",
    estimated_value: {
      min: 3800000,
      max: 4500000,
    },
    stage: "interested",
    added_date: "2024-12-10T09:00:00Z",
  },
  {
    id: "pipe-5",
    solicitation_number: "47PA0025R0034",
    title: "Defense Information Systems Agency Office Lease",
    agency: "DOD",
    property_title: "Arlington Office Complex",
    match_score: 91,
    response_deadline: "2025-02-28T17:00:00Z",
    estimated_value: {
      min: 2100000,
      max: 2800000,
    },
    stage: "interested",
    added_date: "2024-11-28T08:30:00Z",
  },

  // Preparing Proposal
  {
    id: "pipe-6",
    solicitation_number: "47PA0025R0156",
    title: "USDA Forest Service Regional HQ - MD, 60,000 SF",
    agency: "USDA",
    property_title: "Bethesda Medical Office",
    match_score: 87,
    response_deadline: "2025-02-10T17:00:00Z",
    estimated_value: {
      min: 3200000,
      max: 3800000,
    },
    stage: "proposal-prep",
    added_date: "2024-11-15T11:00:00Z",
  },
  {
    id: "pipe-7",
    solicitation_number: "47PA0025R0178",
    title: "VA Medical Center Administrative Office - DC",
    agency: "VA",
    property_title: "Capitol Hill Office Building",
    match_score: 85,
    response_deadline: "2025-01-25T17:00:00Z",
    estimated_value: {
      min: 1800000,
      max: 2200000,
    },
    stage: "proposal-prep",
    added_date: "2024-11-20T10:00:00Z",
  },

  // Submitted
  {
    id: "pipe-8",
    solicitation_number: "47PA0024R0445",
    title: "NASA Goddard Space Flight Center Office Annex",
    agency: "NASA",
    property_title: "Bethesda Medical Office",
    match_score: 90,
    response_deadline: "2025-01-15T17:00:00Z",
    estimated_value: {
      min: 4100000,
      max: 4900000,
    },
    stage: "submitted",
    added_date: "2024-10-28T09:00:00Z",
  },
  {
    id: "pipe-9",
    solicitation_number: "47PA0024R0467",
    title: "Treasury Department Regional Office - Arlington",
    agency: "Treasury",
    property_title: "Arlington Office Complex",
    match_score: 89,
    response_deadline: "2024-12-20T17:00:00Z",
    estimated_value: {
      min: 2500000,
      max: 3100000,
    },
    stage: "submitted",
    added_date: "2024-10-15T14:00:00Z",
  },

  // Under Review
  {
    id: "pipe-10",
    solicitation_number: "47PA0024R0398",
    title: "SEC Regional Examination Office - DC Metro",
    agency: "SEC",
    property_title: "Downtown Federal Building",
    match_score: 91,
    response_deadline: "2024-12-01T17:00:00Z",
    estimated_value: {
      min: 5500000,
      max: 6200000,
    },
    stage: "under-review",
    added_date: "2024-09-20T08:00:00Z",
  },
  {
    id: "pipe-11",
    solicitation_number: "47PA0024R0412",
    title: "FEMA Regional Office Expansion - VA",
    agency: "FEMA",
    property_title: "Rosslyn Tower",
    match_score: 88,
    response_deadline: "2024-11-25T17:00:00Z",
    estimated_value: {
      min: 3600000,
      max: 4200000,
    },
    stage: "under-review",
    added_date: "2024-09-15T11:00:00Z",
  },

  // Won
  {
    id: "pipe-12",
    solicitation_number: "47PA0024R0301",
    title: "DOE Energy Information Administration Office",
    agency: "DOE",
    property_title: "Downtown Federal Building",
    match_score: 95,
    response_deadline: "2024-10-15T17:00:00Z",
    estimated_value: {
      min: 4800000,
      max: 5400000,
    },
    stage: "won",
    added_date: "2024-08-01T09:00:00Z",
  },
  {
    id: "pipe-13",
    solicitation_number: "47PA0024R0289",
    title: "Small Business Administration Regional Office",
    agency: "SBA",
    property_title: "Capitol Hill Office Building",
    match_score: 87,
    response_deadline: "2024-09-30T17:00:00Z",
    estimated_value: {
      min: 1500000,
      max: 1800000,
    },
    stage: "won",
    added_date: "2024-07-15T10:00:00Z",
  },
];
