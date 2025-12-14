// ============================================================================
// Authentication Utilities
// ============================================================================

import bcrypt from 'bcrypt';
import { UserRole } from '@govcon-os/shared';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export interface JWTPayload {
  userId: string;
  organizationId: string;
  email: string;
  roles: UserRole[];
}

// JWT secret - in production, load from environment
export const JWT_SECRET =
  process.env.JWT_SECRET || 'govcon_os_dev_secret_change_in_production';
