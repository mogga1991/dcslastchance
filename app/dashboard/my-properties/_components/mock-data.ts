// Mock data for My Properties page development

export interface BrokerListing {
  id: string;
  title: string | null;
  street_address: string;
  city: string;
  state: string;
  zipcode: string;
  total_sf: number;
  available_sf: number;
  asking_rent_sf: number | null;
  property_type: string | null;
  building_class: string | null;
  status: string;
  federal_score: number | null;
  views_count: number | null;
  created_at: string;
  available_date: string;
}

export interface SavedOpportunity {
  id: string;
  solicitation_number: string;
  title: string;
  agency: string;
  department: string;
  office: string;
  response_deadline: string;
  posted_date: string;
  place_of_performance: {
    city: string;
    state: string;
  };
  naics_code: string;
  set_aside: string;
  description: string;
  estimated_value?: {
    min: number;
    max: number;
  };
  saved_at: string;
  match_score?: number;
}

export interface PropertyMatch {
  property_id: string;
  opportunity_count: number;
  best_match_score: number;
  opportunities: Array<{
    id: string;
    solicitation_number: string;
    title: string;
    agency: string;
    match_score: number;
  }>;
}

export const mockProperties: BrokerListing[] = [
  {
    id: "1",
    title: "Downtown Federal Building",
    street_address: "1500 Pennsylvania Avenue NW",
    city: "Washington",
    state: "DC",
    zipcode: "20004",
    total_sf: 125000,
    available_sf: 125000,
    asking_rent_sf: 48.5,
    property_type: "Office",
    building_class: "A",
    status: "active",
    federal_score: 92,
    views_count: 245,
    created_at: "2024-11-15T10:30:00Z",
    available_date: "2025-03-01",
  },
  {
    id: "2",
    title: "Arlington Office Complex",
    street_address: "2200 Wilson Boulevard",
    city: "Arlington",
    state: "VA",
    zipcode: "22201",
    total_sf: 85000,
    available_sf: 42000,
    asking_rent_sf: 42.0,
    property_type: "Office",
    building_class: "A",
    status: "active",
    federal_score: 88,
    views_count: 189,
    created_at: "2024-11-10T14:20:00Z",
    available_date: "2025-02-15",
  },
  {
    id: "3",
    title: "Bethesda Medical Office",
    street_address: "7315 Wisconsin Avenue",
    city: "Bethesda",
    state: "MD",
    zipcode: "20814",
    total_sf: 65000,
    available_sf: 65000,
    asking_rent_sf: 52.0,
    property_type: "Medical Office",
    building_class: "A",
    status: "active",
    federal_score: 85,
    views_count: 156,
    created_at: "2024-11-05T09:15:00Z",
    available_date: "2025-04-01",
  },
  {
    id: "4",
    title: "Capitol Hill Office Building",
    street_address: "500 East Capitol Street SE",
    city: "Washington",
    state: "DC",
    zipcode: "20003",
    total_sf: 45000,
    available_sf: 22500,
    asking_rent_sf: 45.0,
    property_type: "Office",
    building_class: "B+",
    status: "active",
    federal_score: 79,
    views_count: 98,
    created_at: "2024-10-28T11:45:00Z",
    available_date: "2025-01-15",
  },
  {
    id: "5",
    title: "Rosslyn Tower",
    street_address: "1812 North Moore Street",
    city: "Arlington",
    state: "VA",
    zipcode: "22209",
    total_sf: 150000,
    available_sf: 75000,
    asking_rent_sf: 46.5,
    property_type: "Office",
    building_class: "A",
    status: "pending",
    federal_score: 90,
    views_count: 312,
    created_at: "2024-10-20T16:00:00Z",
    available_date: "2025-05-01",
  },
];

export const mockMatches: Record<string, PropertyMatch> = {
  "1": {
    property_id: "1",
    opportunity_count: 8,
    best_match_score: 94,
    opportunities: [
      {
        id: "opp-1",
        solicitation_number: "47PA0025R0001",
        title: "GSA Lease - Office Space in Washington DC Metro Area",
        agency: "General Services Administration",
        match_score: 94,
      },
      {
        id: "opp-2",
        solicitation_number: "47PA0025R0012",
        title: "Department of Commerce Office Consolidation",
        agency: "Department of Commerce",
        match_score: 88,
      },
      {
        id: "opp-3",
        solicitation_number: "47PA0025R0023",
        title: "Federal Judiciary Office Space - DC Circuit",
        agency: "Administrative Office of US Courts",
        match_score: 85,
      },
    ],
  },
  "2": {
    property_id: "2",
    opportunity_count: 6,
    best_match_score: 91,
    opportunities: [
      {
        id: "opp-4",
        solicitation_number: "47PA0025R0034",
        title: "Defense Information Systems Agency Office Lease",
        agency: "Department of Defense",
        match_score: 91,
      },
      {
        id: "opp-5",
        solicitation_number: "47PA0025R0045",
        title: "GSA Regional Office Expansion - Arlington VA",
        agency: "General Services Administration",
        match_score: 87,
      },
    ],
  },
  "3": {
    property_id: "3",
    opportunity_count: 4,
    best_match_score: 89,
    opportunities: [
      {
        id: "opp-6",
        solicitation_number: "47PA0025R0056",
        title: "NIH Medical Research Facility Lease",
        agency: "National Institutes of Health",
        match_score: 89,
      },
      {
        id: "opp-7",
        solicitation_number: "47PA0025R0067",
        title: "FDA Regional Laboratory Space",
        agency: "Food and Drug Administration",
        match_score: 82,
      },
    ],
  },
  "4": {
    property_id: "4",
    opportunity_count: 5,
    best_match_score: 86,
    opportunities: [
      {
        id: "opp-8",
        solicitation_number: "47PA0025R0078",
        title: "Library of Congress Administrative Offices",
        agency: "Library of Congress",
        match_score: 86,
      },
    ],
  },
  "5": {
    property_id: "5",
    opportunity_count: 7,
    best_match_score: 92,
    opportunities: [
      {
        id: "opp-9",
        solicitation_number: "47PA0025R0089",
        title: "Department of State Consular Services Office",
        agency: "Department of State",
        match_score: 92,
      },
      {
        id: "opp-10",
        solicitation_number: "47PA0025R0090",
        title: "GSA Office of Governmentwide Policy Lease",
        agency: "General Services Administration",
        match_score: 88,
      },
    ],
  },
};

