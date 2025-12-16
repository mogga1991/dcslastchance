/**
 * Authentication and Authorization Guards
 *
 * Provides security helpers for API routes to enforce:
 * 1. User authentication (Supabase)
 * 2. Organization membership validation
 * 3. Role-based access control (RBAC)
 *
 * Usage:
 *   const session = await requireAuth(request);
 *   await requireOrgAccess(session.userId, orgId);
 *   await requireRole(session.userId, ['admin', 'account_manager']);
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { sql, query } from "./db";

// ============================================
// TYPES
// ============================================

export type UserRole = "contractor" | "broker" | "account_manager" | "admin";

export interface AuthSession {
  userId: string;
  organizationId?: string;
  role?: UserRole;
}

export interface UserRecord {
  id: string;
  email: string;
  role: UserRole;
  organization_id: string | null;
  account_manager_id: string | null;
}

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Requires user to be authenticated via Supabase
 * Throws 401 error if not authenticated
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   const session = await requireAuth(request);
 *   // session.userId is guaranteed to exist
 * }
 */
export async function requireAuth(_request?: NextRequest): Promise<AuthSession> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    throw new AuthError("Unauthorized", 401);
  }

  const userId = authUser.id;

  // Fetch user details including org and role from database
  const userResult = await sql`
    SELECT id, email, role, organization_id, account_manager_id
    FROM "user"
    WHERE id = ${userId}
    LIMIT 1
  ` as unknown as UserRecord[];

  const user = userResult[0];

  if (!user) {
    // User exists in Supabase but not in our database - return basic session
    return {
      userId: authUser.id,
      organizationId: undefined,
      role: undefined,
    };
  }

  return {
    userId: user.id,
    organizationId: user.organization_id || undefined,
    role: user.role || undefined,
  };
}

/**
 * Optional auth - returns session if authenticated, null otherwise
 * Useful for endpoints that have different behavior for logged-in vs anonymous users
 */
export async function optionalAuth(): Promise<AuthSession | null> {
  try {
    return await requireAuth();
  } catch {
    return null;
  }
}

// ============================================
// ORGANIZATION ACCESS CONTROL
// ============================================

/**
 * Ensures user belongs to the specified organization
 * Throws 403 error if user doesn't have access
 *
 * @example
 * const session = await requireAuth();
 * await requireOrgAccess(session.userId, body.organization_id);
 */
export async function requireOrgAccess(
  userId: string,
  targetOrgId: string
): Promise<void> {
  const userResult = await sql`
    SELECT organization_id
    FROM "user"
    WHERE id = ${userId}
    LIMIT 1
  ` as unknown as { organization_id: string | null }[];

  const user = userResult[0];

  if (!user) {
    throw new AuthError("User not found", 404);
  }

  if (user.organization_id !== targetOrgId) {
    throw new AuthError(
      "Forbidden: User does not belong to this organization",
      403
    );
  }
}

/**
 * Ensures resource belongs to user's organization
 * Generic helper for any resource with organization_id
 *
 * @example
 * await requireResourceOrgAccess(userId, 'analysis', analysisId);
 */
export async function requireResourceOrgAccess(
  userId: string,
  table: string,
  resourceId: string
): Promise<void> {
  const queryText = `
    SELECT r.organization_id
    FROM "${table}" r
    JOIN "user" u ON r.user_id = u.id
    WHERE r.id = $1
    LIMIT 1
  `;

  const result = await query(queryText, [resourceId]);
  const resource = result[0] as { organization_id: string | null } | undefined;

  if (!resource) {
    throw new AuthError("Resource not found", 404);
  }

  // If resource has no org, check if it belongs to the user directly
  if (!resource.organization_id) {
    const ownerQuery = `
      SELECT user_id FROM "${table}" WHERE id = $1 LIMIT 1
    `;
    const ownerResult = await query(ownerQuery, [resourceId]);
    const owner = ownerResult[0] as { user_id: string } | undefined;

    if (owner?.user_id !== userId) {
      throw new AuthError("Forbidden: Access denied", 403);
    }
    return;
  }

  // Check org membership
  await requireOrgAccess(userId, resource.organization_id);
}

// ============================================
// ROLE-BASED ACCESS CONTROL
// ============================================

/**
 * Ensures user has one of the allowed roles
 * Throws 403 error if user's role is not in the allowed list
 *
 * @example
 * // Only admins and account managers can access
 * await requireRole(userId, ['admin', 'account_manager']);
 */
