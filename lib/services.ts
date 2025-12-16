// ============================================================================
// SENTYR.AI - DATA SERVICES
// ============================================================================

import { query, queryOne, insert, update, remove } from './db';
import type { User, CompanyProfile, Organization, Opportunity, Analysis, OpportunityMatch } from './db';

// ============================================================================
// USER SERVICE
// ============================================================================

export const UserService = {
  async getById(id: string): Promise<User | null> {
    return queryOne<User>('SELECT * FROM "user" WHERE "id" = $1', [id]);
  },

  async getByEmail(email: string): Promise<User | null> {
    return queryOne<User>('SELECT * FROM "user" WHERE "email" = $1', [email]);
  },

  async updateCredits(userId: string, delta: number): Promise<User> {
    const result = await query<User>(
      `UPDATE "user"
       SET "analysis_credits" = COALESCE("analysis_credits", 0) + $1,
           "updatedAt" = NOW()
       WHERE "id" = $2
       RETURNING *`,
      [delta, userId]
    );
    return result[0];
  },

  async setRole(userId: string, role: string): Promise<User> {
    const result = await query<User>(
      `UPDATE "user"
       SET "role" = $1, "updatedAt" = NOW()
       WHERE "id" = $2
       RETURNING *`,
      [role, userId]
    );
    return result[0];
  },

  async getCredits(userId: string): Promise<number> {
    const user = await this.getById(userId);
    return user?.analysis_credits || 0;
  },
};

// ============================================================================
// ORGANIZATION SERVICE
// ============================================================================

export const OrganizationService = {
  async getById(id: string): Promise<Organization | null> {
    return queryOne<Organization>('SELECT * FROM "organization" WHERE "id" = $1', [id]);
  },

  async getByOwnerId(ownerId: string): Promise<Organization | null> {
    return queryOne<Organization>('SELECT * FROM "organization" WHERE "owner_id" = $1', [ownerId]);
  },

  async create(data: Partial<Organization>): Promise<Organization> {
    return insert<Organization>('organization', data);
  },

  async update(id: string, data: Partial<Organization>): Promise<Organization> {
    return update<Organization>('organization', id, data);
  },
};

// ============================================================================
// COMPANY PROFILE SERVICE
// ============================================================================

export const CompanyProfileService = {
  async getByUserId(userId: string): Promise<CompanyProfile | null> {
    return queryOne<CompanyProfile>(
      'SELECT * FROM "company_profile" WHERE "user_id" = $1',
      [userId]
    );
  },

  async create(data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    return insert<CompanyProfile>('company_profile', data);
  },

  async update(userId: string, data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    const existing = await this.getByUserId(userId);
    if (!existing) {
      return this.create({ ...data, user_id: userId });
    }
    return update<CompanyProfile>('company_profile', existing.id, data);
  },

  async upsert(userId: string, data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    const existing = await this.getByUserId(userId);
    if (existing) {
      return update<CompanyProfile>('company_profile', existing.id, data);
    }
    return insert<CompanyProfile>('company_profile', { ...data, user_id: userId });
  },
};

// ============================================================================
// OPPORTUNITY SERVICE
// ============================================================================

