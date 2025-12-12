import { sql } from "./db";

// ============================================
// TYPES
// ============================================

export interface CompanyProfile {
  id: string;
  user_id: string;
  organization_id?: string;
  naics_codes?: string[];
  primary_naics?: string;
  core_competencies?: string[];
  keywords?: string[];
  service_areas?: string[];
  certifications?: string[];
  set_asides?: string[];
  is_small_business?: boolean;
  employee_count?: number;
  annual_revenue?: number;
  preferred_agencies?: string[];
  excluded_agencies?: string[];
  min_contract_value?: number;
  max_contract_value?: number;
  preferred_states?: string[];
  remote_work_capable?: boolean;
  current_contracts?: number;
  max_concurrent_contracts?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Analysis {
  id: string;
  user_id: string;
  organization_id?: string;
  opportunity_id?: string;
  document_name?: string;
  document_url?: string;
  document_type?: string;
  extracted_data: any;
  bid_score?: number;
  bid_recommendation?: string;
  score_breakdown?: any;
  ai_analysis?: any;
  strengths?: string[];
  weaknesses?: string[];
  gaps?: string[];
  recommended_actions?: string[];
  compliance_matrix?: any;
  status?: string;
  decision?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisCredit {
  id: string;
  user_id: string;
  organization_id?: string;
  credit_type: "subscription" | "one_time" | "pack";
  credits_remaining: number;
  total_credits: number;
  expires_at?: string;
  created_at: string;
}

// ============================================
// COMPANY PROFILE SERVICES
// ============================================

export async function getCompanyProfile(userId: string): Promise<CompanyProfile | null> {
  const result = await sql`
    SELECT * FROM company_profile
    WHERE user_id = ${userId}
    LIMIT 1
  `;
  return result[0] || null;
}

// NOTE: Use generic insert() helper from lib/db.ts instead
// This function uses old schema fields and needs to be refactored
export async function createCompanyProfile(data: Partial<CompanyProfile> & { user_id: string }): Promise<CompanyProfile> {
  const result = await sql`
    INSERT INTO company_profile (
      user_id,
      organization_id,
      naics_codes,
      core_competencies,
      certifications,
      set_asides
    ) VALUES (
      ${data.user_id},
      ${data.organization_id || null},
      ${data.naics_codes || []},
      ${data.core_competencies || []},
      ${data.certifications || []},
      ${data.set_asides || []}
    )
    RETURNING *
  `;
  return result[0];
}

export async function updateCompanyProfile(
  userId: string,
  data: Partial<Omit<CompanyProfile, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<CompanyProfile> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === "contract_value_range") {
        updates.push(`${key} = $${paramIndex}::jsonb`);
        values.push(JSON.stringify(value));
      } else if (Array.isArray(value)) {
        updates.push(`${key} = $${paramIndex}::text[]`);
        values.push(value);
      } else {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
      }
      paramIndex++;
    }
  });

  values.push(userId);

  const query = `
    UPDATE company_profile
    SET ${updates.join(", ")}, updated_at = NOW()
    WHERE user_id = $${paramIndex}
    RETURNING *
  `;

  const result = await sql(query, values);
  return result[0];
}

// ============================================
// ANALYSIS SERVICES
// ============================================

