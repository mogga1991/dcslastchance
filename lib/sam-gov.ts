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
  // Additional properties used in the application
  fullParentPathName?: string;
  modifiedDate?: string;
}

export interface SAMResponse {
  totalRecords: number;
  limit: number;
  offset: number;
  opportunitiesData: SAMOpportunity[];
}

/**
 * GSA Lease Opportunity Filters (Optimized for maximum recall)
 *
 * Based on best practices for finding office lease solicitations on SAM.gov
 * Uses PSC codes (more accurate than dept/subtier for leasing)
 */
/**
 * Official GSA Leasing Portal Filter Criteria
 *
 * These filters match the exact criteria used by the official GSA Lease Contract
 * Opportunities Map at leasing.gsa.gov
 *
 * Reference: https://leasing.gsa.gov/leasing/s/lease-contract-opportunities-map
 */
export const GSA_LEASE_FILTERS = {
  // Department filter (matches official GSA portal)
  department: "GENERAL SERVICES ADMINISTRATION",

  // Sub-tier filter (matches official GSA portal)
  subTier: "PUBLIC BUILDINGS SERVICE",

  // NAICS Code: 531120 - Lessors of Nonresidential Buildings (except Miniwarehouses)
  naicsCode: "531120",

  // Notice Types (matches official GSA portal)
  noticeTypes: [
    "o", // Combined Synopsis/Solicitation
    "p", // Presolicitation
    "k", // Solicitation
    "r", // Sources Sought
    "s", // Special Notice
  ],

  // Response date filter: >= today (only active opportunities)
  filterByResponseDate: true,
};

/**
 * Fetches GSA lease opportunities from SAM.gov API
 *
 * Uses the EXACT same filters as the official GSA Lease Contract Opportunities Map:
 * - Department: General Services Administration
 * - Sub-tier: Public Buildings Service
 * - NAICS: 531120 (Lessors of Nonresidential Buildings)
 * - Response Date: >= today (only active opportunities)
 *
 * Reference: https://leasing.gsa.gov/leasing/s/lease-contract-opportunities-map
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

  // Calculate date range (SAM.gov API max is 1 year, use 6 months to be safe)
  const formatDate = (date: Date) => {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const y = date.getFullYear();
    return `${m}/${d}/${y}`;
  };

  // Default to 6-month rolling window
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);

  const defaultFrom = formatDate(sixMonthsAgo);
  const defaultTo = formatDate(today);

  try {
    // Build query using official GSA Leasing Portal filters
    const queryParams = new URLSearchParams({
      api_key: apiKey,

      // Date range
      postedFrom: params.postedFrom || defaultFrom,
      postedTo: params.postedTo || defaultTo,

      // Official GSA filters (matches leasing.gsa.gov)
      deptname: GSA_LEASE_FILTERS.department,
      subtier: GSA_LEASE_FILTERS.subTier,
      ncode: GSA_LEASE_FILTERS.naicsCode,

      // Notice types
      ptype: GSA_LEASE_FILTERS.noticeTypes.join(","),

      // Response date filter (only active opportunities)
      rdlfrom: formatDate(today),

      // Pagination
      limit: String(params.limit || 1000),
      offset: String(params.offset || 0),

      // Optional location filters
      ...(params.state && { state: params.state }),
      ...(params.city && { city: params.city }),
    });

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

    // Sort by posted date (newest first)
    const sortedOpportunities = (data.opportunitiesData || [])
      .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());

    return {
      totalRecords: data.totalRecords,
      limit: data.limit,
      offset: data.offset,
      opportunitiesData: sortedOpportunities,
    };
  } catch (error) {
    console.error("Error fetching SAM.gov lease opportunities:", error);
    throw error;
  }
}

/**
 * Alias for backward compatibility
 */
export const fetchFederalLeaseOpportunities = fetchGSALeaseOpportunities;

/**
 * Fetches ALL contract opportunities from SAM.gov API (not just leasing)
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
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
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
 * Fetches opportunities by keyword search (e.g., "RLP" for Request for Lease Proposals)
 * This casts a wider net than PSC code filtering
 *
 * @param keyword - The search keyword (e.g., "RLP", "lease", etc.)
 * @param params - Additional query parameters
 * @returns Promise<SAMResponse>
 */
export async function fetchOpportunitiesByKeyword(
  keyword: string,
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

  // Calculate date range (default to last 6 months)
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);

  const formatDate = (date: Date) => {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const y = date.getFullYear();
    return `${m}/${d}/${y}`;
  };

  const defaultFrom = formatDate(sixMonthsAgo);
  const defaultTo = formatDate(today);

  // Notice types relevant to leasing
  const noticeTypes = [
    "r", // Sources Sought
    "p", // Presolicitation
    "o", // Combined Synopsis/Solicitation
    "k", // Solicitation
    "s", // Special Notice
  ];

  const queryParams = new URLSearchParams({
    api_key: apiKey,

    // Keyword search
    qterms: keyword,

    // Date range
    postedFrom: params.postedFrom || defaultFrom,
    postedTo: params.postedTo || defaultTo,

    // Notice types
    ptype: noticeTypes.join(","),

    // Pagination
    limit: String(params.limit || 1000),
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
    console.error(`Error fetching opportunities for keyword "${keyword}":`, error);
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