export const OpportunityService = {
  async getById(id: string): Promise<Opportunity | null> {
    return queryOne<Opportunity>('SELECT * FROM "opportunity" WHERE "id" = $1', [id]);
  },

  async getActive(limit = 50): Promise<Opportunity[]> {
    return query<Opportunity>(
      `SELECT * FROM "opportunity"
       WHERE "active" = true
       AND ("response_deadline" IS NULL OR "response_deadline" > NOW())
       ORDER BY "posted_date" DESC
       LIMIT $1`,
      [limit]
    );
  },

  async search(filters: {
    naics?: string;
    agency?: string;
    setAside?: string;
    state?: string;
    keyword?: string;
  }): Promise<Opportunity[]> {
    let whereClause = 'WHERE "active" = true';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters.naics) {
      whereClause += ` AND "naics_code" LIKE $${paramIndex}`;
      params.push(filters.naics + '%');
      paramIndex++;
    }
    if (filters.agency) {
      whereClause += ` AND "agency" ILIKE $${paramIndex}`;
      params.push('%' + filters.agency + '%');
      paramIndex++;
    }
    if (filters.setAside) {
      whereClause += ` AND "set_aside" = $${paramIndex}`;
      params.push(filters.setAside);
      paramIndex++;
    }
    if (filters.state) {
      whereClause += ` AND "pop_state" = $${paramIndex}`;
      params.push(filters.state);
      paramIndex++;
    }
    if (filters.keyword) {
      whereClause += ` AND ("title" ILIKE $${paramIndex} OR "description" ILIKE $${paramIndex})`;
      params.push('%' + filters.keyword + '%');
      paramIndex++;
    }

    return query<Opportunity>(
      `SELECT * FROM "opportunity" ${whereClause} ORDER BY "posted_date" DESC LIMIT 100`,
      params
    );
  },

  async upsertFromSAM(data: Partial<Opportunity>): Promise<Opportunity> {
    if (data.notice_id) {
      const existing = await queryOne<Opportunity>(
        'SELECT * FROM "opportunity" WHERE "notice_id" = $1',
        [data.notice_id]
      );
      if (existing) {
        return update<Opportunity>('opportunity', existing.id, data);
      }
    }
    return insert<Opportunity>('opportunity', data);
  },
};

// ============================================================================
// ANALYSIS SERVICE
// ============================================================================

export const AnalysisService = {
  async getById(id: string): Promise<Analysis | null> {
    return queryOne<Analysis>('SELECT * FROM "analysis" WHERE "id" = $1', [id]);
  },

  async getByUserId(userId: string): Promise<Analysis[]> {
    return query<Analysis>(
      'SELECT * FROM "analysis" WHERE "user_id" = $1 ORDER BY "createdAt" DESC',
      [userId]
    );
  },

  async create(data: Partial<Analysis>): Promise<Analysis> {
    return insert<Analysis>('analysis', {
      ...data,
      extracted_data: data.extracted_data || {},
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      gaps: data.gaps || [],
      status: data.status || 'processing',
    });
  },

  async update(id: string, data: Partial<Analysis>): Promise<Analysis> {
    return update<Analysis>('analysis', id, data);
  },

  async delete(id: string): Promise<void> {
    return remove('analysis', id);
  },

  async getStats(userId: string) {
    return queryOne<{ total: number; pursuing: number; avg_score: number }>(
      `SELECT
         COUNT(*)::int as total,
         COUNT(*) FILTER (WHERE "decision" = 'pursuing')::int as pursuing,
         COALESCE(AVG("bid_score"), 0)::int as avg_score
       FROM "analysis"
       WHERE "user_id" = $1`,
      [userId]
    );
  },
};

// ============================================================================
// OPPORTUNITY MATCH SERVICE
// ============================================================================

export const OpportunityMatchService = {
  async getByUserId(userId: string, minScore = 0): Promise<unknown[]> {
    return query(
      `SELECT om.*,
              o.title,
              o.agency,
              o.estimated_value,
              o.response_deadline,
              o.naics_code
       FROM "opportunity_match" om
       JOIN "opportunity" o ON o.id = om.opportunity_id
       WHERE om.user_id = $1 AND om.overall_score >= $2
       ORDER BY om.overall_score DESC`,
      [userId, minScore]
    );
  },

  async upsert(data: Partial<OpportunityMatch>): Promise<OpportunityMatch> {
    const existing = await queryOne<OpportunityMatch>(
      `SELECT * FROM "opportunity_match"
       WHERE "user_id" = $1 AND "opportunity_id" = $2`,
      [data.user_id, data.opportunity_id]
    );
    if (existing) {
      return update<OpportunityMatch>('opportunity_match', existing.id, data);
    }
    return insert<OpportunityMatch>('opportunity_match', {
      ...data,
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      gaps: data.gaps || [],
    });
  },

  async setAction(id: string, action: string, notes?: string): Promise<OpportunityMatch> {
    return update<OpportunityMatch>('opportunity_match', id, {
      user_action: action,
      notes,
    });
  },

  async getTopMatches(userId: string, limit = 10, minScore = 60) {
    return query(
      `SELECT om.*,
              o.title,
              o.agency,
              o.estimated_value,
              o.response_deadline,
              o.naics_code,
              o.set_aside
       FROM "opportunity_match" om
       JOIN "opportunity" o ON o.id = om.opportunity_id
       WHERE om.user_id = $1
         AND om.overall_score >= $3
         AND o.active = true
       ORDER BY om.overall_score DESC
       LIMIT $2`,
      [userId, limit, minScore]
    );
  },

  async getStats(userId: string) {
    return queryOne(
      `SELECT
         COUNT(*)::int as total_matches,
         COUNT(*) FILTER (WHERE overall_score >= 80)::int as excellent_matches,
         COUNT(*) FILTER (WHERE overall_score >= 60 AND overall_score < 80)::int as good_matches,
         COUNT(*) FILTER (WHERE overall_score < 60)::int as fair_matches,
         COALESCE(AVG(overall_score), 0)::int as avg_score
       FROM "opportunity_match"
       WHERE user_id = $1`,
      [userId]
    );
  },
};

