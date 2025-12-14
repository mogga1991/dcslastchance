// ============================================================================
// Audit Event Writer
// ============================================================================

import { query } from './db';
import { FastifyRequest } from 'fastify';

export interface AuditEventData {
  organizationId: string;
  userId?: string;
  eventType: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function writeAuditEvent(data: AuditEventData): Promise<void> {
  await query(
    `
    INSERT INTO audit_events (
      organization_id,
      user_id,
      event_type,
      entity_type,
      entity_id,
      metadata,
      ip_address,
      user_agent
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      data.organizationId,
      data.userId || null,
      data.eventType,
      data.entityType || null,
      data.entityId || null,
      JSON.stringify(data.metadata || {}),
      data.ipAddress || null,
      data.userAgent || null,
    ]
  );
}

export function auditFromRequest(
  request: FastifyRequest,
  eventType: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  if (!request.user) {
    return Promise.resolve();
  }

  return writeAuditEvent({
    organizationId: request.user.organizationId,
    userId: request.user.userId,
    eventType,
    entityType,
    entityId,
    metadata,
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'],
  });
}

// Common event types
export const AuditEventTypes = {
  // Auth
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',

  // Capability Evidence
  CAPABILITY_DOC_UPLOADED: 'capability.document.uploaded',
  CAPABILITY_DOC_DELETED: 'capability.document.deleted',
  CAPABILITY_FACT_EXTRACTED: 'capability.fact.extracted',
  CAPABILITY_FACT_VERIFIED: 'capability.fact.verified',

  // Bid Decision
  BID_DECISION_CALCULATED: 'bid.decision.calculated',
  BID_DECISION_UPDATED: 'bid.decision.updated',
  BID_GATE_OVERRIDDEN: 'bid.gate.overridden',

  // General
  ENTITY_CREATED: 'entity.created',
  ENTITY_UPDATED: 'entity.updated',
  ENTITY_DELETED: 'entity.deleted',
} as const;