export async function requireRole(
  userId: string,
  allowedRoles: UserRole[]
): Promise<UserRole> {
  const userResult = await sql`
    SELECT role
    FROM "user"
    WHERE id = ${userId}
    LIMIT 1
  ` as unknown as { role: UserRole }[];

  const user = userResult[0];

  if (!user) {
    throw new AuthError("User not found", 404);
  }

  if (!allowedRoles.includes(user.role)) {
    throw new AuthError(
      `Forbidden: Requires one of these roles: ${allowedRoles.join(", ")}`,
      403
    );
  }

  return user.role;
}

/**
 * Ensures user is an admin
 * Shorthand for requireRole(userId, ['admin'])
 */
export async function requireAdmin(userId: string): Promise<void> {
  await requireRole(userId, ["admin"]);
}

/**
 * Ensures user is an admin or account manager
 * Useful for management endpoints
 */
export async function requireManager(userId: string): Promise<void> {
  await requireRole(userId, ["admin", "account_manager"]);
}

// ============================================
// RESOURCE OWNERSHIP
// ============================================

/**
 * Ensures user owns the specified resource
 * Throws 403 if resource doesn't belong to user
 *
 * @example
 * await requireOwnership(userId, 'analysis', analysisId);
 */
export async function requireOwnership(
  userId: string,
  table: string,
  resourceId: string
): Promise<void> {
  const queryText = `
    SELECT user_id FROM "${table}" WHERE id = $1 LIMIT 1
  `;

  const result = await query(queryText, [resourceId]);
  const resource = result[0] as { user_id: string } | undefined;

  if (!resource) {
    throw new AuthError("Resource not found", 404);
  }

  if (resource.user_id !== userId) {
    throw new AuthError("Forbidden: You do not own this resource", 403);
  }
}

/**
 * Ensures user owns resource OR is an admin
 * Useful for endpoints where admins can access all resources
 */
export async function requireOwnershipOrAdmin(
  userId: string,
  table: string,
  resourceId: string
): Promise<void> {
  try {
    await requireAdmin(userId);
    // User is admin, allow access
    return;
  } catch {
    // Not admin, check ownership
    await requireOwnership(userId, table, resourceId);
  }
}

// ============================================
// CREDIT/QUOTA VALIDATION
// ============================================

/**
 * Checks if user has sufficient credits
 * Returns current balance
 * Throws 403 if insufficient
 */
export async function requireCredits(
  userId: string,
  requiredAmount: number = 1
): Promise<number> {
  const result = await sql`
    SELECT balance_after
    FROM credit_transaction
    WHERE user_id = ${userId}
    ORDER BY "createdAt" DESC
    LIMIT 1
  ` as unknown as { balance_after: number }[];

  const currentBalance = result[0]?.balance_after || 0;

  if (currentBalance < requiredAmount) {
    throw new AuthError(
      `Insufficient credits. Required: ${requiredAmount}, Available: ${currentBalance}`,
      402
    );
  }

  return currentBalance;
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Custom error class for auth-related errors
 * Includes HTTP status code for easy response mapping
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 403
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Error handler wrapper for API routes
 * Converts AuthError to appropriate HTTP response
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   return withAuthErrorHandling(async () => {
 *     const session = await requireAuth();
 *     // ... your logic
 *     return NextResponse.json({ data });
 *   });
 * }
 */
export async function withAuthErrorHandling<T>(
  handler: () => Promise<T>
): Promise<T> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof AuthError) {
      throw error; // Let the route handler convert to Response
    }
    // Re-throw other errors
    throw error;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get user's full details
 */
export async function getUserDetails(userId: string): Promise<UserRecord> {
  const result = await sql`
    SELECT id, email, role, organization_id, account_manager_id
    FROM "user"
    WHERE id = ${userId}
    LIMIT 1
  ` as unknown as UserRecord[];

  const user = result[0];

  if (!user) {
    throw new AuthError("User not found", 404);
  }

  return user;
}

/**
 * Check if user belongs to any organization
 */
export async function hasOrganization(userId: string): Promise<boolean> {
  const user = await getUserDetails(userId);
  return !!user.organization_id;
}

/**
 * Get all users in the same organization
 */
export async function getOrgMembers(userId: string): Promise<UserRecord[]> {
  const user = await getUserDetails(userId);

  if (!user.organization_id) {
    throw new AuthError("User is not part of an organization", 400);
  }

  const members = await sql`
    SELECT id, email, role, organization_id, account_manager_id
    FROM "user"
    WHERE organization_id = ${user.organization_id}
    ORDER BY role, email
  ` as unknown as UserRecord[];

  return members;
}
