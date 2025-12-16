import { neon } from "@neondatabase/serverless";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  role?: string;
  organization_id?: string;
  account_manager_id?: string;
  total_earnings?: number;
  pending_earnings?: number;
  analysis_credits?: number;
  subscription_tier?: string;
}

export interface Organization {
  id: string;
  name: string;
  duns_number?: string;
  cage_code?: string;
  sam_uei?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  owner_id: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  createdAt: Date;
  updatedAt: Date;
}

export interface Opportunity {
  id: string;
  notice_id?: string;
  title: string;
  description?: string;
  type: string;
  sol_number?: string;
  agency?: string;
  sub_agency?: string;
  office?: string;
  naics_code?: string;
  psc_code?: string;
  set_aside?: string;
  set_aside_code?: string;
  estimated_value?: number;
  award_floor?: number;
  award_ceiling?: number;
  posted_date?: Date;
  response_deadline?: Date;
  archive_date?: Date;
  place_of_performance?: string;
  pop_state?: string;
  pop_city?: string;
  pop_zip?: string;
  pop_country?: string;
  url?: string;
  resource_links?: Record<string, unknown>;
  status?: string;
  active?: boolean;
  raw_data?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OpportunityMatch {
  id: string;
  user_id: string;
  opportunity_id: string;
  company_profile_id?: string;
  overall_score: number;
  grade?: string;
  recommendation?: string;
  naics_score?: number;
  capability_score?: number;
  set_aside_score?: number;
  past_performance_score?: number;
  geographic_score?: number;
  capacity_score?: number;
  value_fit_score?: number;
  agency_preference_score?: number;
  strengths?: string[];
  weaknesses?: string[];
  gaps?: string[];
  matching_capabilities?: string[];
  relevant_past_performance?: string[];
  ai_analysis?: Record<string, unknown>;
  win_probability?: number;
  user_action?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analysis {
  id: string;
  user_id: string;
  organization_id?: string;
  opportunity_id?: string;
  document_name?: string;
  document_url?: string;
  document_type?: string;
  extracted_data: Record<string, unknown>;
  bid_score?: number;
  bid_recommendation?: string;
  score_breakdown?: Record<string, unknown>;
  ai_analysis?: Record<string, unknown>;
  strengths?: string[];
  weaknesses?: string[];
  gaps?: string[];
  recommended_actions?: string[];
  compliance_matrix?: Record<string, unknown>;
  status?: string;
  decision?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

// Initialize lazily to avoid build-time errors
let _sql: ReturnType<typeof neon> | null = null;

function getSQL() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

export const sql = new Proxy({} as ReturnType<typeof neon>, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apply: (_target: unknown, _thisArg: any, argumentsList: any[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getSQL() as any)(...argumentsList);
  },
  get: (target, prop) => {
    return getSQL()[prop as keyof ReturnType<typeof neon>];
  }
}) as ReturnType<typeof neon>;

// ============================================================================
// QUERY HELPERS
// ============================================================================

export async function query<T = any>(
  queryText: string,
  params?: unknown[]
): Promise<T[]> {
  try {
    const sqlFunc = getSQL() as any;
    const result = await sqlFunc(queryText, params || []);
    return result as T[];
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

export async function queryOne<T = any>(
  queryText: string,
  params?: unknown[]
): Promise<T | null> {
  try {
    const sqlFunc = getSQL() as any;
    const result = await sqlFunc(queryText, params || []);
    return (result as any)[0] || null;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (sql: typeof neon) => Promise<T>
): Promise<T> {
  try {
    return await callback(sql as any);
  } catch (error) {
    console.error("Transaction error:", error);
    throw error;
  }
}

// Generic CRUD helpers with proper parameter placeholders
export async function insert<T = any>(
  table: string,
  data: Record<string, unknown>
): Promise<T> {
  const keys = Object.keys(data);
  const values = Object.values(data);

  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const columns = keys.map(k => `"${k}"`).join(', ');

  const sqlQuery = `
    INSERT INTO "${table}" (${columns})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await query<T>(sqlQuery, values);
  return result[0];
}

export async function update<T = any>(
  table: string,
  id: string,
  data: Record<string, unknown>
): Promise<T> {
  const keys = Object.keys(data);
  const values = Object.values(data);

  const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');

  const sqlQuery = `
    UPDATE "${table}"
    SET ${setClause}
    WHERE "id" = $${keys.length + 1}
    RETURNING *
  `;

  const result = await query<T>(sqlQuery, [...values, id]);
  return result[0];
}

export async function remove<T = any>(
  table: string,
  id: string
): Promise<T> {
  const sqlQuery = `
    DELETE FROM "${table}"
    WHERE "id" = $1
    RETURNING *
  `;

  const result = await query<T>(sqlQuery, [id]);
  return result[0];
}
