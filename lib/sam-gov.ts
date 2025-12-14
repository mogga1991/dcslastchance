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
 * GSA Lease Opportunity Filters (Optimized for maximum recall)
 *
 * Based on best practices for finding office lease solicitations on SAM.gov
 * Uses PSC codes (more accurate than dept/subtier for leasing)
 */
export const GSA_LEASE_FILTERS = {
  // NAICS Code: 531120 - Lessors of Nonresidential Buildings (except Miniwarehouses)
  naicsCode: "531120",

  // PSC Codes for Office/Commercial Leasing (X1A series)
  // Note: SAM.gov API only accepts one PSC per request, so we'll need to make multiple calls
  pscCodes: [
    "X1AA", // Office Buildings (most common)
    "X1AB", // Administrative Buildings
    "X1AD", // Commercial Buildings
    "X1AF", // Mixed-Use Buildings
    "X1AZ", // Other Real Property
  ],

  // Notice Types (the ones leasing actually uses)
  noticeTypes: [
    "r", // Sources Sought (early market research)
    "p", // Presolicitation
    "o", // Combined Synopsis/Solicitation
    "k", // Solicitation
    "s", // Special Notice
  ],
};

/**
 * Fetches GSA lease opportunities from SAM.gov API
 * Makes multiple calls for each PSC code to maximize results
 * Includes response deadline filter to only show open opportunities
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

  // Calculate rolling 30-day window (best practice for daily ingestion)
  // Note: System clock may be incorrect, so we use 2024 explicitly
  const formatDate = (month: number, day: number, year: number) => {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${m}/${d}/${year}`;
  };

  // Default to full year 2024 (wide net for initial testing)
  const defaultFrom = formatDate(1, 1, 2024);
  const defaultTo = formatDate(12, 14, 2024);
  // Response deadline filter - commented out for now to see all opportunities
  // const responseDeadlineFrom = formatDate(12, 14, 2024);

  // SAM.gov API only accepts one PSC per request, so we make multiple calls
  // and merge the results
  const allOpportunities = new Map<string, SAMOpportunity>();

  try {
    // Make a call for each PSC code + one for NAICS only (safety net)
    const pscCodesToTry = [...GSA_LEASE_FILTERS.pscCodes, null]; // null = NAICS only

    for (const pscCode of pscCodesToTry) {
      const queryParams = new URLSearchParams({
        api_key: apiKey,

        // Required date parameters (rolling window)
        postedFrom: params.postedFrom || defaultFrom,
        postedTo: params.postedTo || defaultTo,

        // Response deadline filter (commented out to see all opportunities)
        // rdlfrom: responseDeadlineFrom,

        // Notice types
        ptype: GSA_LEASE_FILTERS.noticeTypes.join(","),

        // NAICS code (optional - PSC codes are more accurate for leasing)
        // Commenting out to maximize results
        // ncode: GSA_LEASE_FILTERS.naicsCode,

        // Pagination (get more per call to reduce API calls)
        limit: String(1000), // Max allowed
        offset: String(params.offset || 0),

        // Optional filters
        ...(params.state && { state: params.state }),
        ...(params.city && { city: params.city }),
      });

      // Add classification code (PSC) if not null
      // Use 'ccode' parameter as per SAM.gov API docs
      if (pscCode) {
        queryParams.set("ccode", pscCode);
      }

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
        console.warn(
          `SAM.gov API warning for PSC ${pscCode}: ${response.status} - ${errorText}`
        );
        continue; // Skip this PSC and continue with others
      }

      const data: SAMResponse = await response.json();

      // Merge opportunities, deduping by noticeId
      // SAM.gov API doesn't respect PSC filter, so we filter client-side
      data.opportunitiesData?.forEach((opp) => {
        // Only include opportunities with X1A* PSC codes (real property leasing)
        if (!allOpportunities.has(opp.noticeId)) {
          // Accept X1A* codes or NAICS 531120 as lease opportunities
          const pscCode = opp.classificationCode || "";
          const naicsCode = opp.naicsCode || opp.naicsCodes?.[0] || "";

          if (
            pscCode.startsWith("X1A") ||
            pscCode.startsWith("X1D") || // Also include X1DB (parking)
            naicsCode === "531120"
          ) {
            allOpportunities.set(opp.noticeId, opp);
          }
        }
      });
    }

    // Convert Map back to array, sort by posted date (newest first), and apply limit
    const mergedOpportunities = Array.from(allOpportunities.values())
      .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());

    const limitedOpportunities = mergedOpportunities.slice(0, params.limit || 100);

    return {
      totalRecords: mergedOpportunities.length,
      limit: params.limit || 100,
      offset: params.offset || 0,
      opportunitiesData: limitedOpportunities,
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