export const mockSavedOpportunities: SavedOpportunity[] = [
  {
    id: "saved-1",
    solicitation_number: "47PA0025R0001",
    title: "GSA Lease - Office Space in Washington DC Metro Area, 125,000 SF",
    agency: "GSA",
    department: "General Services Administration",
    office: "Public Buildings Service",
    response_deadline: "2025-02-15T17:00:00Z",
    posted_date: "2024-12-01T09:00:00Z",
    place_of_performance: {
      city: "Washington",
      state: "DC",
    },
    naics_code: "531120",
    set_aside: "Total Small Business Set-Aside",
    description:
      "The General Services Administration (GSA) seeks to lease approximately 125,000 rentable square feet of office space in Washington, DC. The space must be within the central business district and meet specific security and accessibility requirements.",
    estimated_value: {
      min: 6000000,
      max: 7500000,
    },
    saved_at: "2024-12-10T14:30:00Z",
    match_score: 94,
  },
  {
    id: "saved-2",
    solicitation_number: "47PA0025R0056",
    title: "NIH Medical Research Facility Lease - Bethesda MD, 65,000 SF",
    agency: "HHS",
    department: "Department of Health and Human Services",
    office: "National Institutes of Health",
    response_deadline: "2025-03-01T17:00:00Z",
    posted_date: "2024-12-05T10:00:00Z",
    place_of_performance: {
      city: "Bethesda",
      state: "MD",
    },
    naics_code: "531120",
    set_aside: "8(a) Set-Aside",
    description:
      "NIH requires approximately 65,000 SF of medical office/research space in Bethesda, Maryland. The facility must accommodate specialized medical equipment and meet strict biosafety level requirements.",
    estimated_value: {
      min: 3500000,
      max: 4200000,
    },
    saved_at: "2024-12-12T11:15:00Z",
    match_score: 89,
  },
  {
    id: "saved-3",
    solicitation_number: "47PA0025R0034",
    title: "Defense Information Systems Agency Office Lease - Arlington VA",
    agency: "DOD",
    department: "Department of Defense",
    office: "Defense Information Systems Agency",
    response_deadline: "2025-02-28T17:00:00Z",
    posted_date: "2024-11-28T08:30:00Z",
    place_of_performance: {
      city: "Arlington",
      state: "VA",
    },
    naics_code: "531120",
    set_aside: "Unrestricted",
    description:
      "DISA seeks approximately 42,000 SF of office space in Arlington, VA for administrative and technical operations. Space must meet SCIF requirements and have redundant power systems.",
    estimated_value: {
      min: 2100000,
      max: 2800000,
    },
    saved_at: "2024-12-08T16:45:00Z",
    match_score: 91,
  },
  {
    id: "saved-4",
    solicitation_number: "47PA0025R0089",
    title: "Department of State Consular Services Office - Rosslyn VA, 75,000 SF",
    agency: "State",
    department: "Department of State",
    office: "Bureau of Consular Affairs",
    response_deadline: "2025-03-15T17:00:00Z",
    posted_date: "2024-12-10T09:00:00Z",
    place_of_performance: {
      city: "Arlington",
      state: "VA",
    },
    naics_code: "531120",
    set_aside: "Unrestricted",
    description:
      "The Department of State requires 75,000 SF of office space in the Rosslyn area for consular services operations. Space must accommodate public-facing areas and secure processing facilities.",
    estimated_value: {
      min: 3800000,
      max: 4500000,
    },
    saved_at: "2024-12-14T10:20:00Z",
    match_score: 92,
  },
  {
    id: "saved-5",
    solicitation_number: "47PA0025R0078",
    title: "Library of Congress Administrative Offices - Capitol Hill DC",
    agency: "LOC",
    department: "Library of Congress",
    office: "Office of the Librarian",
    response_deadline: "2025-01-30T17:00:00Z",
    posted_date: "2024-11-25T13:00:00Z",
    place_of_performance: {
      city: "Washington",
      state: "DC",
    },
    naics_code: "531120",
    set_aside: "Small Business Set-Aside",
    description:
      "The Library of Congress seeks approximately 22,500 SF of office space on or near Capitol Hill for administrative staff. Space should be in close proximity to existing Library facilities.",
    estimated_value: {
      min: 1200000,
      max: 1500000,
    },
    saved_at: "2024-12-06T09:30:00Z",
    match_score: 86,
  },
];