// ============================================================================
// CREDIT SERVICE
// ============================================================================

export const CreditService = {
  async checkCredits(userId: string): Promise<number> {
    const user = await UserService.getById(userId);
    return user?.analysis_credits || 0;
  },

  async useCredit(userId: string, analysisId?: string): Promise<boolean> {
    const credits = await this.checkCredits(userId);
    if (credits < 1) {
      throw new Error('Insufficient credits');
    }

    await UserService.updateCredits(userId, -1);

    // Log the credit transaction
    await insert('credit_transaction', {
      user_id: userId,
      type: 'usage',
      amount: -1,
      balance_after: credits - 1,
      description: 'Analysis credit used',
      reference_id: analysisId,
    });

    return true;
  },

  async addCredits(userId: string, amount: number, description: string): Promise<void> {
    const credits = await this.checkCredits(userId);
    await UserService.updateCredits(userId, amount);

    await insert('credit_transaction', {
      user_id: userId,
      type: 'purchase',
      amount,
      balance_after: credits + amount,
      description,
    });
  },

  async getTransactionHistory(userId: string, limit = 50) {
    return query(
      `SELECT * FROM "credit_transaction"
       WHERE user_id = $1
       ORDER BY "createdAt" DESC
       LIMIT $2`,
      [userId, limit]
    );
  },
};

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export async function getDashboardStats(userId: string) {
  const [analysisStats, matchStats, credits] = await Promise.all([
    AnalysisService.getStats(userId),
    OpportunityMatchService.getStats(userId),
    CreditService.checkCredits(userId),
  ]);

  return {
    analyses: {
      total: analysisStats?.total || 0,
      pursuing: analysisStats?.pursuing || 0,
      avg_score: analysisStats?.avg_score || 0,
    },
    matches: {
      total: matchStats?.total_matches || 0,
      excellent: matchStats?.excellent_matches || 0,
      good: matchStats?.good_matches || 0,
      fair: matchStats?.fair_matches || 0,
      avg_score: matchStats?.avg_score || 0,
    },
    credits_remaining: credits,
  };
}

// ============================================================================
// LEGACY FUNCTION EXPORTS (for backward compatibility)
// ============================================================================

export const getCompanyProfile = CompanyProfileService.getByUserId;
export const createCompanyProfile = CompanyProfileService.create;
export const updateCompanyProfile = CompanyProfileService.update;

export const getAnalyses = AnalysisService.getByUserId;
export const getAnalysisById = AnalysisService.getById;
export const createAnalysis = AnalysisService.create;
export const updateAnalysis = AnalysisService.update;

export const getCredits = CreditService.getTransactionHistory.bind(CreditService);
export const getTotalCredits = CreditService.checkCredits.bind(CreditService);
export const consumeCredit = CreditService.useCredit.bind(CreditService);
export const addCredits = CreditService.addCredits.bind(CreditService);
