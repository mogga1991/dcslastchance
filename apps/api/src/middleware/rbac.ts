// ============================================================================
// RBAC Middleware - Role-Based Access Control
// ============================================================================

import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '@govcon-os/shared';
import { JWTPayload } from '../lib/auth';

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload;
  }
}

// Role hierarchy: higher roles inherit permissions from lower roles
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.ADMIN]: 100,
  [UserRole.CAPTURE_MANAGER]: 80,
  [UserRole.PROPOSAL_MANAGER]: 70,
  [UserRole.TECHNICAL_WRITER]: 50,
  [UserRole.PRICING_ANALYST]: 50,
  [UserRole.REVIEWER]: 30,
  [UserRole.READONLY]: 10,
};

export function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void
) {
  if (!request.user) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  done();
}

export function requireRoles(...allowedRoles: UserRole[]) {
  return (request: FastifyRequest, reply: FastifyReply, done: () => void) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const userRoles = request.user.roles;
    const hasPermission = userRoles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!hasPermission) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: `Required roles: ${allowedRoles.join(', ')}`,
      });
    }

    done();
  };
}

export function requireMinRole(minRole: UserRole) {
  return (request: FastifyRequest, reply: FastifyReply, done: () => void) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const userRoles = request.user.roles;
    const minRoleLevel = ROLE_HIERARCHY[minRole];

    const hasPermission = userRoles.some(
      (role) => ROLE_HIERARCHY[role] >= minRoleLevel
    );

    if (!hasPermission) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: `Minimum role required: ${minRole}`,
      });
    }

    done();
  };
}

// Tenancy isolation: ensure user can only access their org's data
export function requireOrgAccess(
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void
) {
  if (!request.user) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const orgIdFromParams = request.params as any;
  const orgIdFromBody = request.body as any;

  const requestedOrgId =
    orgIdFromParams?.organizationId ||
    orgIdFromBody?.organization_id ||
    orgIdFromParams?.org_id;

  if (requestedOrgId && requestedOrgId !== request.user.organizationId) {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Cannot access data from another organization',
    });
  }

  done();
}
