// ============================================================================
// RBAC Middleware Tests
// ============================================================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { query, shutdown } from '../lib/db';
import { hashPassword } from '../lib/auth';
import { UserRole } from '@govcon-os/shared';

describe('RBAC Middleware', () => {
  let orgId: string;
  let adminUserId: string;
  let readonlyUserId: string;

  beforeAll(async () => {
    // Create test organization
    const orgResult = await query(
      'INSERT INTO organizations (name, slug) VALUES ($1, $2) RETURNING id',
      ['Test Org', 'test-org-rbac']
    );
    orgId = orgResult.rows[0].id;

    // Create admin user
    const passwordHash = await hashPassword('password123');
    const adminResult = await query(
      'INSERT INTO users (organization_id, email, name, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
      [orgId, 'admin@test.com', 'Admin User', passwordHash]
    );
    adminUserId = adminResult.rows[0].id;

    // Assign admin role
    await query(
      'INSERT INTO user_roles (organization_id, user_id, role) VALUES ($1, $2, $3)',
      [orgId, adminUserId, UserRole.ADMIN]
    );

    // Create readonly user
    const readonlyResult = await query(
      'INSERT INTO users (organization_id, email, name, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
      [orgId, 'readonly@test.com', 'Readonly User', passwordHash]
    );
    readonlyUserId = readonlyResult.rows[0].id;

    // Assign readonly role
    await query(
      'INSERT INTO user_roles (organization_id, user_id, role) VALUES ($1, $2, $3)',
      [orgId, readonlyUserId, UserRole.READONLY]
    );
  });

  afterAll(async () => {
    // Cleanup
    await query('DELETE FROM organizations WHERE id = $1', [orgId]);
    await shutdown();
  });

  it('should create users with correct roles', async () => {
    const adminRoles = await query(
      'SELECT role FROM user_roles WHERE user_id = $1',
      [adminUserId]
    );
    expect(adminRoles.rows[0].role).toBe(UserRole.ADMIN);

    const readonlyRoles = await query(
      'SELECT role FROM user_roles WHERE user_id = $1',
      [readonlyUserId]
    );
    expect(readonlyRoles.rows[0].role).toBe(UserRole.READONLY);
  });

  it('should enforce unique role assignments per user', async () => {
    // Trying to assign the same role again should not create a duplicate
    await query(
      'INSERT INTO user_roles (organization_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [orgId, adminUserId, UserRole.ADMIN]
    );

    const roles = await query(
      'SELECT COUNT(*) as count FROM user_roles WHERE user_id = $1 AND role = $2',
      [adminUserId, UserRole.ADMIN]
    );
    expect(parseInt(roles.rows[0].count)).toBe(1);
  });

  it('should allow users to have multiple roles', async () => {
    // Add capture role to admin user
    await query(
      'INSERT INTO user_roles (organization_id, user_id, role) VALUES ($1, $2, $3)',
      [orgId, adminUserId, UserRole.CAPTURE_MANAGER]
    );

    const roles = await query(
      'SELECT role FROM user_roles WHERE user_id = $1 ORDER BY role',
      [adminUserId]
    );
    expect(roles.rows.length).toBe(2);
    expect(roles.rows.map((r) => r.role)).toContain(UserRole.ADMIN);
    expect(roles.rows.map((r) => r.role)).toContain(UserRole.CAPTURE_MANAGER);
  });
});