export async function getAnalyses(userId: string, limit = 10): Promise<Analysis[]> {
  const result = await sql`
    SELECT * FROM analysis
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return result;
}

export async function getAnalysisById(id: string, userId: string): Promise<Analysis | null> {
  const result = await sql`
    SELECT * FROM analysis
    WHERE id = ${id} AND user_id = ${userId}
    LIMIT 1
  `;
  return result[0] || null;
}

export async function createAnalysis(data: {
  user_id: string;
  organization_id?: string;
  document_type?: string;
  document_name?: string;
  document_url?: string;
  opportunity_id?: string;
}): Promise<Analysis> {
  const result = await sql`
    INSERT INTO analysis (
      user_id,
      organization_id,
      document_type,
      document_name,
      document_url,
      opportunity_id,
      status
    ) VALUES (
      ${data.user_id},
      ${data.organization_id || null},
      ${data.document_type || null},
      ${data.document_name || null},
      ${data.document_url || null},
      ${data.opportunity_id || null},
      'draft'
    )
    RETURNING *
  `;
  return result[0];
}

export async function updateAnalysis(
  id: string,
  userId: string,
  data: Partial<Omit<Analysis, "id" | "user_id" | "created_at">>
): Promise<Analysis> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === "extracted_data") {
        updates.push(`${key} = $${paramIndex}::jsonb`);
        values.push(JSON.stringify(value));
      } else {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
      }
      paramIndex++;
    }
  });

  values.push(id, userId);

  const query = `
    UPDATE analysis
    SET ${updates.join(", ")}, updated_at = NOW()
    WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
    RETURNING *
  `;

  const result = await sql(query, values);
  return result[0];
}

// ============================================
// CREDITS SERVICES (Using credit_transaction table)
// ============================================

export async function getCredits(userId: string): Promise<AnalysisCredit[]> {
  // Get credit balance from transactions
  const result = await sql`
    SELECT
      id,
      user_id,
      type as credit_type,
      balance_after as credits_remaining,
      amount as total_credits,
      "createdAt" as created_at
    FROM credit_transaction
    WHERE user_id = ${userId}
    ORDER BY "createdAt" DESC
    LIMIT 10
  `;
  return result.map((r: any) => ({
    ...r,
    expires_at: null,
    organization_id: null,
  }));
}

export async function getTotalCredits(userId: string): Promise<number> {
  // Get the latest balance
  const result = await sql`
    SELECT balance_after
    FROM credit_transaction
    WHERE user_id = ${userId}
    ORDER BY "createdAt" DESC
    LIMIT 1
  `;
  return Number(result[0]?.balance_after || 0);
}

export async function consumeCredit(userId: string, creditType?: string): Promise<boolean> {
  try {
    // Get current balance
    const currentBalance = await getTotalCredits(userId);

    if (currentBalance <= 0) {
      return false;
    }

    // Create a debit transaction
    await sql`
      INSERT INTO credit_transaction (
        user_id,
        type,
        amount,
        balance_after,
        description
      ) VALUES (
        ${userId},
        'debit',
        -1,
        ${currentBalance - 1},
        ${creditType ? `Analysis (${creditType})` : 'Analysis'}
      )
    `;

    return true;
  } catch (error) {
    console.error("Error consuming credit:", error);
    return false;
  }
}

export async function addCredits(data: {
  user_id: string;
  organization_id?: string;
  credit_type: "subscription" | "one_time" | "pack";
  total_credits: number;
  expires_at?: Date;
}): Promise<AnalysisCredit> {
  // Get current balance
  const currentBalance = await getTotalCredits(data.user_id);

  // Create a credit transaction
  const result = await sql`
    INSERT INTO credit_transaction (
      user_id,
      type,
      amount,
      balance_after,
      description
    ) VALUES (
      ${data.user_id},
      'credit',
      ${data.total_credits},
      ${currentBalance + data.total_credits},
      ${`Credit: ${data.credit_type}`}
    )
    RETURNING *
  `;

  const transaction = result[0];

  return {
    id: transaction.id,
    user_id: transaction.user_id,
    credit_type: data.credit_type,
    credits_remaining: transaction.balance_after,
    total_credits: transaction.amount,
    expires_at: data.expires_at?.toISOString(),
    created_at: transaction.createdAt,
    organization_id: data.organization_id,
  };
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats(userId: string) {
  const [analyses, credits] = await Promise.all([
    sql`
      SELECT
        COUNT(*) as total_analyses,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_analyses,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_analyses,
        COUNT(CASE WHEN bid_recommendation = 'STRONG_BID' THEN 1 END) as strong_bids
      FROM analysis
      WHERE user_id = ${userId}
    `,
    getTotalCredits(userId),
  ]);

  return {
    total_analyses: Number(analyses[0].total_analyses),
    completed_analyses: Number(analyses[0].completed_analyses),
    processing_analyses: Number(analyses[0].processing_analyses),
    strong_bids: Number(analyses[0].strong_bids),
    credits_remaining: credits,
  };
}
