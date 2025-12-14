/**
 * AI Retrieval Helper for Government Contractor Knowledge Base
 *
 * This module provides functions to retrieve contractor information
 * that the AI can use for:
 * - RFP qualification checks
 * - Bid/no-bid scoring
 * - Proposal drafting with citations
 */

import { createClient } from "@/lib/supabase/server";

export interface ContractorKnowledgeBase {
  contractor_profile: any;
  capability_facts: any[];
  past_performance: any[];
  key_personnel: any[];
  proposal_library: any[];
  constraints: any;
}

/**
 * Get the complete knowledge base for a contractor organization
 *
 * @param orgId - The organization ID (user ID)
 * @returns Promise<ContractorKnowledgeBase | null>
 */
export async function getCompanyKnowledgeBase(
  orgId: string
): Promise<ContractorKnowledgeBase | null> {
  try {
    const supabase = await createClient();

    // Call the database function that aggregates all knowledge base data
    const { data, error } = await supabase.rpc("get_company_knowledge_base", {
      user_org_id: orgId,
    });

    if (error) {
      console.error("Error fetching company knowledge base:", error);
      return null;
    }

    return data as ContractorKnowledgeBase;
  } catch (error) {
    console.error("Error in getCompanyKnowledgeBase:", error);
    return null;
  }
}

/**
 * Get contractor profile only (fast query for basic information)
 *
 * @param orgId - The organization ID (user ID)
 * @returns Promise<any | null>
 */
export async function getContractorProfile(orgId: string): Promise<any | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("contractor_profiles")
      .select("*")
      .eq("org_id", orgId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching contractor profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getContractorProfile:", error);
    return null;
  }
}

/**
 * Get capability documents for a specific type
 *
 * @param orgId - The organization ID (user ID)
 * @param documentType - The type of document to retrieve
 * @returns Promise<any[]>
 */
export async function getCapabilityDocuments(
  orgId: string,
  documentType?: string
): Promise<any[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("capability_documents")
      .select("*")
      .eq("org_id", orgId)
      .eq("status", "ready");

    if (documentType) {
      query = query.eq("document_type", documentType);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching capability documents:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getCapabilityDocuments:", error);
    return [];
  }
}

/**
 * Get capability facts filtered by type and minimum confidence
 *
 * @param orgId - The organization ID (user ID)
 * @param factType - Optional fact type filter
 * @param minConfidence - Minimum confidence score (0-1)
 * @returns Promise<any[]>
 */
export async function getCapabilityFacts(
  orgId: string,
  factType?: string,
  minConfidence: number = 0.7
): Promise<any[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("capability_facts")
      .select("*")
      .eq("org_id", orgId)
      .gte("confidence", minConfidence);

    if (factType) {
      query = query.eq("fact_type", factType);
    }

    const { data, error } = await query
      .order("confidence", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching capability facts:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getCapabilityFacts:", error);
    return [];
  }
}

/**
 * Get past performance projects
 *
 * @param orgId - The organization ID (user ID)
 * @param limit - Maximum number of projects to return
 * @returns Promise<any[]>
 */
export async function getPastPerformance(
  orgId: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("past_performance_projects")
      .select("*")
      .eq("org_id", orgId)
      .order("pop_end", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching past performance:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getPastPerformance:", error);
    return [];
  }
}

/**
 * Get approved proposal library items
 *
 * @param orgId - The organization ID (user ID)
 * @param category - Optional category filter
 * @returns Promise<any[]>
 */
export async function getProposalLibrary(
  orgId: string,
  category?: string
): Promise<any[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("proposal_library_items")
      .select("*")
      .eq("org_id", orgId)
      .eq("approved", true);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching proposal library:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getProposalLibrary:", error);
    return [];
  }
}

/**
 * Get constraints and policies
 *
 * @param orgId - The organization ID (user ID)
 * @returns Promise<any | null>
 */
export async function getConstraints(orgId: string): Promise<any | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("constraints_policies")
      .select("*")
      .eq("org_id", orgId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching constraints:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getConstraints:", error);
    return null;
  }
}

/**
 * Check if contractor qualifies for an RFP based on basic criteria
 *
 * @param orgId - The organization ID (user ID)
 * @param requirements - RFP requirements to check against
 * @returns Promise<{ qualified: boolean; reasons: string[] }>
 */
export async function checkRFPQualification(
  orgId: string,
  requirements: {
    naics?: string[];
    set_aside?: string;
    contract_size?: number;
    clearance_required?: boolean;
  }
): Promise<{ qualified: boolean; reasons: string[] }> {
  const reasons: string[] = [];
  let qualified = true;

  try {
    const profile = await getContractorProfile(orgId);

    if (!profile) {
      return { qualified: false, reasons: ["No contractor profile found"] };
    }

    // Check NAICS codes
    if (requirements.naics && requirements.naics.length > 0) {
      const contractorNAICS = [
        profile.naics_primary,
        ...(profile.naics_secondary || []),
      ];
      const hasMatchingNAICS = requirements.naics.some((reqNAICS) =>
        contractorNAICS.includes(reqNAICS)
      );

      if (!hasMatchingNAICS) {
        qualified = false;
        reasons.push("No matching NAICS codes");
      }
    }

    // Check contract size
    if (requirements.contract_size) {
      const minSize = profile.contract_size_min || 0;
      const maxSize = profile.contract_size_max || Infinity;

      if (
        requirements.contract_size < minSize ||
        requirements.contract_size > maxSize
      ) {
        qualified = false;
        reasons.push("Contract size outside acceptable range");
      }
    }

    // Check set-aside status
    if (requirements.set_aside) {
      const socioStatus = profile.socio_status || [];
      const setAsideMap: { [key: string]: string[] } = {
        "8(a)": ["8a"],
        SDVOSB: ["sdvosb"],
        WOSB: ["wosb"],
        HUBZone: ["hubzone"],
      };

      const requiredStatus = setAsideMap[requirements.set_aside];
      if (
        requiredStatus &&
        !requiredStatus.some((status) => socioStatus.includes(status))
      ) {
        qualified = false;
        reasons.push(`Does not meet ${requirements.set_aside} set-aside requirement`);
      }
    }

    return { qualified, reasons };
  } catch (error) {
    console.error("Error in checkRFPQualification:", error);
    return {
      qualified: false,
      reasons: ["Error checking qualification"],
    };
  }
}
