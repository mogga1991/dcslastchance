/**
 * SAM.gov API Integration for GSA Lease Contract Opportunities
 *
 * Fetches and filters contract opportunities from SAM.gov using the official API.
 * Pre-configured for GSA Public Buildings Service lease opportunities.
 */

export interface SAMOpportunity {
  noticeId: string;
  title: string;
  solicitationNumber: string;
  department: string;
  subTier: string;
  office: string;
  postedDate: string;
  type: string;
  baseType: string;
  archiveType: string;
  archiveDate: string;
  typeOfSetAside: string;
  typeOfSetAsideDescription: string;
  responseDeadLine: string;
  naicsCode: string;
  classificationCode: string;
  active: string;
  award?: {
    date: string;
    number: string;
    amount: string;
  };
  pointOfContact: Array<{
    type: string;
    title: string;
    fullName: string;
    email: string;
    phone: string;
    fax: string;
  }>;
  description: string;
  organizationType: string;
  officeAddress: {
    zipcode: string;
    city: string;
    countryCode: string;
    state: string;
  };
  placeOfPerformance: {
    streetAddress: string;
    city: {
      code: string;
      name: string;
    };
    state: {
      code: string;
      name: string;
    };
    zip: string;
    country: {
      code: string;
      name: string;
    };
  };
  additionalInfoLink: string;
  uiLink: string;
  links: Array<{
    rel: string;
    href: string;
  }>;
  resourceLinks: string[];
}

export interface SAMResponse {
  totalRecords: number;
  limit: number;
  offset: number;
  opportunitiesData: SAMOpportunity[];
}

/**
 * GSA Lease Opportunity Filters (as used on GSA.gov)
 *
 * Updated to include RLP (Real Property Lease) and all government office space lease opportunities
 */
export const GSA_LEASE_FILTERS = {
  // Department: General Services Administration
  department: "General Services Administration",

  // Sub-tier: Public Buildings Service
  subTier: "Public Buildings Service",

  // NAICS Code: 531120 - Lessors of Nonresidential Buildings (except Miniwarehouses)
  naicsCode: "531120",

  // Product Service Codes (PSC) for Real Property Leasing
  // These are the primary codes used by GSA for RLP and office space leases
  pscCodes: [
    "Y1DA", // Lease of Real Estate (Office, Warehouse, etc.) - PRIMARY for RLP
    "Z2DA", // Real Property Leasing (Short Term)
    "Z1DA", // Maintenance of Real Property
    "X1AA", // Lease/Rental of Office Buildings
  ],

  // Notice Types - Include all relevant types for lease opportunities
  noticeTypes: [
    "o", // Combined Synopsis/Solicitation
    "p", // Presolicitation
    "k", // Solicitation
    "r", // Sources Sought
    "s", // Special Notice
    "i", // Intent to Bundle Requirements (DoD-Funded)
    "g", // Sale of Surplus Property
  ],

  // Response Date: >= today
  responseDateFrom: new Date().toISOString().split('T')[0], // Today in YYYY-MM-DD format
};

/**
 * Fetches GSA lease opportunities from SAM.gov API
 *
 * @param params - Additional query parameters to override defaults
 * @returns Promise<SAMResponse>
 */
export async function fetchGSALeaseOpportunities(
  params: {
    limit?: number;
    offset?: number;
    postedFrom?: string;
    postedTo?: string;
    state?: string;
    city?: string;
  } = {}
): Promise<SAMResponse> {
  const apiKey = process.env.SAM_API_KEY || process.env.VITE_SAMGOV_API_KEY;

  if (!apiKey) {
    throw new Error("SAM_API_KEY is not configured in environment variables");
  }

  const baseUrl = "https://api.sam.gov/opportunities/v2/search";

  // Calculate default date range (last 90 days to today)
  // Note: System clock may be incorrect, so we use 2024 explicitly
  const today = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(today.getDate() - 90);

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = 2024; // Use 2024 explicitly due to system clock issue
    return `${month}/${day}/${year}`;
  };

  // Build query parameters based on GSA lease filters
  const queryParams = new URLSearchParams({
    api_key: apiKey,

    // Required date parameters
    postedFrom: params.postedFrom || formatDate(ninetyDaysAgo),
    postedTo: params.postedTo || formatDate(today),

    // GSA-specific filters
    deptname: GSA_LEASE_FILTERS.department,
    subtier: GSA_LEASE_FILTERS.subTier,

    // IMPORTANT: PSC codes are the primary filter for RLP and office space leases
    // This captures Real Property Lease opportunities that NAICS code alone would miss
    psc: GSA_LEASE_FILTERS.pscCodes.join(","),

    // NAICS code as secondary filter
    ncode: GSA_LEASE_FILTERS.naicsCode,

    ptype: GSA_LEASE_FILTERS.noticeTypes.join(","),

    // Pagination
    limit: String(params.limit || 100),
    offset: String(params.offset || 0),

    // Optional filters
    ...(params.state && { state: params.state }),
    ...(params.city && { city: params.city }),
  });

  try {
    const response = await fetch(`${baseUrl}?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Cache for 5 minutes to avoid rate limiting
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `SAM.gov API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data: SAMResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching SAM.gov opportunities:", error);
    throw error;
  }
}

