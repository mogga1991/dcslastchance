// ============================================================================
// Capability Evidence Routes
// ============================================================================

import { FastifyInstance } from 'fastify';
import {
  CreateCapabilityDocumentSchema,
  UploadCapabilityDocVersionSchema,
  CreateCompanyClaimSchema,
  UpdateCompanyClaimSchema,
} from '@govcon-os/shared';
import { query, transaction } from '../lib/db';
import { uploadFile } from '../lib/storage';
import { requireAuth, requireRoles } from '../middleware/rbac';
import { auditFromRequest, AuditEventTypes } from '../lib/audit';
import { UserRole } from '@govcon-os/shared';
import crypto from 'crypto';

export default async function capabilityRoutes(fastify: FastifyInstance) {
  // ============================================================================
  // Capability Documents
  // ============================================================================

  // Upload capability document
  fastify.post(
    '/capability-documents',
    {
      onRequest: [
        fastify.authenticate,
        requireRoles(UserRole.ADMIN, UserRole.CAPTURE_MANAGER, UserRole.PROPOSAL_MANAGER),
      ],
    },
    async (request, reply) => {
      const orgId = request.user!.organizationId;
      const userId = request.user!.userId;
      const body = CreateCapabilityDocumentSchema.parse(request.body);

      const result = await query(
        `
        INSERT INTO capability_documents (
          organization_id, title, doc_type, tags, created_by
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [orgId, body.title, body.doc_type, JSON.stringify(body.tags), userId]
      );

      const doc = result.rows[0];

      await auditFromRequest(
        request,
        AuditEventTypes.CAPABILITY_DOC_UPLOADED,
        'capability_document',
        doc.id
      );

      return doc;
    }
  );

  // Upload document version
  fastify.post(
    '/capability-documents/:id/versions',
    {
      onRequest: [
        fastify.authenticate,
        requireRoles(UserRole.ADMIN, UserRole.CAPTURE_MANAGER, UserRole.PROPOSAL_MANAGER),
      ],
    },
    async (request, reply) => {
      const orgId = request.user!.organizationId;
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };
      const body = UploadCapabilityDocVersionSchema.parse(request.body);

      // Verify document belongs to org
      const docCheck = await query(
        'SELECT id FROM capability_documents WHERE id = $1 AND organization_id = $2',
        [id, orgId]
      );

      if (docCheck.rows.length === 0) {
        return reply.status(404).send({ error: 'Document not found' });
      }

      // Decode base64 file data
      const fileBuffer = Buffer.from(body.file_data, 'base64');
      const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Upload to storage
      const storageKey = await uploadFile(
        body.file_name,
        fileBuffer,
        body.content_type
      );

      // Get next version number
      const versionResult = await query(
        'SELECT COALESCE(MAX(version), 0) + 1 as next_version FROM capability_document_versions WHERE capability_document_id = $1',
        [id]
      );
      const nextVersion = versionResult.rows[0].next_version;

      // Create version record
      const result = await query(
        `
        INSERT INTO capability_document_versions (
          organization_id, capability_document_id, version,
          file_name, content_type, size_bytes, sha256, storage_key, uploaded_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
        `,
        [
          orgId,
          id,
          nextVersion,
          body.file_name,
          body.content_type,
          body.size_bytes,
          sha256,
          storageKey,
          userId,
        ]
      );

      return result.rows[0];
    }
  );

  // List capability documents
  fastify.get(
    '/capability-documents',
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const orgId = request.user!.organizationId;
      const { doc_type, tags } = request.query as any;

      let queryStr = `
        SELECT cd.*,
               json_agg(
                 json_build_object(
                   'id', cdv.id,
                   'version', cdv.version,
                   'file_name', cdv.file_name,
                   'created_at', cdv.created_at
                 ) ORDER BY cdv.version DESC
               ) FILTER (WHERE cdv.id IS NOT NULL) as versions
        FROM capability_documents cd
        LEFT JOIN capability_document_versions cdv ON cdv.capability_document_id = cd.id
        WHERE cd.organization_id = $1
      `;
      const params: any[] = [orgId];

      if (doc_type) {
        params.push(doc_type);
        queryStr += ` AND cd.doc_type = $${params.length}`;
      }

      queryStr += ' GROUP BY cd.id ORDER BY cd.created_at DESC';

      const result = await query(queryStr, params);
      return result.rows;
    }
  );

  // ============================================================================
  // Capability Facts
  // ============================================================================

  // List capability facts
  fastify.get(
    '/capability-facts',
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const orgId = request.user!.organizationId;
      const { fact_type, verified } = request.query as any;

      let queryStr = `
        SELECT cf.*, cdv.file_name, cd.title as document_title
        FROM capability_facts cf
        JOIN capability_document_versions cdv ON cdv.id = cf.capability_document_version_id
        JOIN capability_documents cd ON cd.id = cdv.capability_document_id
        WHERE cf.organization_id = $1
      `;
      const params: any[] = [orgId];

      if (fact_type) {
        params.push(fact_type);
        queryStr += ` AND cf.fact_type = $${params.length}`;
      }

      if (verified !== undefined) {
        queryStr += verified === 'true'
          ? ' AND cf.verified_by IS NOT NULL'
          : ' AND cf.verified_by IS NULL';
      }

      queryStr += ' ORDER BY cf.created_at DESC';

      const result = await query(queryStr, params);
      return result.rows;
    }
  );

  // Verify capability fact
  fastify.patch(
    '/capability-facts/:id/verify',
    {
      onRequest: [
        fastify.authenticate,
        requireRoles(UserRole.ADMIN, UserRole.CAPTURE_MANAGER),
      ],
    },
    async (request, reply) => {
      const orgId = request.user!.organizationId;
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };

      const result = await query(
        `
        UPDATE capability_facts
        SET verified_by = $1, verified_at = NOW()
        WHERE id = $2 AND organization_id = $3
        RETURNING *
        `,
        [userId, id, orgId]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Fact not found' });
      }

      await auditFromRequest(
        request,
        AuditEventTypes.CAPABILITY_FACT_VERIFIED,
        'capability_fact',
        id
      );

      return result.rows[0];
    }
  );

  // ============================================================================
  // Company Claims
  // ============================================================================

  // Create company claim
  fastify.post(
    '/company-claims',
    {
      onRequest: [
        fastify.authenticate,
        requireRoles(UserRole.ADMIN, UserRole.CAPTURE_MANAGER),
      ],
    },
    async (request, reply) => {
      const orgId = request.user!.organizationId;
      const userId = request.user!.userId;
      const body = CreateCompanyClaimSchema.parse(request.body);

      const result = await query(
        `
        INSERT INTO company_claims (
          organization_id, claim_text, claim_type, supporting_facts, created_by
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          orgId,
          body.claim_text,
          body.claim_type,
          JSON.stringify(body.supporting_facts),
          userId,
        ]
      );

      return result.rows[0];
    }
  );

  // List company claims
  fastify.get(
    '/company-claims',
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const orgId = request.user!.organizationId;

      const result = await query(
        `
        SELECT * FROM company_claims
        WHERE organization_id = $1
        ORDER BY created_at DESC
        `,
        [orgId]
      );

      return result.rows;
    }
  );

  // Update company claim
  fastify.patch(
    '/company-claims/:id',
    {
      onRequest: [
        fastify.authenticate,
        requireRoles(UserRole.ADMIN, UserRole.CAPTURE_MANAGER),
      ],
    },
    async (request, reply) => {
      const orgId = request.user!.organizationId;
      const { id } = request.params as { id: string };
      const body = UpdateCompanyClaimSchema.parse(request.body);

      const updates: string[] = [];
      const params: any[] = [];

      if (body.claim_text !== undefined) {
        params.push(body.claim_text);
        updates.push(`claim_text = $${params.length}`);
      }

      if (body.status !== undefined) {
        params.push(body.status);
        updates.push(`status = $${params.length}`);
      }

      if (body.supporting_facts !== undefined) {
        params.push(JSON.stringify(body.supporting_facts));
        updates.push(`supporting_facts = $${params.length}`);
      }

      if (updates.length === 0) {
        return reply.status(400).send({ error: 'No updates provided' });
      }

      params.push(id, orgId);
      const result = await query(
        `
        UPDATE company_claims
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${params.length - 1} AND organization_id = $${params.length}
        RETURNING *
        `,
        params
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Claim not found' });
      }

      return result.rows[0];
    }
  );
}
