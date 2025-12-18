// Mock data for Match Queue

export interface MatchRequirement {
  label: string;
  userValue: string;
  requiredValue: string;
  status: "perfect" | "good" | "warning" | "mismatch";
}

export interface OpportunityMatch {
  id: string;
  solicitation_number: string;
  title: string;
  agency: string;
  department: string;
  location: {
    city: string;
    state: string;
  };
  response_deadline: string;
  match_score: number;
  estimated_value?: {
    min: number;
    max: number;
  };
  requirements: MatchRequirement[];
  property_title: string;
  status?: "new" | "viewed" | "interested" | "passed" | "saved";
  is_hot_match?: boolean;
}

export const mockNewMatches: OpportunityMatch[] = [
  {
    id: "match-1",
    solicitation_number: "47PA0025R0001",
    title: "GSA Lease - Office Space in Washington DC Metro Area, 125,000 SF",
    agency: "GSA",
    department: "General Services Administration - Public Buildings Service",
    location: {
      city: "Washington",
      state: "DC",
    },
    response_deadline: "2025-02-15T17:00:00Z",
    match_score: 94,
    estimated_value: {
      min: 6000000,
      max: 7500000,
    },
    property_title: "Downtown Federal Building",
    status: "new",
    is_hot_match: true,
    requirements: [
      {
        label: "Square Footage",
        userValue: "125,000 SF available",
        requiredValue: "120,000-130,000 SF required",
        status: "perfect",
      },
      {
        label: "Location",
        userValue: "Washington, DC",
        requiredValue: "DC Metro Area",
        status: "perfect",
      },
      {
        label: "Budget Match",
        userValue: "$48.50/SF asking rent",
        requiredValue: "$45-50/SF budget range",
        status: "good",
      },
      {
        label: "Security Clearance",
        userValue: "SCIF-ready facility",
        requiredValue: "Security clearance required",
        status: "perfect",
      },
      {
        label: "Availability",
        userValue: "Available March 1, 2025",
        requiredValue: "Needed February 15, 2025",
        status: "warning",
      },
      {
        label: "Building Class",
        userValue: "Class A office",
        requiredValue: "Class A or B+ preferred",
        status: "perfect",
      },
    ],
  },
  {
    id: "match-2",
    solicitation_number: "47PA0025R0089",
    title: "Department of State Consular Services Office - Rosslyn VA, 75,000 SF",
    agency: "State",
    department: "Department of State - Bureau of Consular Affairs",
    location: {
      city: "Arlington",
      state: "VA",
    },
    response_deadline: "2025-03-15T17:00:00Z",
    match_score: 92,
    estimated_value: {
      min: 3800000,
      max: 4500000,
    },
    property_title: "Rosslyn Tower",
    status: "new",
    is_hot_match: true,
    requirements: [
      {
        label: "Square Footage",
        userValue: "75,000 SF available",
        requiredValue: "70,000-80,000 SF required",
        status: "perfect",
      },
      {
        label: "Location",
        userValue: "Arlington (Rosslyn), VA",
        requiredValue: "Rosslyn area preferred",
        status: "perfect",
      },
      {
        label: "Public Access",
        userValue: "Ground floor entrance available",
        requiredValue: "Public-facing space needed",
        status: "perfect",
      },
      {
        label: "Rent Rate",
        userValue: "$46.50/SF",
        requiredValue: "$44-48/SF budget",
        status: "good",
      },
      {
        label: "Metro Proximity",
        userValue: "0.2 miles to Rosslyn Metro",
        requiredValue: "Within 0.5 miles of Metro",
        status: "perfect",
      },
    ],
  },
  {
    id: "match-3",
    solicitation_number: "47PA0025R0034",
    title: "Defense Information Systems Agency Office Lease - Arlington VA",
    agency: "DOD",
    department: "Department of Defense - Defense Information Systems Agency",
    location: {
      city: "Arlington",
      state: "VA",
    },
    response_deadline: "2025-02-28T17:00:00Z",
    match_score: 91,
    estimated_value: {
      min: 2100000,
      max: 2800000,
    },
    property_title: "Arlington Office Complex",
    status: "new",
    is_hot_match: false,
    requirements: [
      {
        label: "Square Footage",
        userValue: "42,000 SF available",
        requiredValue: "40,000-45,000 SF required",
        status: "perfect",
      },
      {
        label: "Security Requirements",
        userValue: "SCIF capable, redundant power",
        requiredValue: "SCIF requirements, backup power",
        status: "perfect",
      },
      {
        label: "Location",
        userValue: "Arlington, VA",
        requiredValue: "Arlington or Crystal City",
        status: "perfect",
      },
      {
        label: "Availability",
        userValue: "February 15, 2025",
        requiredValue: "March 1, 2025 or earlier",
        status: "perfect",
      },
    ],
  },
  {
    id: "match-4",
    solicitation_number: "47PA0025R0056",
    title: "NIH Medical Research Facility Lease - Bethesda MD, 65,000 SF",
    agency: "HHS",
    department: "Department of Health and Human Services - National Institutes of Health",
    location: {
      city: "Bethesda",
      state: "MD",
    },
    response_deadline: "2025-03-01T17:00:00Z",
    match_score: 89,
    estimated_value: {
      min: 3500000,
      max: 4200000,
    },
    property_title: "Bethesda Medical Office",
    status: "viewed",
    is_hot_match: false,
    requirements: [
      {
        label: "Square Footage",
        userValue: "65,000 SF medical office",
        requiredValue: "60,000-70,000 SF required",
        status: "perfect",
      },
      {
        label: "Facility Type",
        userValue: "Medical office building",
        requiredValue: "Medical/research facility",
        status: "perfect",
      },
      {
        label: "Biosafety Level",
        userValue: "BSL-2 compliant",
        requiredValue: "BSL-2 capability required",
        status: "perfect",
      },
      {
        label: "Location",
        userValue: "Bethesda, MD",
        requiredValue: "Within 5 miles of NIH campus",
        status: "good",
      },
      {
        label: "Parking",
        userValue: "150 parking spaces",
        requiredValue: "200+ spaces preferred",
        status: "warning",
      },
    ],
  },
  {
    id: "match-5",
    solicitation_number: "47PA0025R0078",
    title: "Library of Congress Administrative Offices - Capitol Hill DC",
    agency: "LOC",
    department: "Library of Congress - Office of the Librarian",
    location: {
      city: "Washington",
      state: "DC",
    },
    response_deadline: "2025-01-30T17:00:00Z",
    match_score: 86,
    estimated_value: {
      min: 1200000,
      max: 1500000,
    },
    property_title: "Capitol Hill Office Building",
    status: "saved",
    is_hot_match: false,
    requirements: [
      {
        label: "Square Footage",
        userValue: "22,500 SF available",
        requiredValue: "20,000-25,000 SF required",
        status: "perfect",
      },
      {
        label: "Location",
        userValue: "Capitol Hill SE",
        requiredValue: "On or near Capitol Hill",
        status: "perfect",
      },
      {
        label: "Proximity",
        userValue: "0.8 miles to LOC",
        requiredValue: "Within 1 mile of Library facilities",
        status: "good",
      },
      {
        label: "Building Class",
        userValue: "Class B+",
        requiredValue: "Class B or better",
        status: "good",
      },
    ],
  },
  {
    id: "match-6",
    solicitation_number: "47PA0025R0112",
    title: "EPA Regional Office Expansion - Arlington VA, 55,000 SF",
    agency: "EPA",
    department: "Environmental Protection Agency - Region 3",
    location: {
      city: "Arlington",
      state: "VA",
    },
    response_deadline: "2025-03-20T17:00:00Z",
    match_score: 88,
    estimated_value: {
      min: 2800000,
      max: 3200000,
    },
    property_title: "Arlington Office Complex",
    status: "new",
    is_hot_match: false,
    requirements: [
      {
        label: "Square Footage",
        userValue: "42,000 SF (can expand to 55K)",
        requiredValue: "55,000 SF minimum",
        status: "warning",
      },
      {
        label: "LEED Certification",
        userValue: "LEED Gold certified",
        requiredValue: "LEED Silver or better",
        status: "perfect",
      },
      {
        label: "Location",
        userValue: "Arlington, VA",
        requiredValue: "DC Metro Area",
        status: "perfect",
      },
      {
        label: "Green Building",
        userValue: "Energy Star rated, solar panels",
        requiredValue: "Sustainability features required",
        status: "perfect",
      },
    ],
  },
];