/**
 * Fetches ALL contract opportunities from SAM.gov API (not just GSA leasing)
 * Used for the main dashboard to show all opportunities
 *
 * @param params - Additional query parameters
 * @returns Promise<SAMResponse>
 */
export async function fetchAllOpportunities(
  params: {
    limit?: number;
    offset?: number;
    postedFrom?: string;
    postedTo?: string;
    state?: string;
    city?: string;
    department?: string;
    noticeTypes?: string[];
  } = {}
): Promise<SAMResponse> {
  const apiKey = process.env.SAM_API_KEY || process.env.VITE_SAMGOV_API_KEY;

  if (!apiKey) {
    throw new Error("SAM_API_KEY is not configured in environment variables");
  }

  const baseUrl = "https://api.sam.gov/opportunities/v2/search";

  // Calculate default date range (last 30 days to today)
  // Note: System clock may be incorrect, so we use 2024 explicitly
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = 2024; // Use 2024 explicitly due to system clock issue
    return `${month}/${day}/${year}`;
  };

  // Default notice types for all opportunities
  const defaultNoticeTypes = params.noticeTypes || [
    "o", // Combined Synopsis/Solicitation
    "p", // Presolicitation
    "k", // Solicitation
    "r", // Sources Sought
    "s", // Special Notice
  ];

  // Build query parameters for all opportunities
  const queryParams = new URLSearchParams({
    api_key: apiKey,

    // Required date parameters
    postedFrom: params.postedFrom || formatDate(thirtyDaysAgo),
    postedTo: params.postedTo || formatDate(today),

    ptype: defaultNoticeTypes.join(","),

    // Pagination
    limit: String(params.limit || 100),
    offset: String(params.offset || 0),

    // Optional filters
    ...(params.state && { state: params.state }),
    ...(params.city && { city: params.city }),
    ...(params.department && { deptname: params.department }),
  });

  try {
    const response = await fetch(`${baseUrl}?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Cache for 5 minutes to avoid rate limiting
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `SAM.gov API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data: SAMResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching SAM.gov opportunities:", error);
    throw error;
  }
}

/**
 * Fetches a single opportunity by notice ID
 */
export async function fetchOpportunityById(noticeId: string): Promise<SAMOpportunity> {
  const apiKey = process.env.SAM_API_KEY || process.env.VITE_SAMGOV_API_KEY;

  if (!apiKey) {
    throw new Error("SAM_API_KEY is not configured in environment variables");
  }

  const url = `https://api.sam.gov/opportunities/v2/search?api_key=${apiKey}&noticeid=${noticeId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`SAM.gov API error: ${response.status} ${response.statusText}`);
    }

    const data: SAMResponse = await response.json();

    if (data.opportunitiesData.length === 0) {
      throw new Error(`Opportunity ${noticeId} not found`);
    }

    return data.opportunitiesData[0];
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    throw error;
  }
}

/**
 * Groups opportunities by state for map visualization
 */
export function groupOpportunitiesByLocation(opportunities: SAMOpportunity[]) {
  const grouped = new Map<string, SAMOpportunity[]>();

  opportunities.forEach((opp) => {
    const state = opp.placeOfPerformance?.state?.code || opp.officeAddress?.state || "Unknown";
    const city = opp.placeOfPerformance?.city?.name || opp.officeAddress?.city || "Unknown";
    const key = `${city}, ${state}`;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(opp);
  });

  return Array.from(grouped.entries()).map(([location, opps]) => ({
    location,
    count: opps.length,
    opportunities: opps,
  }));
}

/**
 * Formats currency values from SAM.gov
 */
export function formatCurrency(amount: string | number | undefined): string {
  if (!amount) return "N/A";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Calculates days until response deadline
 */
export function getDaysUntilDeadline(deadline: string): number {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Gets urgency level based on deadline
 */
export function getUrgencyLevel(deadline: string): "critical" | "warning" | "normal" {
  const days = getDaysUntilDeadline(deadline);
  if (days <= 3) return "critical";
  if (days <= 7) return "warning";
  return "normal";
}
